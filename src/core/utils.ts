import { Telegraf } from 'telegraf';
import moment from 'moment-timezone';
import { CONFIG } from '../config/config';
import { logger } from './logger';
import { Context } from 'telegraf';
import { Answer } from '../types';

moment.locale('ru');

export const utils = {
  sendMessage: async (
    bot: Telegraf<Context>,
    chatId: number | string,
    text: string,
    extras: object = {}
  ) => {
    try {
      return await bot.telegram.sendMessage(chatId, text, {
        parse_mode: 'Markdown',
        ...extras,
      });
    } catch (err: any) {
      logger.error('Failed to send message:', { chatId, error: err.message });
      return null;
    }
  },

  getFormattedDate: () => moment().tz(CONFIG.TIME.TIMEZONE).format('LL'),

  validateAnswer: (message: string): Answer | null => {
    if (!message || message.startsWith('/')) return null;

    try {
      const lines = message
        .split('\n')
        .filter((line) => line.trim())
        .slice(0, 3);

      if (lines.length < 3) return null;

      const answer: Answer = {
        q1: lines[0].replace(/^1[\.\)]\s*/, '').trim(),
        q2: lines[1].replace(/^2[\.\)]\s*/, '').trim(),
        q3: lines[2].replace(/^3[\.\)]\s*/, '').trim(),
      };

      return answer.q1 && answer.q2 && answer.q3 ? answer : null;
    } catch (err) {
      logger.error('Validation error:', err);
      return null;
    }
  },

  sendThanks: async (ctx: Context) => {
    try {
      await new Promise((resolve) =>
        setTimeout(resolve, 3000 + Math.random() * 7000)
      );
      await ctx.replyWithMarkdown(CONFIG.MESSAGES.THANKS);
    } catch (err: any) {
      logger.error('Failed to send thanks:', err);
    }
  },
};
