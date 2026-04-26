# Grocery list

Невеликий застосунок для списків покупок: **Angular** + **[json-server](https://github.com/typicode/json-server)** (REST з `db.json`).

## Що потрібно

- Node.js (див. `packageManager` у `package.json`)
- Залежності: `npm install`

## Як запустити

**API і фронт разом** (рекомендовано):

```bash
npm run dev
```

- API: `http://localhost:3000` (дані з кореневого `db.json`)
- Застосунок: `http://localhost:4200` → редірект на `/lists` (перший список або `/lists/new`, якщо списків немає)

**Окремо в двох терміналах:**

```bash
npm run api
```

```bash
npm start
```

Без API інтерфейс відкриється, але збереження даних не працюватиме.

URL бекенду задається в `src/environments/environment.ts`.

## Інші команди

| Команда           | Призначення                |
| ----------------- | -------------------------- |
| `npm run build`   | Продакшн-збірка в `dist/`  |
| `npm test`        | Юніт-тести (Vitest), watch |
| `npm run test:ci` | Тести один прогін (CI)     |
| `npm run lint`    | ESLint                     |

## Мова інтерфейсу

За замовчуванням — **українська**. Перемикач **УКР / EN** у шапці; вибір зберігається в `localStorage` під ключем `lang` (`en` або все інше → укр).
