# Инструкция по деплою на Vercel + Supabase 🚀

Чтобы твой проект ожил и стал доступен всем как Telegram Mini App, выполни эти шаги:

### 1. Подготовка в Supabase
1. Создай новый проект в [Supabase](https://supabase.com/).
2. Перейди в раздел **SQL Editor**.
3. Нажми **New Query**, вставь содержимое файла `supabase_schema.sql` и нажми **Run**. Это создаст все таблицы.
4. Перейди в **Project Settings** -> **API**.
5. Скопируй **Project URL** и **anon public key**.

### 2. Загрузка на GitHub
1. Создай новый репозиторий на GitHub.
2. Загрузи туда все файлы проекта (кроме папки `node_modules`).

### 3. Деплой на Vercel
1. Зайди на [Vercel](https://vercel.com/) и нажми **Add New** -> **Project**.
2. Импортируй свой репозиторий из GitHub.
3. В разделе **Environment Variables** (Переменные окружения) добавь две переменные:
   - `VITE_SUPABASE_URL` = (вставь свой Project URL)
   - `VITE_SUPABASE_ANON_KEY` = (вставь свой anon public key)
4. Нажми **Deploy**.

### 4. Настройка в Telegram (через @BotFather)
1. После завершения деплоя Vercel даст тебе ссылку (например, `https://marrythreads.vercel.app`).
2. Напиши `@BotFather` команду `/newbot` (если бота ещё нет).
3. Используй команду `/setmenubutton` или создай кнопку для Mini App.
4. Укажи свою ссылку от Vercel.

---

### Важные технические моменты:
- **SPA Routing**: Файл `vercel.json`, который я уже добавил, обеспечит правильную работу ссылок.
- **Vite Build**: Vercel автоматически распознает Vite и запустит `npm run build`.
- **Safe Zones**: Благодаря внедренному коду в `App.jsx`, приложение будет идеально выглядеть внутри Telegram сразу после деплоя.

Если возникнут сложности на любом этапе — пиши, я помогу! 🦾
