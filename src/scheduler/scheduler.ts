import cron from 'node-cron';
import { CONFIG } from '../config/config';
import { logger } from '../core/logger';

interface BotFunctions {
  sendMorningQuestions: () => Promise<void>;
  sendReminder: () => Promise<void>;
  sendReportsToNotion: () => Promise<void>;
}

export function setupScheduler(functions: BotFunctions) {
  cron.schedule(CONFIG.TIME.MORNING_QUESTION, functions.sendMorningQuestions, {
    timezone: CONFIG.TIME.TIMEZONE,
  });
  cron.schedule(CONFIG.TIME.REMINDER_1, functions.sendReminder, {
    timezone: CONFIG.TIME.TIMEZONE,
  });
  cron.schedule(CONFIG.TIME.REMINDER_2, functions.sendReminder, {
    timezone: CONFIG.TIME.TIMEZONE,
  });
  cron.schedule(CONFIG.TIME.EVENING_REPORT, functions.sendReportsToNotion, {
    timezone: CONFIG.TIME.TIMEZONE,
  });

  logger.info('Scheduler setup completed');
}
