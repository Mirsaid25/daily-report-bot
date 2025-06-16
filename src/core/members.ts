import { Telegraf, Context } from 'telegraf';
import { GroupMember } from '../types';
import { CONFIG } from '../config/config';
import { logger } from './logger';

export class GroupMembers {
  private membersMap = new Map<number, GroupMember>();
  private adminIds = new Set<number>();
  private botId: number | null = null;

  constructor(private bot: Telegraf<Context>) { }

  async init() {
    try {
      const me = await this.bot.telegram.getMe();
      this.botId = me.id;

      const admins = await this.bot.telegram.getChatAdministrators(CONFIG.GROUP_ID);
      this.adminIds = new Set(admins.map(a => a.user.id));

      logger.info('Bot initialized with admins', { adminCount: this.adminIds.size });
    } catch (err: any) {
      logger.error('Failed to initialize GroupMembers', err);
    }
  }

  async handleNewMembers(ctx: Context) {
    const update = ctx.update as any;

    const newMembers = update.message?.new_chat_members;
    if (!newMembers || !Array.isArray(newMembers)) return;

    for (const user of newMembers) {
      if (user.is_bot) continue;
      this.membersMap.set(user.id, {
        id: user.id,
        name: user.first_name || user.username || 'unknown',
        isAdmin: this.adminIds.has(user.id),
      });
    }
  }

  handleLeftMember(ctx: Context) {
    const update = ctx.update as any;

    const user = update.message?.left_chat_member;
    if (!user || user.is_bot) return;

    this.membersMap.delete(user.id);
  }


  addIfNotExists(user: { id: number; first_name?: string; username?: string; is_bot?: boolean }) {
    if (!this.membersMap.has(user.id) && !user.is_bot) {
      this.membersMap.set(user.id, {
        id: user.id,
        name: user.first_name || user.username || 'unknown',
        isAdmin: this.adminIds.has(user.id),
      });
    }
  }

  getMembers(): GroupMember[] {
    return Array.from(this.membersMap.values()).filter(
      m => !m.isAdmin && m.id !== this.botId
    );
  }

  async isAdmin(userId: number): Promise<boolean> {
    return this.adminIds.has(userId);
  }
}
