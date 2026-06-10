export interface AvailabilityRule {
  id: string;
  dayOfWeek: number; // 0=Sun, 1=Mon, …, 6=Sat
  isActive: boolean;
  startTime: string; // "HH:MM" 24h
  endTime: string;   // "HH:MM" 24h
  blockLabel?: string;
}

export interface ManualBlock {
  id: string;
  date: string;       // "YYYY-MM-DD"
  startTime: string;  // "HH:MM"
  endTime: string;    // "HH:MM"
  reason?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ClosedDay {
  id: string;
  date: string;   // "YYYY-MM-DD"
  reason?: string;
  isActive: boolean;
  createdAt: string;
}
