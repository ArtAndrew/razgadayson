# ai_context_v3
"""
🎯 main_goal: OpenAI API integration service
⚡ critical_requirements: 
   - Async operations
   - Error handling with retries
   - Rate limiting respect
   - Response caching
📥 inputs_outputs: Prompts -> AI responses
🔧 functions_list: 
   - chat_completion: Get GPT-4 response
   - create_embedding: Generate text embeddings
   - transcribe_audio: Convert voice to text
   - text_to_speech: Generate audio from text
🚫 forbidden_changes: Do not expose API keys
🧪 tests: test_openai_service.py
"""

import hashlib
import json
from typing import List, Dict, Any, Optional
import asyncio
from datetime import datetime, timedelta

import openai
from openai import AsyncOpenAI
from loguru import logger
import tiktoken

from app.core.config import settings
from app.core.redis import get_redis
from app.models.schemas.common import ErrorResponse


class OpenAIService:
    """Service for OpenAI API interactions"""
    
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.redis = None
        self.encoding = tiktoken.encoding_for_model("gpt-4")
        
    async def _get_redis(self):
        """Lazy Redis connection getter"""
        if self.redis is None:
            self.redis = await get_redis()
        return self.redis
        
    def _generate_cache_key(self, prompt: str, model: str) -> str:
        """Generate cache key from prompt and model"""
        prompt_hash = hashlib.sha256(f"{prompt}:{model}".encode()).hexdigest()
        return f"ai_cache:{model}:{prompt_hash}"
    
    async def _get_cached_response(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """Get cached response from Redis"""
        try:
            redis = await self._get_redis()
            cached = await redis.get(cache_key)
            if cached:
                logger.debug(f"Cache hit for key: {cache_key}")
                return json.loads(cached)
        except Exception as e:
            logger.error(f"Redis cache error: {e}")
        return None
    
    async def _cache_response(
        self, 
        cache_key: str, 
        response: Dict[str, Any], 
        ttl_seconds: int = 3600
    ) -> None:
        """Cache response in Redis"""
        try:
            redis = await self._get_redis()
            await redis.setex(
                cache_key,
                ttl_seconds,
                json.dumps(response, ensure_ascii=False)
            )
            logger.debug(f"Cached response for key: {cache_key}")
        except Exception as e:
            logger.error(f"Redis cache write error: {e}")
    
    def count_tokens(self, text: str) -> int:
        """Count tokens in text"""
        return len(self.encoding.encode(text))
    
    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: str = "gpt-4-turbo-preview",
        temperature: float = 0.7,
        max_tokens: int = 2000,
        use_cache: bool = True,
        cache_ttl: int = 3600,
        retry_count: int = 3
    ) -> Dict[str, Any]:
        """Get chat completion from OpenAI"""
        
        # Generate cache key if caching is enabled
        cache_key = None
        if use_cache:
            prompt_text = json.dumps(messages, sort_keys=True)
            cache_key = self._generate_cache_key(prompt_text, model)
            
            # Check cache
            cached = await self._get_cached_response(cache_key)
            if cached:
                return cached
        
        # Retry logic for API calls
        last_error = None
        for attempt in range(retry_count):
            try:
                start_time = datetime.now()
                
                response = await self.client.chat.completions.create(
                    model=model,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    response_format={"type": "json_object"}
                )
                
                processing_time_ms = int((datetime.now() - start_time).total_seconds() * 1000)
                
                result = {
                    "content": response.choices[0].message.content,
                    "model": response.model,
                    "usage": {
                        "prompt_tokens": response.usage.prompt_tokens,
                        "completion_tokens": response.usage.completion_tokens,
                        "total_tokens": response.usage.total_tokens
                    },
                    "processing_time_ms": processing_time_ms,
                    "finish_reason": response.choices[0].finish_reason
                }
                
                # Cache successful response
                if use_cache and cache_key:
                    await self._cache_response(cache_key, result, cache_ttl)
                
                logger.info(f"OpenAI completion successful: {result['usage']['total_tokens']} tokens")
                return result
                
            except openai.RateLimitError as e:
                logger.warning(f"Rate limit error, attempt {attempt + 1}/{retry_count}")
                if attempt < retry_count - 1:
                    await asyncio.sleep(2 ** attempt)  # Exponential backoff
                last_error = e
                
            except openai.APIError as e:
                logger.error(f"OpenAI API error: {e}")
                last_error = e
                if attempt < retry_count - 1:
                    await asyncio.sleep(1)
                    
            except Exception as e:
                logger.error(f"Unexpected error in chat_completion: {e}")
                last_error = e
                break
        
        # All retries failed
        raise Exception(f"Failed after {retry_count} attempts: {last_error}")
    
    async def create_embedding(
        self,
        text: str,
        model: str = "text-embedding-ada-002"
    ) -> List[float]:
        """Create text embedding for vector search"""
        try:
            response = await self.client.embeddings.create(
                model=model,
                input=text
            )
            
            embedding = response.data[0].embedding
            logger.info(f"Created embedding of dimension {len(embedding)}")
            return embedding
            
        except Exception as e:
            logger.error(f"Error creating embedding: {e}")
            raise
    
    async def transcribe_audio(
        self,
        audio_file: bytes,
        language: str = "ru"
    ) -> str:
        """Transcribe audio to text using Whisper"""
        try:
            response = await self.client.audio.transcriptions.create(
                model="whisper-1",
                file=("audio.webm", audio_file),
                language=language
            )
            
            logger.info(f"Transcribed audio successfully: {len(response.text)} chars")
            return response.text
            
        except Exception as e:
            logger.error(f"Error transcribing audio: {e}")
            raise
    
    async def text_to_speech(
        self,
        text: str,
        voice: str = "nova",  # nova, alloy, echo, fable, onyx, shimmer
        model: str = "tts-1",
        speed: float = 1.0
    ) -> bytes:
        """Convert text to speech"""
        try:
            response = await self.client.audio.speech.create(
                model=model,
                voice=voice,
                input=text,
                speed=speed
            )
            
            audio_data = response.content
            logger.info(f"Generated TTS audio: {len(audio_data)} bytes")
            return audio_data
            
        except Exception as e:
            logger.error(f"Error in text-to-speech: {e}")
            raise