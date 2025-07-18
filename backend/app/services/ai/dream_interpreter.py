# ai_context_v3
"""
🎯 main_goal: Dream interpretation service using GPT-4
⚡ critical_requirements: 
   - Structured interpretation format
   - Symbol extraction
   - Emotion analysis
   - Personalized advice
📥 inputs_outputs: Dream text -> Interpretation with symbols and advice
🔧 functions_list:
   - interpret_dream: Main interpretation method
   - extract_symbols: Extract main symbols from dream
   - analyze_emotions: Detect emotional patterns
   - generate_advice: Create personalized recommendations
🚫 forbidden_changes: Do not change response structure
🧪 tests: test_dream_interpreter.py
"""

import json
from typing import Dict, Any, List, Optional
from datetime import datetime

from loguru import logger

from app.services.ai.openai_service import OpenAIService
from app.services.ai.prompt_templates import PromptTemplates
from app.models.schemas.dream import DreamInterpretation


class DreamInterpreter:
    """Service for interpreting dreams using AI"""
    
    def __init__(self):
        self.openai = OpenAIService()
        self.prompts = PromptTemplates()
        
    async def interpret_dream(
        self,
        dream_text: str,
        user_context: Optional[Dict[str, Any]] = None,
        language: str = "ru",
        include_similar: bool = True
    ) -> DreamInterpretation:
        """
        Interpret a dream and return structured analysis
        
        Args:
            dream_text: The dream description
            user_context: Optional user history/preferences
            language: Language for interpretation
            include_similar: Whether to analyze similar dreams
            
        Returns:
            DreamInterpretation schema with full analysis
        """
        start_time = datetime.now()
        
        try:
            # Build the interpretation prompt
            system_prompt = self.prompts.get_system_prompt(language)
            user_prompt = self.prompts.build_interpretation_prompt(
                dream_text=dream_text,
                user_context=user_context,
                language=language
            )
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
            
            # Get AI interpretation
            response = await self.openai.chat_completion(
                messages=messages,
                model="gpt-4-turbo-preview",
                temperature=0.7,
                max_tokens=2000
            )
            
            # Parse JSON response
            interpretation_data = json.loads(response["content"])
            
            # Calculate processing time
            processing_time_ms = int((datetime.now() - start_time).total_seconds() * 1000)
            
            # Create interpretation object
            interpretation = DreamInterpretation(
                dream_id=None,  # Will be set when saving
                main_symbol=interpretation_data["main_symbol"],
                main_symbol_emoji=interpretation_data.get("main_symbol_emoji", "🌙"),
                interpretation=interpretation_data["interpretation"],
                emotions=interpretation_data.get("emotions", []),
                advice=interpretation_data.get("advice", ""),
                ai_model=response["model"],
                prompt_version="v1.0",
                processing_time_ms=processing_time_ms
            )
            
            logger.info(f"Dream interpreted successfully in {processing_time_ms}ms")
            return interpretation
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response as JSON: {e}")
            # Fallback to basic interpretation
            return await self._fallback_interpretation(dream_text, processing_time_ms)
            
        except Exception as e:
            logger.error(f"Error interpreting dream: {e}")
            raise
    
    async def _fallback_interpretation(
        self, 
        dream_text: str, 
        processing_time_ms: int
    ) -> DreamInterpretation:
        """Fallback interpretation if JSON parsing fails"""
        return DreamInterpretation(
            dream_id=None,
            main_symbol="Сон",
            main_symbol_emoji="💭",
            interpretation="Ваш сон содержит важные символы, которые требуют внимательного анализа. "
                          "К сожалению, полная интерпретация временно недоступна. "
                          "Попробуйте описать сон более подробно или обратитесь позже.",
            emotions=[{"name": "неопределенность", "intensity": "средняя"}],
            advice="Запишите детали сна, пока они свежи в памяти. "
                   "Обратите внимание на эмоции, которые вы испытывали во сне.",
            ai_model="gpt-4-turbo-preview",
            prompt_version="v1.0",
            processing_time_ms=processing_time_ms
        )
    
    async def extract_symbols(
        self,
        dream_text: str,
        max_symbols: int = 5
    ) -> List[Dict[str, str]]:
        """Extract main symbols from dream text"""
        prompt = self.prompts.build_symbol_extraction_prompt(dream_text, max_symbols)
        
        messages = [
            {"role": "system", "content": "You are a dream symbol extraction expert."},
            {"role": "user", "content": prompt}
        ]
        
        response = await self.openai.chat_completion(
            messages=messages,
            temperature=0.5,
            max_tokens=500
        )
        
        try:
            symbols = json.loads(response["content"])
            return symbols.get("symbols", [])
        except:
            return []
    
    async def analyze_emotions(
        self,
        dream_text: str
    ) -> List[Dict[str, Any]]:
        """Analyze emotional patterns in the dream"""
        prompt = self.prompts.build_emotion_analysis_prompt(dream_text)
        
        messages = [
            {"role": "system", "content": "You are an expert in dream emotion analysis."},
            {"role": "user", "content": prompt}
        ]
        
        response = await self.openai.chat_completion(
            messages=messages,
            temperature=0.6,
            max_tokens=300
        )
        
        try:
            emotions = json.loads(response["content"])
            return emotions.get("emotions", [])
        except:
            return []
    
    async def generate_advice(
        self,
        dream_text: str,
        interpretation: str,
        user_context: Optional[Dict[str, Any]] = None
    ) -> str:
        """Generate personalized advice based on dream interpretation"""
        prompt = self.prompts.build_advice_prompt(
            dream_text=dream_text,
            interpretation=interpretation,
            user_context=user_context
        )
        
        messages = [
            {"role": "system", "content": "You are a supportive dream counselor."},
            {"role": "user", "content": prompt}
        ]
        
        response = await self.openai.chat_completion(
            messages=messages,
            temperature=0.7,
            max_tokens=300
        )
        
        try:
            advice_data = json.loads(response["content"])
            return advice_data.get("advice", "")
        except:
            return response["content"]