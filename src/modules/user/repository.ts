import db from '../../infrastructure/db';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  phone: string;
  language_code: string;
  persona?: string;
  state_code?: string;
  tier: string;
  queries_today: number;
}

export const UserRepository = {
  findById(id: string): User | undefined {
    return db.prepare('SELECT * FROM users WHERE id = ? AND deleted_at IS NULL').get(id) as User | undefined;
  },

  findByPhone(phone: string): User | undefined {
    return db.prepare('SELECT * FROM users WHERE phone = ? AND deleted_at IS NULL').get(phone) as User | undefined;
  },

  create(userData: Partial<User>): User {
    const id = uuidv4();
    const { phone, language_code = 'hi', persona, state_code, tier = 'FREE' } = userData;
    
    db.prepare(`
      INSERT INTO users (id, phone, language_code, persona, state_code, tier)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, phone, language_code, persona, state_code, tier);

    return this.findById(id)!;
  },

  updateTier(id: string, tier: string) {
    db.prepare('UPDATE users SET tier = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(tier, id);
  },

  incrementQueries(id: string) {
    db.prepare('UPDATE users SET queries_today = queries_today + 1 WHERE id = ?').run(id);
  },

  resetDailyQueries() {
    db.prepare('UPDATE users SET queries_today = 0, queries_reset_at = CURRENT_TIMESTAMP').run();
  }
};
