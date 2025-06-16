import { Telegraf, Markup, Context } from 'telegraf';
import { CONFIG } from '../config/config';
import { AnswersStorage } from '../core/storage';
import { GroupMembers } from '../core/members';
import { utils } from '../core/utils';
import { logger } from '../core/logger';

export const bot = new Telegraf<Context>(CONFIG.TELEGRAM_TOKEN);
const storage = new AnswersStorage();
const groupMembers = new GroupMembers(bot);

export const botHandlers = {
  setupCommands() {
    bot.start(async (ctx) => {
      const keyboard = Markup.inlineKeyboard([
        Markup.button.callback('Помощь', 'help'),
        Markup.button.callback('Пример отчета', 'example'),
      ]);
      await ctx.replyWithMarkdown(CONFIG.MESSAGES.GREETING, {
        reply_markup: keyboard.reply_markup,
      }).catch((err) => logger.error('Start error', err));
    });

    bot.command('report', async (ctx) => {
      const keyboard = Markup.inlineKeyboard([
        Markup.button.callback('Помощь', 'help'),
      ]);
      const msg = await ctx.replyWithMarkdown(CONFIG.MESSAGES.REPORT_COMMAND, {
        reply_markup: keyboard.reply_markup,
      });
      if (ctx.chat.id.toString() === CONFIG.GROUP_ID && msg) {
        storage.setReportMessageId(msg.message_id);
      }
    });

    bot.command('stats', async (ctx) => {
      const members = groupMembers.getMembers();
      
      if (!groupMembers.isAdmin(ctx.from?.id!)) {
        return ctx.reply('⛔ Эта команда только для администраторов');
      }
      const missing = storage.getMissingMembers(members);
      const date = utils.getFormattedDate();

      let message = `📊 *Статус отчетов на ${date}*\n\n`;
      message += `✅ Отправили: ${members.length - missing.length}/${members.length}\n`;
      message += `⏳ Осталось: ${missing.length}\n\n`;
      if (missing.length > 0) {
        message += `*Не отправили:*\n`;
        message += missing.map(m => `- [${m.name}](tg://user?id=${m.id})`).join('\n');
      }
      await ctx.replyWithMarkdown(message);
    });

    bot.on('text', async (ctx) => {
      if (ctx.from) groupMembers.addIfNotExists(ctx.from);
      const userId = ctx.from?.id!;
      const name = ctx.from?.first_name || ctx.from?.username || 'unknown';
      if (ctx.chat.id.toString() !== CONFIG.GROUP_ID || ctx.message.text.startsWith('/')) return;

      const isReply = ctx.message.reply_to_message?.message_id === storage.getReportMessageId();
      const parsed = utils.validateAnswer(ctx.message.text);

      if (!isReply || !parsed) return;
      if (!parsed) {
        await ctx.replyWithMarkdown(CONFIG.MESSAGES.ERROR_FORMAT, {
          reply_markup: Markup.inlineKeyboard([Markup.button.callback('Помощь', 'help')]).reply_markup,
        });
        return;
      }

      storage.set(userId, { name, ...parsed });
      await ctx.replyWithMarkdown(CONFIG.MESSAGES.CONFIRMATION(name));
    });

    bot.on('new_chat_members', (ctx) => groupMembers.handleNewMembers(ctx));
    bot.on('left_chat_member', (ctx) => groupMembers.handleLeftMember(ctx));

    bot.action('help', async (ctx) => {
      await ctx.editMessageText(CONFIG.MESSAGES.HELP, {
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
      });
    });

    bot.action('example', async (ctx) => {
      await ctx.editMessageText(
        `*Пример отчета:*\n\n1. Завершил работу над модулем X, провел код-ревью\n2. Возникли сложности с интеграцией Y API\n3. Планирую начать реализацию фичи Z\n4. Планирую начать реализацию фичи Z`,
        { parse_mode: 'Markdown' }
      );
    });

    logger.info('Bot commands setup completed');
  },

  getStorage: () => storage,
  getGroupMembers: () => groupMembers,
};
