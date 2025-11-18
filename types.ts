export enum HabitStatus {
  NONE = 0,
  SUCCESS = 1,
  PARTIAL = 2,
  FAIL = 3,
}

export interface HabitDefinition {
  id: string;
  name: string;
  category: 'quitting' | 'health' | 'mental' | 'productivity' | 'lifestyle';
}

export interface DailyLog {
  [dateStr: string]: HabitStatus; // dateStr in YYYY-MM-DD format
}

export interface UserHabit {
  id: string; // references HabitDefinition.id or custom uuid
  name: string;
  logs: DailyLog;
  notes?: { [dateStr: string]: string };
  createdAt: string;
}

export interface DayCell {
  date: Date;
  dateStr: string;
  status: HabitStatus;
}