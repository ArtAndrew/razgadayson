# Руководство по развертыванию

## Быстрый деплой

### Автоматический деплой (рекомендуется)

При каждом push в ветку `main` автоматически запускается GitHub Actions workflow, который:
1. Собирает новые Docker образы
2. Останавливает старые контейнеры
3. Запускает новые контейнеры
4. Проверяет здоровье сервисов

### Ручной деплой

```bash
cd /root/razgazdayson
./scripts/deploy.sh
```

## Детальная инструкция

### 1. Подготовка

```bash
# Перейти в директорию проекта
cd /root/razgazdayson

# Получить последние изменения
git pull origin main
```

### 2. Сборка Docker образов

```bash
cd docker
docker-compose -f docker-compose.production.yml build
```

### 3. Обновление контейнеров

```bash
# Остановить старые контейнеры
docker-compose -f docker-compose.production.yml stop

# Удалить старые контейнеры
docker-compose -f docker-compose.production.yml rm -f

# Запустить новые контейнеры
docker-compose -f docker-compose.production.yml up -d
```

### 4. Проверка работоспособности

```bash
# Проверить статус контейнеров
docker-compose -f docker-compose.production.yml ps

# Проверить логи
docker-compose -f docker-compose.production.yml logs -f frontend
docker-compose -f docker-compose.production.yml logs -f backend

# Проверить доступность сайта
curl -I https://razgadayson.ru
```

## GitHub Actions

### Настройка секретов

В настройках репозитория добавьте следующие секреты:

- `SSH_HOST` - IP адрес или домен сервера
- `SSH_USER` - имя пользователя для SSH (обычно root)
- `SSH_KEY` - приватный SSH ключ для доступа к серверу

### Структура workflow

Файл `.github/workflows/deploy.yml` содержит:
- Триггер на push в main ветку
- SSH подключение к серверу
- Автоматическую сборку и деплой
- Проверку здоровья сервисов

## Откат изменений

В случае проблем с новой версией:

```bash
# Посмотреть историю образов
docker images | grep razgazdayson

# Откатиться на предыдущую версию
docker-compose -f docker-compose.production.yml down
docker tag <OLD_IMAGE_ID> docker-frontend:latest
docker-compose -f docker-compose.production.yml up -d
```

## Мониторинг

### Просмотр логов

```bash
# Все сервисы
docker-compose -f docker-compose.production.yml logs -f

# Конкретный сервис
docker-compose -f docker-compose.production.yml logs -f frontend
docker-compose -f docker-compose.production.yml logs -f backend
docker-compose -f docker-compose.production.yml logs -f nginx
```

### Проверка ресурсов

```bash
# CPU и память контейнеров
docker stats

# Дисковое пространство
df -h
docker system df
```

## Troubleshooting

### Ошибка 502 Bad Gateway

1. Проверьте, что все контейнеры запущены:
   ```bash
   docker ps
   ```

2. Проверьте логи nginx:
   ```bash
   docker logs razgazdayson_nginx
   ```

3. Убедитесь, что используется правильная конфигурация nginx:
   - Должна использоваться `nginx-docker.conf`
   - В ней должны быть правильные upstream (frontend:3000, backend:8000)

### Контейнер не запускается

1. Проверьте логи:
   ```bash
   docker logs <container_name>
   ```

2. Проверьте сборку образа:
   ```bash
   docker-compose -f docker-compose.production.yml build --no-cache <service_name>
   ```

### Нет места на диске

```bash
# Очистить неиспользуемые образы и контейнеры
docker system prune -a

# Очистить логи
truncate -s 0 /var/lib/docker/containers/*/*-json.log
```

## Безопасность

1. **SSL сертификаты** обновляются автоматически через Certbot
2. **Секреты** хранятся в `.env.production` файлах
3. **Доступ** ограничен через SSH ключи
4. **Бэкапы** базы данных создаются ежедневно

## Контакты

При возникновении проблем обращайтесь:
- Telegram: @your_telegram
- Email: admin@razgazdayson.ru