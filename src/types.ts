// Types and Interfaces
export interface Course {
  code: string;
  name: string;
  section: string;
  professor: string;
  schedule: string;
  days: string;
  times: string;
}

export interface ScheduleEvent {
  courseCode: string;
  courseName: string;
  section: string;
  professor: string;
  day: string;
  startTime: string;
  endTime: string;
  hasConflict: boolean;
}

// Constants and Mappings
export const MODULE_TIMES: { [key: string]: { start: string; end: string } } = {
  '1A': { start: '08:30', end: '09:40' },
  '1B': { start: '08:45', end: '09:55' },
  '2': { start: '10:15', end: '11:25' },
  '3': { start: '11:45', end: '12:55' },
  '4A': { start: '13:15', end: '14:25' },
  '4B': { start: '14:00', end: '15:10' },
  '5': { start: '15:30', end: '16:40' },
  '6': { start: '17:00', end: '18:10' },
  '7': { start: '18:30', end: '19:40' },
  '8': { start: '20:00', end: '21:10' }
};

export const DAY_MAPPING: { [key: string]: string } = {
  'L': 'Lunes',
  'M': 'Martes',
  'W': 'Miércoles',
  'J': 'Jueves',
  'V': 'Viernes',
  'S': 'Sábado'
};

export const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export const HOURS = [
  '08:30', '08:45', '09:00', '09:30', '09:40', '09:55',
  '10:00', '10:15', '10:30', '11:00', '11:25', '11:30',
  '11:45', '12:00', '12:30', '12:55', '13:00', '13:15',
  '13:30', '14:00', '14:25', '14:30', '15:00', '15:10',
  '15:30', '16:00', '16:30', '16:40', '17:00', '17:30',
  '18:00', '18:10', '18:30', '19:00', '19:30', '19:40',
  '20:00', '20:30', '21:00', '21:10'
];