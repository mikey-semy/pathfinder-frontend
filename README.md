# PathFinder

Система расчета маршрутов волочения стальной проволоки. Веб-приложение для технологов и инженеров металлургических предприятий.

## Возможности

- Расчет технологических маршрутов волочения
- Поддержка различных марок стали (K70-K90)
- Расчет по блокам: диаметры, обжатия, скорости, усилия, мощности
- Визуализация результатов (графики)
- Экспорт в Excel и печать/PDF
- История расчетов с локальным хранением
- Адаптивный интерфейс (desktop/mobile)
- Светлая и темная тема

## Технологии

- **Next.js 15** - React фреймворк с App Router
- **TypeScript** - строгая типизация
- **Tailwind CSS v4** - стилизация
- **shadcn/ui** - UI компоненты
- **Recharts** - графики
- **Zustand** - state management
- **React Hook Form + Zod** - формы и валидация

## Быстрый старт

### Разработка

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

### Production сборка

```bash
npm run build
npm start
```

### Docker

```bash
docker build -t pathfinder .
docker run -p 3000:3000 pathfinder
```

## Структура проекта

```
pathfinder-frontend/
├── app/                      # Next.js App Router
├── src/
│   ├── entities/             # Бизнес-сущности
│   │   └── calculation/      # Движок расчетов
│   ├── features/             # Фичи приложения
│   │   ├── calculation-form/ # Форма ввода
│   │   ├── calculation-history/
│   │   ├── results-display/  # Таблицы результатов
│   │   ├── results-charts/   # Графики
│   │   └── results-export/   # Экспорт
│   └── shared/               # Общие компоненты
│       ├── ui/
│       └── store/
├── components/ui/            # shadcn/ui компоненты
└── docs/                     # Документация
```

## Документация

- [Быстрый старт](docs/QUICK_START.md)
- [Описание функций](docs/FEATURES.md)
- [Верификация формул](docs/FORMULA_VERIFICATION.md)

## Лицензия

MIT
