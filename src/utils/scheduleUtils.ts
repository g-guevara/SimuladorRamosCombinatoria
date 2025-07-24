import { Course, ScheduleEvent } from '../types/schedule';

export const parseCourseData = (csvData: string): Course[] => {
  const lines = csvData.trim().split('\n');
  const courses: Course[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    
    try {
      // Parse CSV line with quoted fields
      const fields = parseCSVLine(line);
      
      if (fields.length >= 7) {
        courses.push({
          code: fields[0],
          name: fields[1],
          section: fields[2],
          professor: fields[3],
          schedule: fields[4],
          days: fields[5],
          times: fields[6]
        });
      }
    } catch (error) {
      console.error('Error parsing line:', line, error);
    }
  }

  return courses;
};

const parseCSVLine = (line: string): string[] => {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  fields.push(current.trim());
  return fields;
};

export const generateScheduleEvents = (courses: Course[]): ScheduleEvent[] => {
  const events: ScheduleEvent[] = [];

  for (const course of courses) {
    const dayList = course.days.split(',').map(d => d.trim());
    const timeList = course.times.split(',').map(t => t.trim());

    for (let i = 0; i < dayList.length; i++) {
      const day = normalizeDayName(dayList[i]);
      const timeRange = timeList[i];
      
      if (timeRange && timeRange.includes('-')) {
        const [startTime, endTime] = timeRange.split('-').map(t => t.trim());
        
        events.push({
          courseCode: course.code,
          courseName: course.name,
          section: course.section,
          professor: course.professor,
          day,
          startTime,
          endTime,
          hasConflict: false
        });
      }
    }
  }

  return events;
};

const normalizeDayName = (day: string): string => {
  const dayMap: { [key: string]: string } = {
    'lunes': 'Lunes',
    'martes': 'Martes',
    'miércoles': 'Miércoles',
    'miercoles': 'Miércoles',
    'jueves': 'Jueves',
    'viernes': 'Viernes',
    'sábado': 'Sábado',
    'sabado': 'Sábado',
    'domingo': 'Domingo'
  };

  return dayMap[day.toLowerCase()] || day;
};

export const detectConflicts = (events: ScheduleEvent[]): ScheduleEvent[] => {
  const eventsWithConflicts = [...events];

  for (let i = 0; i < eventsWithConflicts.length; i++) {
    for (let j = i + 1; j < eventsWithConflicts.length; j++) {
      const event1 = eventsWithConflicts[i];
      const event2 = eventsWithConflicts[j];

      if (event1.day === event2.day && hasTimeOverlap(event1, event2)) {
        event1.hasConflict = true;
        event2.hasConflict = true;
      }
    }
  }

  return eventsWithConflicts;
};

const hasTimeOverlap = (event1: ScheduleEvent, event2: ScheduleEvent): boolean => {
  const start1 = timeToMinutes(event1.startTime);
  const end1 = timeToMinutes(event1.endTime);
  const start2 = timeToMinutes(event2.startTime);
  const end2 = timeToMinutes(event2.endTime);

  return start1 < end2 && start2 < end1;
};

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};