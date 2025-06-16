import 'dotenv/config';
import { bot, botHandlers } from './bot/bot';
import { setupScheduler } from './scheduler/scheduler';
import { botFunctions } from './bot/functions';
import { logger } from './core/logger';
import { CONFIG } from './config/config';

async function main() {
  try {
    await botHandlers.getGroupMembers().init();
    botHandlers.setupCommands();
    setupScheduler(botFunctions);

    bot.catch((err) => {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.error('Bot error:', errorMessage);
      if (CONFIG.ADMIN_ID) {
        bot.telegram.sendMessage(CONFIG.ADMIN_ID, `⚠️ Ошибка в боте:\n\n${errorMessage}`)
          .catch((e) => logger.error('Failed to notify admin:', e));
      }
    });

    ['SIGINT', 'SIGTERM'].forEach((signal) =>
      process.once(signal, () => {
        logger.info(`${signal} received. Shutting down...`);
        bot.stop(signal);
        process.exit(0);
      })
    );

    await bot.launch();
    logger.info('🤖 Bot started');
  } catch (err) {
    logger.error('Startup error:', err);
    process.exit(1);
  }
}

main();
