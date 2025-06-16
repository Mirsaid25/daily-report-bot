import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import { bot, botHandlers } from './bot/bot';
import { setupScheduler } from './scheduler/scheduler';
import { botFunctions } from './bot/functions';
import { logger } from './core/logger';
import { CONFIG } from './config/config';

async function main() {
  try {
    // === Инициализация бота ===
    await botHandlers.getGroupMembers().init();
    botHandlers.setupCommands();
    setupScheduler(botFunctions);

    bot.catch((err) => {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.error('Bot error:', errorMessage);
      if (CONFIG.ADMIN_ID) {
        bot.telegram
          .sendMessage(CONFIG.ADMIN_ID, `⚠️ Ошибка в боте:\n\n${errorMessage}`)
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

    // === HTTP-сервер для Render ===
    const app = express();

    // Render по умолчанию выставляет PORT=10000, но можно переопределить в Dashboard
    const port = Number(process.env.PORT) || 10000;
    const host = '0.0.0.0';

    app.get('/', (req: Request, res: Response, next: NextFunction) => {
      res.send('OK');
    });

    app.listen(port, host, () => {
      logger.info(`HTTP server listening on ${host}:${port}`);
    });
  } catch (err) {
    logger.error('Startup error:', err);
    process.exit(1);
  }
}

main();
