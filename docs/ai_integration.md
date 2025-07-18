# AI Integration Guide

## Overview

The Razgazdayson project uses OpenAI's GPT-4 for dream interpretation, Whisper for voice transcription, and text-embedding-ada-002 for semantic search.

## Components

### 1. OpenAIService (`app/services/ai/openai_service.py`)

Base service for all OpenAI API interactions:

- **Chat Completion**: GPT-4 responses with retry logic
- **Embeddings**: Vector generation for semantic search
- **Voice Transcription**: Whisper API for audio to text
- **Text-to-Speech**: Generate audio from interpretations

Key features:
- Redis caching with TTL
- Exponential backoff for rate limits
- Token counting for cost control
- Async operations

### 2. DreamInterpreter (`app/services/ai/dream_interpreter.py`)

Orchestrates the dream interpretation process:

```python
interpreter = DreamInterpreter()
interpretation = await interpreter.interpret_dream(
    dream_text="Мне снилось что я летаю...",
    user_context={"recent_themes": ["полет", "свобода"]},
    language="ru"
)
```

Features:
- Structured JSON responses
- Symbol extraction
- Emotion analysis
- Personalized advice
- Fallback handling

### 3. PromptTemplates (`app/services/ai/prompt_templates.py`)

Manages prompts for consistent AI responses:

- System prompts with psychological framework
- Multilingual support (RU/EN)
- JSON format enforcement
- Jungian archetype integration

### 4. EmbeddingService (`app/services/ai/embedding_service.py`)

Manages vector embeddings for semantic search:

```python
embedding_service = EmbeddingService()
similar_dreams = await embedding_service.find_similar_dreams(
    query_embedding=embedding,
    limit=5,
    min_similarity=0.75
)
```

Features:
- pgvector integration
- Batch embedding generation
- Dream context extraction
- Similarity threshold filtering

## Configuration

### Environment Variables

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.7

# Rate Limiting
RATE_LIMIT_PER_USER_DAILY=1000
RATE_LIMIT_GLOBAL_HOURLY=50000

# Caching
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
```

### Model Selection

- **GPT-4**: Primary model for interpretations
- **text-embedding-ada-002**: Vector embeddings (1536 dimensions)
- **whisper-1**: Voice transcription
- **tts-1**: Text-to-speech generation

## Prompt Engineering

### System Prompt Structure

```
Ты опытный психолог-аналитик снов с глубоким пониманием символизма...

ВАЖНО: Всегда отвечай в формате JSON:
{
    "main_symbol": "Главный символ",
    "main_symbol_emoji": "🌙",
    "interpretation": "Подробная интерпретация",
    "emotions": [...],
    "advice": "Персональный совет"
}
```

### Best Practices

1. **Consistency**: Always use structured prompts
2. **Context**: Include user history when available
3. **Validation**: Verify JSON responses
4. **Fallbacks**: Handle parsing errors gracefully
5. **Caching**: Cache responses by prompt hash

## Cost Optimization

### Token Usage

- Average dream: ~200 tokens
- Average interpretation: ~800 tokens
- Total per request: ~1000 tokens

### Caching Strategy

1. **Redis Cache**: 1-hour TTL for interpretations
2. **Prompt Hashing**: SHA256 of prompt+model
3. **Embedding Reuse**: Store in pgvector
4. **Batch Processing**: Group similar requests

### Cost Estimates

- GPT-4: $0.01 per 1K input tokens
- Embeddings: $0.0001 per 1K tokens
- Whisper: $0.006 per minute
- TTS: $0.015 per 1K characters

## Error Handling

### Rate Limits

```python
try:
    response = await openai_service.chat_completion(...)
except openai.RateLimitError:
    # Exponential backoff
    await asyncio.sleep(2 ** attempt)
```

### Invalid Responses

```python
try:
    data = json.loads(response["content"])
except json.JSONDecodeError:
    # Use fallback interpretation
    return await self._fallback_interpretation(...)
```

## Monitoring

### Metrics to Track

1. **Response Time**: Processing time per request
2. **Token Usage**: Daily/monthly consumption
3. **Cache Hit Rate**: Redis cache efficiency
4. **Error Rate**: API failures and retries
5. **Model Performance**: User satisfaction scores

### Logging

```python
logger.info(f"Dream interpreted in {processing_time_ms}ms")
logger.error(f"OpenAI API error: {e}")
```

## Testing

### Mock Responses

```python
@pytest.fixture
def mock_openai_response():
    return {
        "content": json.dumps({
            "main_symbol": "Полет",
            "interpretation": "Test interpretation"
        }),
        "usage": {"total_tokens": 1000}
    }
```

### Integration Tests

- Test with real API (limited)
- Verify response structure
- Check error handling
- Validate caching

## Future Enhancements

1. **Fine-tuning**: Custom model for dream symbols
2. **Multi-modal**: Image generation for dreams
3. **Streaming**: Real-time interpretation display
4. **Language Models**: Support for more languages
5. **A/B Testing**: Prompt optimization