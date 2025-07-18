# ai_context_v3
"""
🎯 main_goal: Service for managing dream embeddings and similarity search
⚡ critical_requirements: 
   - Vector embeddings generation
   - Similarity search in pgvector
   - Batch processing support
   - Cache embeddings
📥 inputs_outputs: Dream text -> Vector embeddings -> Similar dreams
🔧 functions_list:
   - create_embedding: Generate embedding for text
   - find_similar_dreams: Search similar dreams by vector
   - batch_create_embeddings: Process multiple texts
   - update_dream_embedding: Update existing embedding
🚫 forbidden_changes: Do not change vector dimensions
🧪 tests: test_embedding_service.py
"""

from typing import List, Dict, Any, Optional, Tuple
from uuid import UUID

from loguru import logger
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession
import numpy as np

from app.services.ai.openai_service import OpenAIService
from app.models.db import Dream, DreamEmbedding, DreamInterpretation
from app.core.database import get_db


class EmbeddingService:
    """Service for managing dream vector embeddings"""
    
    def __init__(self):
        self.openai = OpenAIService()
        self.embedding_model = "text-embedding-ada-002"
        self.embedding_dimension = 1536
        
    async def create_embedding(
        self,
        text: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> List[float]:
        """Create embedding for dream text"""
        try:
            # Clean and prepare text
            clean_text = self._prepare_text_for_embedding(text)
            
            # Generate embedding
            embedding = await self.openai.create_embedding(
                text=clean_text,
                model=self.embedding_model
            )
            
            logger.info(f"Created embedding of dimension {len(embedding)}")
            return embedding
            
        except Exception as e:
            logger.error(f"Error creating embedding: {e}")
            raise
    
    def _prepare_text_for_embedding(self, text: str) -> str:
        """Prepare text for embedding generation"""
        # Remove extra whitespace
        text = " ".join(text.split())
        
        # Limit length to avoid token limits
        max_length = 8000  # Safe limit for ada-002
        if len(text) > max_length:
            text = text[:max_length] + "..."
            
        return text
    
    async def find_similar_dreams(
        self,
        query_embedding: List[float],
        limit: int = 10,
        user_id: Optional[UUID] = None,
        min_similarity: float = 0.7,
        db_session: AsyncSession = None
    ) -> List[Tuple[Dream, float]]:
        """Find similar dreams using vector similarity"""
        
        if db_session is None:
            async for session in get_db():
                return await self._search_similar_dreams(
                    session, query_embedding, limit, user_id, min_similarity
                )
        else:
            return await self._search_similar_dreams(
                db_session, query_embedding, limit, user_id, min_similarity
            )
    
    async def _search_similar_dreams(
        self,
        session: AsyncSession,
        query_embedding: List[float],
        limit: int,
        user_id: Optional[UUID],
        min_similarity: float
    ) -> List[Tuple[Dream, float]]:
        """Internal method to search similar dreams"""
        
        # Convert to numpy array for pgvector
        query_vector = np.array(query_embedding)
        
        # Build the similarity search query
        query = text("""
            SELECT 
                d.id,
                d.text,
                d.created_at,
                1 - (de.embedding <=> :query_vector) as similarity
            FROM dreams d
            JOIN vector_store.dream_embeddings de ON d.id = de.dream_id
            WHERE 
                d.is_deleted = false
                AND 1 - (de.embedding <=> :query_vector) >= :min_similarity
                {} -- user filter placeholder
            ORDER BY de.embedding <=> :query_vector
            LIMIT :limit
        """.format("AND d.user_id = :user_id" if user_id else ""))
        
        # Prepare parameters
        params = {
            "query_vector": query_vector.tolist(),
            "min_similarity": min_similarity,
            "limit": limit
        }
        if user_id:
            params["user_id"] = user_id
        
        # Execute query
        result = await session.execute(query, params)
        rows = result.fetchall()
        
        # Load full Dream objects with interpretations
        dreams_with_similarity = []
        for row in rows:
            dream = await session.get(Dream, row.id)
            if dream:
                dreams_with_similarity.append((dream, row.similarity))
        
        logger.info(f"Found {len(dreams_with_similarity)} similar dreams")
        return dreams_with_similarity
    
    async def update_dream_embedding(
        self,
        dream_id: UUID,
        dream_text: str,
        db_session: AsyncSession
    ) -> DreamEmbedding:
        """Update or create embedding for a dream"""
        try:
            # Generate embedding
            embedding = await self.create_embedding(dream_text)
            
            # Check if embedding exists
            existing = await db_session.execute(
                select(DreamEmbedding).where(
                    DreamEmbedding.dream_id == dream_id,
                    DreamEmbedding.model == self.embedding_model
                )
            )
            dream_embedding = existing.scalar_one_or_none()
            
            if dream_embedding:
                # Update existing
                dream_embedding.embedding = embedding
                logger.info(f"Updated embedding for dream {dream_id}")
            else:
                # Create new
                dream_embedding = DreamEmbedding(
                    dream_id=dream_id,
                    embedding=embedding,
                    model=self.embedding_model,
                    metadata={"text_length": len(dream_text)}
                )
                db_session.add(dream_embedding)
                logger.info(f"Created new embedding for dream {dream_id}")
            
            await db_session.commit()
            return dream_embedding
            
        except Exception as e:
            logger.error(f"Error updating dream embedding: {e}")
            await db_session.rollback()
            raise
    
    async def batch_create_embeddings(
        self,
        texts: List[str],
        batch_size: int = 20
    ) -> List[List[float]]:
        """Create embeddings for multiple texts in batches"""
        embeddings = []
        
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            
            # Process batch in parallel
            batch_embeddings = []
            for text in batch:
                embedding = await self.create_embedding(text)
                batch_embeddings.append(embedding)
            
            embeddings.extend(batch_embeddings)
            logger.info(f"Processed batch {i//batch_size + 1}/{(len(texts) + batch_size - 1)//batch_size}")
        
        return embeddings
    
    async def get_dream_context(
        self,
        dream_id: UUID,
        db_session: AsyncSession,
        context_size: int = 5
    ) -> Dict[str, Any]:
        """Get context from similar dreams for better interpretation"""
        
        # Get the dream and its embedding
        dream = await db_session.get(Dream, dream_id)
        if not dream:
            return {}
        
        embedding_result = await db_session.execute(
            select(DreamEmbedding).where(
                DreamEmbedding.dream_id == dream_id,
                DreamEmbedding.model == self.embedding_model
            )
        )
        dream_embedding = embedding_result.scalar_one_or_none()
        
        if not dream_embedding:
            return {}
        
        # Find similar dreams
        similar_dreams = await self.find_similar_dreams(
            query_embedding=dream_embedding.embedding,
            limit=context_size,
            user_id=dream.user_id,
            db_session=db_session
        )
        
        # Extract patterns from similar dreams
        symbols = []
        emotions = []
        themes = []
        
        for similar_dream, similarity in similar_dreams:
            if similar_dream.id == dream_id:
                continue
                
            if similar_dream.interpretation:
                symbols.append(similar_dream.interpretation.main_symbol)
                emotions.extend(similar_dream.interpretation.emotions)
        
        # Aggregate context
        context = {
            "similar_count": len(similar_dreams) - 1,  # Exclude self
            "common_symbols": list(set(symbols)),
            "recurring_emotions": self._aggregate_emotions(emotions),
            "average_similarity": np.mean([s for _, s in similar_dreams[1:]]) if len(similar_dreams) > 1 else 0
        }
        
        return context
    
    def _aggregate_emotions(self, emotions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Aggregate emotions from multiple dreams"""
        emotion_counts = {}
        
        for emotion_list in emotions:
            if isinstance(emotion_list, list):
                for emotion in emotion_list:
                    name = emotion.get("name", "unknown")
                    emotion_counts[name] = emotion_counts.get(name, 0) + 1
        
        # Sort by frequency
        sorted_emotions = sorted(
            emotion_counts.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        return [
            {"name": name, "frequency": count}
            for name, count in sorted_emotions[:5]
        ]