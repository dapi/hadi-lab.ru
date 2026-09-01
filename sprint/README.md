# HADI Sprint AI

Статический прототип HADI-спринта для `sprint.hadi-lab.ru`.

- Работает целиком в браузере: данные никуда не отправляются и не сохраняются.
- Создаёт детерминированную HADI-карточку из контекста, фокуса и горизонта.
- Экспортирует Markdown локально.
- Не является сервисом валидации рынка: вывод делается только по реальным данным пользователя.

## Проверка

Требуется Node.js (без пакетов):

```bash
node sprint/test.mjs
```

## Локальный контейнер

```bash
docker build -t hadi-sprint-ai:local .
docker run --rm -p 8080:8080 hadi-sprint-ai:local
curl http://localhost:8080/healthz
```

Откройте `http://localhost:8080`.

## Доставка

Образ собирается для `linux/amd64`, публикуется в `registry.brandymint.ru/dapi/hadi-sprint-ai:<git-sha>` и разворачивается через канонический Helmfile-контур `goga-infra`. Публичный ingress предназначен для `sprint.hadi-lab.ru`; DNS этой зоны обслуживается вне репозитория инфраструктуры.
