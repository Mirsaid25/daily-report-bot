import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
  DB_ID: process.env.NOTION_DATABASE_ID!,
  GROUP_ID: process.env.GROUP_CHAT_ID!,
  ADMIN_ID: process.env.ADMIN_ID!,
  TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN!,
  NOTION_TOKEN: process.env.NOTION_TOKEN!,
  TIME: {
    MORNING_QUESTION: '20 19 * * *',
    REMINDER_1: '06 20 * * *',
    REMINDER_2: '22 19 * * *',
    EVENING_REPORT: '30 20 * * *',
    TIMEZONE: 'Asia/Tashkent',
  },
  MESSAGES: {
    GREETING: `👋 Привет! Я бот для ежедневных отчетов. Я буду присылать вопросы утром и собирать ответы вечером.`,
    QUESTION: (date: string) => `📝 *Дневной отчет на ${date}*\n\nПожалуйста, ответь на вопросы:\n\n1. Что сегодня сделал?\n2. С какими проблемами столкнулся?\n3. Какие планы на завтра?\n\n*Формат ответа:*\n1. Твой ответ\n2. Твой ответ\n3. Твой ответ\n\n_Можно ответить в любое время до 20:00_`,
    CONFIRMATION: (name: string) => `✅ *${name}*, твой отчет сохранен!\nСпасибо за участие!`,
    REMINDER: (count: number) => `⏰ *Напоминание*\n\nЕще не отправили отчет: ${count} человек(а)\n\nПожалуйста, ответьте на вопросы из утреннего сообщения.`,
    SUMMARY: (count: number, date: string) => `📊 *Итоги за ${date}*\n\nОтчеты отправили: ${count} человек(а)\n\nСпасибо всем за участие!`,
    HELP: `<b>Помощь:</b>\n\n• Отправь ответ в формате:\n1. Твой ответ\n2. Твой ответ\n3. Твой ответ\n\n• Можно редактировать сообщение\n• Новый ответ заменяет старый\n\nВопросы? Пиши <a href="https://t.me/Mirsaid_25">администратору</a>`,
    ERROR_FORMAT: `❌ *Неверный формат*\n\nПожалуйста, используй правильный формат:\n1. Твой ответ\n2. Твой ответ\n3. Твой ответ\n\nИли нажми "Помощь" для инструкции`,
    THANKS: `🙏 Спасибо, что делаешь наш процесс прозрачнее!`,
    REPORT_COMMAND: `📌 Чтобы отправить отчет, просто напиши сообщение в формате:\n1. ...\n2. ...\n3. ...\n\nИли ответь (reply) на это сообщение`,
  }
};