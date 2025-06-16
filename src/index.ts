import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import { bot, botHandlers } from './bot/bot';
import { setupScheduler } from './scheduler/scheduler';
import { botFunctions } from './bot/functions';
import { logger } from './core/logger';
import { CONFIG } from './config/config';

async function main() {
  try {
    // === Инициализация команд и расписаний (оно будет работать в фоне) ===
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

    // === Express HTTP-сервер ===
    const app = express();
    app.use(express.json()); // для парсинга JSON от Telegram

    const port = CONFIG.PORT || 10000;
    const host = '0.0.0.0';

    // Путь, на который Telegram будет шлать обновления:
    const webhookPath = `/webhook/${CONFIG.TELEGRAM_TOKEN}`;
    const serviceUrl = CONFIG.SERVICE_URL!; 
    // SERVICE_URL = https://your-app.onrender.com — задайте в Render Dashboard как ENV

    // Устанавливаем вебхук в Telegram
    await bot.telegram.setWebhook(`${serviceUrl}${webhookPath}`);
    logger.info(`Webhook set to ${serviceUrl}${webhookPath}`);

    // Маршрут для Telegram обновлений
    app.post(webhookPath, (req: Request, res: Response) => {
      bot.handleUpdate(req.body, res).catch((err) => {
        logger.error('handleUpdate error:', err);
        res.sendStatus(500);
      });
    });

    // «Проверка здоровья» (Render смотрит на `/`)
    app.get('/', (_req: Request, res: Response, _next: NextFunction) => {
      res.send('OK');
    });

    app.listen(port, host, () => {
      logger.info(`HTTP server listening on ${host}:${port}`);
    });

    logger.info('🤖 Bot webhook launched');
  } catch (err) {
    logger.error('Startup error:', err);
    process.exit(1);
  }
}

main();