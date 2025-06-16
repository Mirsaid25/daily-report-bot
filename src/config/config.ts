import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
  DB_ID: process.env.NOTION_DATABASE_ID!,
  GROUP_ID: process.env.GROUP_CHAT_ID!,
  ADMIN_ID: process.env.ADMIN_ID!,
  TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN!,
  NOTION_TOKEN: process.env.NOTION_TOKEN!,
  TIME: {
    MORNING_QUESTION: '0 21 * * *',
    REMINDER_1: '0 22 * * *',
    REMINDER_2: '0 23 * * *',
    EVENING_REPORT: '59 23 * * *',
    TIMEZONE: 'Asia/Tashkent',
  },
  MESSAGES: {
    GREETING: `👋 Привет! Я бот для ежедневных отчетов. Я буду присылать вопросы в 21:00 и собирать ответы в 00:00.`,
    QUESTION: (date: string) => `📝 *Дневной отчет на ${date}*\n\nПожалуйста, ответь на вопросы:\n\n1. Что ты сделал?\n2. Что ты не сделал?\n3. Что тебе мешало?\n4. Что планируешь завтра?\n\n*Формат ответа:*\n1. Твой ответ\n2. Твой ответ\n3. Твой ответ\n4. Твой ответ\n\n_Можно ответить в любое время до 00:00_`,
    CONFIRMATION: (name: string) => `✅ *${name}*, твой отчет сохранен!\nСпасибо за участие!`,
    REMINDER: (count: number) => `⏰ *Напоминание*\n\nЕще не отправили отчет: ${count} человек(а)\n\nПожалуйста, ответьте на вопросы из утреннего сообщения.`,
    SUMMARY: (count: number, date: string) => `📊 *Итоги за ${date}*\n\nОтчеты отправили: ${count} человек(а)\n\nСпасибо всем за участие!`,
    HELP: `<b>Помощь:</b>\n\n• Отправь ответ в формате:\n1. Твой ответ\n2. Твой ответ\n3. Твой ответ\n4. Твой ответ\n\n• Можно редактировать сообщение\n• Новый ответ заменяет старый\n\nВопросы? Пиши <a href="https://t.me/lanigiro28">администратору</a>`,
    ERROR_FORMAT: `❌ *Неверный формат*\n\nПожалуйста, используй правильный формат:\n1. Твой ответ\n2. Твой ответ\n3. Твой ответ\n4. Твой ответ\n\nИли нажми "Помощь" для инструкции`,
    REPORT_COMMAND: `📌 Чтобы отправить отчет, просто напиши сообщение в формате:\n1. ...\n2. ...\n3. ...\n4. ...\n\nИли ответь (reply) на это сообщение`,
  }
};