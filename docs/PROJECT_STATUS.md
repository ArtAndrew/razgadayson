# Статус проекта "Разгадай Сон"

**Дата обновления:** 19.07.2025

## Текущий статус сервисов

### ✅ Работающие сервисы:
- **PostgreSQL** (pgvector/pgvector:pg16) - статус: healthy
- **Redis** (redis:7-alpine) - статус: healthy
- **Frontend** (Next.js) - работает, доступен через nginx
  - Главная страница отображается корректно
  - SEO-оптимизированная структура
  - Готовы формы ввода сна
- **Backend** (FastAPI) - работает стабильно ✅
  - Все проблемы с SQLAlchemy UUID типами исправлены
  - API доступен через nginx
  - Health check работает корректно
  
- **Telegram WebApp** - не собирается из-за конфликта зависимостей
  - Ошибка: `Cannot find module 'ajv/dist/compile/codegen'`
  - Требуется обновление зависимостей или downgrade react-scripts

- **Telegram Bot** - не запущен (зависит от backend)

### ⚠️ Сервисы с проблемами:
- **Telegram WebApp** - не собирается из-за конфликта зависимостей
  - Ошибка: `Cannot find module 'ajv/dist/compile/codegen'`
  - Требуется обновление зависимостей или downgrade react-scripts

- **Telegram Bot** - не запущен (зависит от backend)

- **Nginx** - работает частично ✅
  - Обслуживает frontend и backend
  - Telegram WebApp не подключен из-за ошибок сборки

## Выполненные исправления (19.07.2025)

### Исправления проблем с SQLAlchemy UUID типами:

1. **Удален неиспользуемый файл:**
   - Удален `backend/app/models/db/base_patch.py`

2. **Исправлен unique constraint в ai_cache.py:**
   - Добавлен импорт `UniqueConstraint`
   - Исправлен синтаксис с `{"unique_constraint": ...}` на `UniqueConstraint(...)`

3. **Исправлено наследование UserStats:**
   - Изменено наследование с `StatsBase` на `Base`
   - Добавлен `__table_args__ = {'extend_existing': True}`
   - Удален локальный класс `StatsBase`

4. **Исправлен __tablename__ в DreamInterpretation:**
   - Убран декоратор `@property` 
   - Сделан обычный атрибут класса

5. **Унифицированы импорты UUID:**
   - Во всех моделях изменено с `from uuid import UUID as PythonUUID` на `from uuid import UUID`
   - Изменены типы с `Mapped[PythonUUID]` на `Mapped[UUID]`

6. **Исправлен ForeignKey в DreamEmbedding:**
   - Убрано явное указание схемы с `"public.dreams.id"` на `"dreams.id"`

### Результат:
- Backend теперь запускается и работает стабильно ✅
- Все worker процессы успешно стартуют
- База данных и Redis подключаются корректно

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