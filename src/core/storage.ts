import { v4 as uuidv4 } from 'uuid';
import { Answer } from '../types';

export interface StoredAnswer extends Answer {
  id: string;
  name: string;
  timestamp: number;
}

export class AnswersStorage {
  private storage = new Map<number, StoredAnswer>();
  private reportMessageId: number | null = null;

  set(userId: number, data: Omit<StoredAnswer, 'id' | 'timestamp'>) {
    this.storage.set(userId, {
      ...data,
      id: uuidv4(),
      timestamp: Date.now(),
    });
  }

  get(userId: number): StoredAnswer | undefined {
    return this.storage.get(userId);
  }

  getAll(): StoredAnswer[] {
    return Array.from(this.storage.values());
  }

  getMissingMembers(members: Array<{ id: number; name?: string }>): { id: number; name: string }[] {
    return members
      .filter((m) => !this.storage.has(m.id))
      .map((m) => ({ id: m.id, name: m.name || 'Unknown' }));
  }


  setReportMessageId(messageId: number) {
    this.reportMessageId = messageId;
  }

  getReportMessageId(): number | null {
    return this.reportMessageId;
  }

  clear() {
    this.storage.clear();
  }
}
