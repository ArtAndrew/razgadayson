# Статус проекта "Разгадай Сон"

**Дата обновления:** 19.07.2025

## Текущий статус сервисов

### ✅ Работающие сервисы:
- **PostgreSQL** (pgvector/pgvector:pg16) - статус: healthy
- **Redis** (redis:7-alpine) - статус: healthy
- **Frontend** (Next.js) - работает, доступен по внутреннему IP
  - Главная страница отображается корректно
  - SEO-оптимизированная структура
  - Готовы формы ввода сна

### ⚠️ Сервисы с проблемами:
- **Backend** (FastAPI) - перезапускается из-за ошибок SQLAlchemy
  - Проблема с наследованием моделей и UUID типами
  - Требуется дополнительная отладка структуры моделей
  
- **Telegram WebApp** - не собирается из-за конфликта зависимостей
  - Ошибка: `Cannot find module 'ajv/dist/compile/codegen'`
  - Требуется обновление зависимостей или downgrade react-scripts

- **Telegram Bot** - не запущен (зависит от backend)

- **Nginx** - не запущен (зависит от telegram-webapp в текущей конфигурации)

## Выполненные исправления

1. **Добавлены недостающие зависимости:**
   - `prometheus-fastapi-instrumentator==6.1.0` в backend/requirements.txt

2. **Исправлены типы UUID в моделях:**
   - Изменено с `Mapped[UUID]` на `Mapped[PythonUUID]` во всех моделях
   - Обновлены импорты для корректной работы с UUID

3. **Обновлены конфигурации:**
   - Изменен пароль PostgreSQL на безопасный без специальных символов
   - Обновлены все .env файлы
   - Добавлен docker/.env для переменных окружения

4. **Частичное исправление Telegram WebApp:**
   - Добавлен флаг `--legacy-peer-deps` в Dockerfile

## Следующие шаги

1. **Исправить структуру наследования в SQLAlchemy моделях:**
   - Пересмотреть базовый класс Base
   - Исправить конфликт с UserStats моделью
   - Возможно, использовать abstract base classes

2. **Решить проблемы с Telegram WebApp:**
   - Обновить package.json с правильными версиями зависимостей
   - Или использовать другую версию react-scripts

3. **Запустить Nginx:**
   - Изменить docker-compose чтобы не зависеть от telegram-webapp
   - Или запустить отдельно с правильной конфигурацией

4. **Настроить проксирование портов:**
   - Пробросить порты для доступа извне
   - Настроить SSL сертификаты

## Команды для проверки

```bash
# Проверка статуса контейнеров
sudo docker ps -a

# Проверка логов backend
sudo docker logs razgazdayson_backend --tail 50

# Проверка работы frontend (внутренний IP)
curl http://172.18.0.5:3000/

# Перезапуск сервисов
sudo docker-compose -f docker/docker-compose.production.yml restart [service_name]
```

## Структура проекта

```
razgazdayson/
├── backend/          # FastAPI backend (проблемы с запуском)
├── frontend/         # Next.js frontend (работает)
├── telegram-webapp/  # React WebApp (не собирается)
├── telegram-bot/     # Python bot (не запущен)
├── docker/          # Docker конфигурации
├── configs/         # Конфигурации Nginx и др.
└── docs/           # Документация проекта
```