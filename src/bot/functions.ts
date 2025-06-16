import { bot } from './bot';
import { Markup } from 'telegraf';
import { CONFIG } from '../config/config';
import { utils } from '../core/utils';
import { logger } from '../core/logger';
import { Client } from '@notionhq/client';
import { botHandlers } from './bot';

const notion = new Client({ auth: CONFIG.NOTION_TOKEN });
const storage = botHandlers.getStorage();
const groupMembers = botHandlers.getGroupMembers();

export const botFunctions = {
  async sendMorningQuestions() {
    try {
      storage.clear();
      const date = utils.getFormattedDate();
      const keyboard = Markup.inlineKeyboard([
        Markup.button.callback('Помощь', 'help'),
        Markup.button.callback('Пример отчета', 'example'),
      ]);
      const msg = await utils.sendMessage(bot, CONFIG.GROUP_ID, CONFIG.MESSAGES.QUESTION(date), {
        reply_markup: keyboard.reply_markup,
      });
      if (msg) {
        storage.setReportMessageId(msg.message_id);
      }
    } catch (err) {
      logger.error('Morning question error:', err);
    }
  },

  async sendReminder() {
    try {
      const missing = storage.getMissingMembers(groupMembers.getMembers());
      if (missing.length === 0) return;

      const mentionList = missing
        .map((m) => `- [${m.name}](tg://user?id=${m.id})`)
        .join('\n');

      const message =
        `⏰ *Напоминание*

Еще не отправили отчет: ${missing.length} человек(а)

Пожалуйста, ответьте на утренний вопрос!

*Не отправили:*
${mentionList}`;

      await bot.telegram.sendMessage(CONFIG.GROUP_ID, message, {
        parse_mode: 'Markdown',
        link_preview_options: { is_disabled: true },
      });

      logger.info(`Reminder sent to group: ${missing.length} pending`);
    } catch (err) {
      logger.error('Reminder error:', err);
    }
  },

  async sendReportsToNotion() {
    try {
      const reports = storage.getAll();
      if (reports.length === 0) {
        await utils.sendMessage(bot, CONFIG.GROUP_ID, 'ℹ️ Сегодня отчетов не было');
        return;
      }

      const date = utils.getFormattedDate();
      const dateISO = new Date().toISOString();
      let successCount = 0;

      await Promise.all(
        reports.map(async (r) => {
          try {
            await notion.pages.create({
              parent: { database_id: CONFIG.DB_ID },
              properties: {
                'Имя': { title: [{ text: { content: r.name } }] },
                'Что сделал': { rich_text: [{ text: { content: r.q1 } }] },
                'Проблемы': { rich_text: [{ text: { content: r.q2 } }] },
                'Что будет делать': { rich_text: [{ text: { content: r.q3 } }] },
                'Дата': { date: { start: dateISO } },
              },
            });
            successCount++;
          } catch (e) {
            logger.error('Notion error:', e);
          }
        })
      );

      await utils.sendMessage(bot, CONFIG.GROUP_ID, CONFIG.MESSAGES.SUMMARY(successCount, date));
      storage.clear();
    } catch (err) {
      logger.error('Notion export error:', err);
    }
  },
};
