# ai_context_v3
"""
🎯 main_goal: Prompt templates for dream interpretation
⚡ critical_requirements: 
   - Structured JSON output
   - Multilingual support
   - Consistent formatting
   - Professional psychological approach
📥 inputs_outputs: Dream data -> Formatted prompts
🔧 functions_list:
   - get_system_prompt: System instructions
   - build_interpretation_prompt: Main interpretation prompt
   - build_symbol_extraction_prompt: Symbol analysis
   - build_emotion_analysis_prompt: Emotion detection
🚫 forbidden_changes: Do not change JSON structure
🧪 tests: test_prompt_templates.py
"""

from typing import Dict, Any, Optional


class PromptTemplates:
    """Templates for OpenAI prompts in dream interpretation"""
    
    def get_system_prompt(self, language: str = "ru") -> str:
        """Get system prompt for dream interpretation"""
        if language == "ru":
            return """Ты опытный психолог-аналитик снов с глубоким пониманием символизма, архетипов Юнга и современной психологии. 
Твоя задача - предоставлять глубокий, осмысленный и поддерживающий анализ снов.

ВАЖНО: Всегда отвечай в формате JSON со следующей структурой:
{
    "main_symbol": "Главный символ сна",
    "main_symbol_emoji": "Эмодзи символа",
    "interpretation": "Подробная интерпретация сна",
    "emotions": [
        {"name": "эмоция", "intensity": "низкая/средняя/высокая", "meaning": "значение"}
    ],
    "advice": "Персонализированный совет",
    "tags": ["тег1", "тег2", "тег3"]
}

Правила интерпретации:
1. Будь внимательным и эмпатичным
2. Избегай категоричных утверждений
3. Учитывай культурный контекст
4. Предлагай конструктивные инсайты
5. Не давай медицинских диагнозов"""
        else:
            return """You are an experienced dream analyst with deep understanding of symbolism, Jungian archetypes, and modern psychology.
Your task is to provide deep, meaningful, and supportive dream analysis.

IMPORTANT: Always respond in JSON format with the following structure:
{
    "main_symbol": "Main dream symbol",
    "main_symbol_emoji": "Symbol emoji",
    "interpretation": "Detailed dream interpretation",
    "emotions": [
        {"name": "emotion", "intensity": "low/medium/high", "meaning": "significance"}
    ],
    "advice": "Personalized advice",
    "tags": ["tag1", "tag2", "tag3"]
}

Interpretation rules:
1. Be attentive and empathetic
2. Avoid categorical statements
3. Consider cultural context
4. Offer constructive insights
5. Don't provide medical diagnoses"""
    
    def build_interpretation_prompt(
        self,
        dream_text: str,
        user_context: Optional[Dict[str, Any]] = None,
        language: str = "ru"
    ) -> str:
        """Build prompt for dream interpretation"""
        
        context_info = ""
        if user_context:
            if user_context.get("recent_themes"):
                themes = ", ".join(user_context["recent_themes"])
                context_info = f"\nЧастые темы в снах пользователя: {themes}"
            if user_context.get("streak_days"):
                context_info += f"\nПользователь записывает сны {user_context['streak_days']} дней подряд"
        
        if language == "ru":
            return f"""Проанализируй следующий сон:

"{dream_text}"
{context_info}

Предоставь глубокую психологическую интерпретацию этого сна. Обрати внимание на:
1. Главный символ или образ сна
2. Эмоциональную окраску и скрытые чувства
3. Возможные связи с реальной жизнью
4. Архетипические паттерны
5. Потенциальные инсайты для личностного роста

Ответ должен быть в формате JSON, как указано в системном промпте."""
        
        else:
            return f"""Analyze the following dream:

"{dream_text}"
{context_info}

Provide a deep psychological interpretation of this dream. Pay attention to:
1. The main symbol or image of the dream
2. Emotional coloring and hidden feelings
3. Possible connections to real life
4. Archetypal patterns
5. Potential insights for personal growth

Response must be in JSON format as specified in the system prompt."""
    
    def build_symbol_extraction_prompt(
        self,
        dream_text: str,
        max_symbols: int = 5
    ) -> str:
        """Build prompt for symbol extraction"""
        return f"""Extract the {max_symbols} most significant symbols from this dream:

"{dream_text}"

Return JSON format:
{{
    "symbols": [
        {{"symbol": "symbol name", "emoji": "emoji", "significance": "brief meaning"}}
    ]
}}"""
    
    def build_emotion_analysis_prompt(self, dream_text: str) -> str:
        """Build prompt for emotion analysis"""
        return f"""Analyze the emotional patterns in this dream:

"{dream_text}"

Identify emotions present in the dream and their intensity. Return JSON format:
{{
    "emotions": [
        {{"name": "emotion", "intensity": "low/medium/high", "context": "where it appears"}}
    ]
}}"""
    
    def build_advice_prompt(
        self,
        dream_text: str,
        interpretation: str,
        user_context: Optional[Dict[str, Any]] = None
    ) -> str:
        """Build prompt for personalized advice"""
        context = ""
        if user_context:
            context = f"\nUser context: {user_context}"
        
        return f"""Based on this dream and its interpretation, provide supportive and actionable advice.

Dream: "{dream_text}"
Interpretation: "{interpretation}"{context}

Return JSON format:
{{
    "advice": "Your personalized recommendation"
}}"""