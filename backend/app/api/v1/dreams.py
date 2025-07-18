# ai_context_v3
"""
🎯 main_goal: Dream interpretation endpoints
⚡ critical_requirements:
   - Text and voice input support
   - AI interpretation with GPT-4
   - Rate limiting for free users
   - Dream journal CRUD
📥 inputs_outputs: Dream text/audio -> Interpretation
🔧 functions_list:
   - interpret_dream: Submit and interpret new dream
   - get_dreams: List user's dreams
   - get_dream: Get specific dream
   - save_dream: Save interpretation to journal
   - delete_dream: Delete dream
🚫 forbidden_changes: Do not bypass rate limits
🧪 tests: test_dreams.py with AI mock tests
"""

from typing import Annotated, Optional, List
from uuid import UUID
from datetime import datetime
import base64

from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from sqlalchemy.orm import selectinload
from loguru import logger

from app.core.database import get_db
from app.core.redis import get_redis
from app.models.db import User, Dream, DreamInterpretation as DreamInterpretationDB
from app.models.schemas.dream import (
    DreamInterpretRequest,
    DreamInterpretResponse,
    DreamResponse,
    DreamCreate,
    DreamUpdate
)
from app.models.schemas.common import PaginatedResponse, SuccessResponse
from app.api.dependencies import (
    get_current_active_user,
    check_dream_limit,
    increment_dream_count,
    get_pagination,
    get_optional_user
)
from app.services.ai import DreamInterpreter, EmbeddingService, OpenAIService

router = APIRouter()


@router.post("/interpret", response_model=DreamInterpretResponse)
async def interpret_dream(
    request: DreamInterpretRequest,
    user: Annotated[User, Depends(check_dream_limit)],
    db: Annotated[AsyncSession, Depends(get_db)],
    redis = Depends(get_redis)
):
    """
    Interpret a dream using AI
    
    This endpoint:
    1. Validates the dream text/audio
    2. Checks user's daily limit
    3. Processes with GPT-4
    4. Returns interpretation
    5. Optionally saves to journal
    """
    
    # Process voice input if provided
    dream_text = request.text
    if request.voice_data:
        try:
            # Decode base64 audio
            audio_data = base64.b64decode(request.voice_data)
            
            # Transcribe using Whisper
            openai_service = OpenAIService()
            dream_text = await openai_service.transcribe_audio(
                audio_data,
                language=request.language
            )
            
            logger.info(f"Transcribed voice input: {len(dream_text)} chars")
            
        except Exception as e:
            logger.error(f"Voice transcription error: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to process voice input"
            )
    
    # Validate dream text length
    if len(dream_text) < 20:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dream description must be at least 20 characters"
        )
    
    if len(dream_text) > 4000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dream description must not exceed 4000 characters"
        )
    
    try:
        # Create dream interpreter
        interpreter = DreamInterpreter()
        
        # Get user context for better interpretation
        user_context = None
        if request.include_similar:
            # Get user's recent dreams for context
            recent_dreams = await db.execute(
                select(Dream)
                .where(and_(
                    Dream.user_id == user.id,
                    Dream.is_deleted == False
                ))
                .order_by(Dream.created_at.desc())
                .limit(5)
            )
            recent_themes = []
            for dream in recent_dreams.scalars():
                if dream.interpretation and dream.interpretation.main_symbol:
                    recent_themes.append(dream.interpretation.main_symbol)
            
            if recent_themes:
                user_context = {
                    "recent_themes": list(set(recent_themes)),
                    "total_dreams": len(recent_themes)
                }
        
        # Interpret the dream
        interpretation = await interpreter.interpret_dream(
            dream_text=dream_text,
            user_context=user_context,
            language=request.language,
            include_similar=request.include_similar
        )
        
        # Create dream record
        dream = Dream(
            user_id=user.id,
            text=dream_text,
            language=request.language
        )
        db.add(dream)
        await db.flush()  # Get the ID
        
        # Save interpretation
        interpretation.dream_id = dream.id
        interpretation_db = DreamInterpretationDB(
            dream_id=dream.id,
            main_symbol=interpretation.main_symbol,
            main_symbol_emoji=interpretation.main_symbol_emoji,
            interpretation=interpretation.interpretation,
            emotions=interpretation.emotions,
            advice=interpretation.advice,
            ai_model=interpretation.ai_model,
            prompt_version=interpretation.prompt_version,
            processing_time_ms=interpretation.processing_time_ms
        )
        db.add(interpretation_db)
        
        # Save dream embedding for similarity search
        if request.include_similar:
            embedding_service = EmbeddingService()
            await embedding_service.update_dream_embedding(
                dream_id=dream.id,
                dream_text=dream_text,
                db_session=db
            )
        
        # Increment user's daily count
        await increment_dream_count(user.id, redis)
        
        # Commit transaction
        await db.commit()
        
        # Get similar dreams if requested
        similar_dreams = []
        if request.include_similar:
            embedding_service = EmbeddingService()
            similar_results = await embedding_service.find_similar_dreams(
                query_embedding=await embedding_service.create_embedding(dream_text),
                limit=5,
                user_id=user.id,
                min_similarity=0.75,
                db_session=db
            )
            
            for similar_dream, similarity in similar_results:
                if similar_dream.id != dream.id:
                    similar_dreams.append({
                        "id": str(similar_dream.id),
                        "text": similar_dream.text[:200] + "...",
                        "main_symbol": similar_dream.interpretation.main_symbol if similar_dream.interpretation else None,
                        "similarity": round(similarity, 2),
                        "created_at": similar_dream.created_at.isoformat()
                    })
        
        # Calculate remaining daily limit
        active_sub = user.active_subscription
        daily_limit = active_sub.daily_limit if active_sub else 1
        today_key = f"dream_count:{user.id}:{datetime.now().date()}"
        dreams_today_str = await redis.get(today_key)
        dreams_today = int(dreams_today_str) if dreams_today_str else 1
        daily_limit_remaining = max(0, daily_limit - dreams_today)
        
        # Return response
        return DreamInterpretResponse(
            dream_id=dream.id,
            interpretation=interpretation,
            similar_dreams=similar_dreams[:3],  # Top 3 similar
            daily_limit_remaining=daily_limit_remaining,
            is_saved=True
        )
        
    except Exception as e:
        logger.error(f"Dream interpretation error: {e}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to interpret dream"
        )


@router.get("/", response_model=PaginatedResponse[DreamResponse])
async def get_dreams(
    user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    pagination: Annotated[dict, Depends(get_pagination)],
    search: Optional[str] = Query(None, description="Search in dream text"),
    tag: Optional[str] = Query(None, description="Filter by tag")
):
    """Get user's dream journal with pagination"""
    
    # Build query
    query = select(Dream).where(
        and_(
            Dream.user_id == user.id,
            Dream.is_deleted == False
        )
    )
    
    # Add search filter
    if search:
        query = query.where(Dream.text.ilike(f"%{search}%"))
    
    # Add tag filter if implemented
    # if tag:
    #     query = query.join(DreamTag).where(DreamTag.tag == tag)
    
    # Order by date
    query = query.order_by(Dream.created_at.desc())
    
    # Get total count
    count_query = select(func.count()).select_from(Dream).where(
        and_(
            Dream.user_id == user.id,
            Dream.is_deleted == False
        )
    )
    if search:
        count_query = count_query.where(Dream.text.ilike(f"%{search}%"))
    
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination
    query = query.offset(pagination["offset"]).limit(pagination["limit"])
    
    # Load with interpretation
    query = query.options(selectinload(Dream.interpretation))
    
    # Execute query
    result = await db.execute(query)
    dreams = result.scalars().all()
    
    # Convert to response
    dream_responses = []
    for dream in dreams:
        dream_responses.append(DreamResponse(
            id=dream.id,
            text=dream.text,
            voice_url=dream.voice_url,
            language=dream.language,
            created_at=dream.created_at,
            interpretation=dream.interpretation,
            tags=[],  # TODO: Load tags
            similar_dreams_count=0
        ))
    
    return PaginatedResponse.create(
        items=dream_responses,
        total=total,
        page=pagination["page"],
        limit=pagination["limit"]
    )


@router.get("/{dream_id}", response_model=DreamResponse)
async def get_dream(
    dream_id: UUID,
    user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Get specific dream by ID"""
    
    # Get dream with interpretation
    result = await db.execute(
        select(Dream)
        .options(selectinload(Dream.interpretation))
        .where(and_(
            Dream.id == dream_id,
            Dream.user_id == user.id,
            Dream.is_deleted == False
        ))
    )
    dream = result.scalar_one_or_none()
    
    if not dream:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dream not found"
        )
    
    # Get similar dreams count
    embedding_service = EmbeddingService()
    context = await embedding_service.get_dream_context(
        dream_id=dream.id,
        db_session=db,
        context_size=10
    )
    
    return DreamResponse(
        id=dream.id,
        text=dream.text,
        voice_url=dream.voice_url,
        language=dream.language,
        created_at=dream.created_at,
        interpretation=dream.interpretation,
        tags=[],  # TODO: Load tags
        similar_dreams_count=context.get("similar_count", 0)
    )


@router.put("/{dream_id}")
async def update_dream(
    dream_id: UUID,
    update_data: DreamUpdate,
    user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Update dream (edit text or soft delete)"""
    
    # Get dream
    dream = await db.get(Dream, dream_id)
    
    if not dream or dream.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dream not found"
        )
    
    # Update fields
    if update_data.text is not None:
        dream.text = update_data.text
        
        # Update embedding if text changed
        embedding_service = EmbeddingService()
        await embedding_service.update_dream_embedding(
            dream_id=dream.id,
            dream_text=update_data.text,
            db_session=db
        )
    
    if update_data.is_deleted is not None:
        dream.is_deleted = update_data.is_deleted
    
    await db.commit()
    
    return SuccessResponse(
        message="Dream updated successfully"
    )


@router.delete("/{dream_id}")
async def delete_dream(
    dream_id: UUID,
    user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Permanently delete dream"""
    
    # Get dream
    dream = await db.get(Dream, dream_id)
    
    if not dream or dream.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dream not found"
        )
    
    # Hard delete
    await db.delete(dream)
    await db.commit()
    
    return SuccessResponse(
        message="Dream deleted permanently"
    )


@router.post("/{dream_id}/tts", response_model=dict)
async def generate_tts(
    dream_id: UUID,
    user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    voice: str = Query("nova", description="Voice to use")
):
    """Generate TTS audio for dream interpretation"""
    
    # Check if user has TTS access
    active_sub = user.active_subscription
    if not active_sub or active_sub.type == "free":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="TTS feature requires Pro subscription"
        )
    
    # Get dream with interpretation
    result = await db.execute(
        select(Dream)
        .options(selectinload(Dream.interpretation))
        .where(and_(
            Dream.id == dream_id,
            Dream.user_id == user.id
        ))
    )
    dream = result.scalar_one_or_none()
    
    if not dream or not dream.interpretation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dream interpretation not found"
        )
    
    try:
        # Generate TTS
        openai_service = OpenAIService()
        audio_data = await openai_service.text_to_speech(
            text=dream.interpretation.interpretation,
            voice=voice
        )
        
        # Encode to base64 for response
        audio_base64 = base64.b64encode(audio_data).decode()
        
        return {
            "audio": audio_base64,
            "format": "mp3",
            "voice": voice
        }
        
    except Exception as e:
        logger.error(f"TTS generation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate audio"
        )