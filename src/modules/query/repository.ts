import db from '../../infrastructure/db';
import { v4 as uuidv4 } from 'uuid';

export interface Query {
  id: string;
  user_id: string;
  input_text: string;
  language_code: string;
  answer_text?: string;
  citation_act?: string;
  citation_section?: string;
  citation_verified?: boolean;
  escalation_flag?: boolean;
  disclaimer_appended?: boolean;
  latency_ms?: number;
  created_at?: string;
  action_step_text?: string;
  misinfo_detected?: number;
  verdict?: string;
  input_type: string;
  persona: string;
  state_code?: string;
}

export const QueryRepository = {
  create(queryData: Partial<Query>): Query {
    const id = uuidv4();
    const { 
      user_id, session_id, input_type, input_text, input_audio_s3, 
      language_code, persona, state_code, answer_text, answer_audio_s3,
      citation_act, citation_section, citation_verified, sentence_count,
      action_step_text, escalation_flag, escalation_reason, misinfo_detected,
      verdict, model_used, latency_ms, tokens_in, tokens_out, idempotency_key
    } = queryData as any;

    db.prepare(`
      INSERT INTO queries (
        id, user_id, session_id, input_type, input_text, input_audio_s3, 
        language_code, persona, state_code, answer_text, answer_audio_s3,
        citation_act, citation_section, citation_verified, sentence_count,
        action_step_text, escalation_flag, escalation_reason, misinfo_detected,
        verdict, model_used, latency_ms, tokens_in, tokens_out, idempotency_key
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, user_id, session_id, input_type, input_text, input_audio_s3, 
      language_code, persona, state_code, answer_text, answer_audio_s3,
      citation_act, citation_section, citation_verified ? 1 : 0, sentence_count,
      action_step_text, escalation_flag ? 1 : 0, escalation_reason, misinfo_detected ? 1 : 0,
      verdict, model_used, latency_ms, tokens_in, tokens_out, idempotency_key
    );

    return db.prepare('SELECT * FROM queries WHERE id = ?').get(id) as Query;
  },

  findByUserId(userId: string, limit = 10, offset = 0): Query[] {
    return db.prepare(`
      SELECT * FROM queries 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `).all(userId, limit, offset) as Query[];
  }
};
