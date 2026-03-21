import db from '../../infrastructure/db';
import { v4 as uuidv4 } from 'uuid';

export interface Case {
  id: string;
  user_id: string;
  cnr_number: string;
  title?: string;
  court_name?: string;
  status: string;
  next_hearing_date?: string;
  sync_status: string;
}

export const CaseRepository = {
  create(caseData: Partial<Case>): Case {
    const id = uuidv4();
    const { user_id, cnr_number, title, court_name, status = 'PENDING', next_hearing_date, sync_status = 'PENDING' } = caseData;
    
    db.prepare(`
      INSERT INTO cases (id, user_id, cnr_number, title, court_name, status, next_hearing_date, sync_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, user_id, cnr_number, title, court_name, status, next_hearing_date, sync_status);

    return db.prepare('SELECT * FROM cases WHERE id = ?').get(id) as Case;
  },

  findByUserId(userId: string): Case[] {
    return db.prepare('SELECT * FROM cases WHERE user_id = ? AND deleted_at IS NULL').all(userId) as Case[];
  },

  updateSyncStatus(id: string, status: string, data: Partial<Case>) {
    const { title, court_name, next_hearing_date } = data;
    db.prepare(`
      UPDATE cases 
      SET sync_status = ?, title = ?, court_name = ?, next_hearing_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, title, court_name, next_hearing_date, id);
  }
};
