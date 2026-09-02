export type RelationshipType = 
  | 'Friend' 
  | 'Best Friend' 
  | 'Family' 
  | 'Partner' 
  | 'Colleague' 
  | 'Other'
  | string;

export type MessageStyle = 
  | 'Simple' 
  | 'Funny' 
  | 'Heartfelt' 
  | 'Formal' 
  | 'Best Friend';

export interface Person {
  id: number;
  name: string;
  birthday: string; // YYYY-MM-DD or MM-DD
  birth_year?: number | null;
  relationship: RelationshipType | string;
  notes?: string;
  reminder_days?: string; // e.g. "on_day,1_day_before"
  reminder_time?: string; // e.g. "09:00"
  created_at?: string;
  days_remaining?: number;
  days_until?: number;
  age_turning?: number;
  has_year?: boolean;
  is_today?: boolean;
  next_birthday?: string;
}

export interface PersonInput {
  name: string;
  birthday: string; // YYYY-MM-DD or MM-DD
  birth_year?: number | null;
  relationship: string;
  notes?: string;
  reminder_days?: string;
  reminder_time?: string;
}
