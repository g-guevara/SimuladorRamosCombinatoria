import { Course, ScheduleEvent, MODULE_TIMES, DAY_MAPPING } from './types';

// Utility functions
export const parseCSVLine = (line: string): string[] => {
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

export const parseCourseData = (csvData: string): Course[] => {
  const lines = csvData.trim().split('\n');
  const courses: Course[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    
    try {
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

export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

export const parseScheduleString = (scheduleStr: string): Array<{ day: string; module: string }> => {
  const modules = scheduleStr.split('-');
  const result = [];
  
  for (const module of modules) {
    const dayLetter = module.charAt(0);
    const moduleNumber = module.substring(1);
    
    if (DAY_MAPPING[dayLetter] && MODULE_TIMES[moduleNumber]) {
      result.push({
        day: DAY_MAPPING[dayLetter],
        module: moduleNumber
      });
    }
  }
  
  return result;
};

export const generateScheduleEvents = (courses: Course[]): ScheduleEvent[] => {
  const events: ScheduleEvent[] = [];

  for (const course of courses) {
    try {
      const scheduleModules = parseScheduleString(course.schedule);
      
      for (const scheduleModule of scheduleModules) {
        const moduleTime = MODULE_TIMES[scheduleModule.module];
        
        if (moduleTime) {
          events.push({
            courseCode: course.code,
            courseName: course.name,
            section: course.section,
            professor: course.professor,
            day: scheduleModule.day,
            startTime: moduleTime.start,
            endTime: moduleTime.end,
            hasConflict: false
          });
        }
      }
    } catch (error) {
      console.error('Error processing course:', course, error);
    }
  }

  return events;
};

export const hasTimeOverlap = (event1: ScheduleEvent, event2: ScheduleEvent): boolean => {
  const start1 = timeToMinutes(event1.startTime);
  const end1 = timeToMinutes(event1.endTime);
  const start2 = timeToMinutes(event2.startTime);
  const end2 = timeToMinutes(event2.endTime);

  return start1 < end2 && start2 < end1;
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

// Función para recomendar horarios sin conflictos
export const recommendSchedule = (courses: Course[]): Course[] => {
  if (courses.length === 0) return [];

  const coursesByCode: { [key: string]: Course[] } = {};
  courses.forEach(course => {
    if (!coursesByCode[course.code]) {
      coursesByCode[course.code] = [];
    }
    coursesByCode[course.code].push(course);
  });

  const courseCodes = Object.keys(coursesByCode);
  const maxAttempts = 100;
  let bestSchedule: Course[] = [];
  let minConflicts = Infinity;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const currentSchedule: Course[] = [];
    
    for (const courseCode of courseCodes) {
      const availableSections = coursesByCode[courseCode];
      const randomSection = availableSections[Math.floor(Math.random() * availableSections.length)];
      currentSchedule.push(randomSection);
    }

    const events = generateScheduleEvents(currentSchedule);
    const eventsWithConflicts = detectConflicts(events);
    const conflictCount = eventsWithConflicts.filter(event => event.hasConflict).length;

    if (conflictCount < minConflicts) {
      minConflicts = conflictCount;
      bestSchedule = [...currentSchedule];
      
      if (conflictCount === 0) {
        break;
      }
    }
  }

  return bestSchedule;
};

// Función para generar todas las combinaciones válidas
export const generateAllValidCombinations = (courses: Course[]): Course[][] => {
  if (courses.length === 0) return [];

  const coursesByCode: { [key: string]: Course[] } = {};
  courses.forEach(course => {
    if (!coursesByCode[course.code]) {
      coursesByCode[course.code] = [];
    }
    coursesByCode[course.code].push(course);
  });

  const courseCodes = Object.keys(coursesByCode);
  const validCombinations: Course[][] = [];
  const maxCombinations = 1000;
  
  const generateCombinations = (index: number, currentCombination: Course[]) => {
    if (validCombinations.length >= maxCombinations) return;
    
    if (index === courseCodes.length) {
      const events = generateScheduleEvents(currentCombination);
      const eventsWithConflicts = detectConflicts(events);
      const hasConflicts = eventsWithConflicts.some(event => event.hasConflict);
      
      if (!hasConflicts) {
        validCombinations.push([...currentCombination]);
      }
      return;
    }

    const courseCode = courseCodes[index];
    const availableSections = coursesByCode[courseCode];

    for (const section of availableSections) {
      currentCombination.push(section);
      generateCombinations(index + 1, currentCombination);
      currentCombination.pop();
    }
  };

  generateCombinations(0, []);
  return validCombinations;
};