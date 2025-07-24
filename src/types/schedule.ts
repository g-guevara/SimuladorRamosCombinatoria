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