import React, { useState } from 'react';
import { Upload, FileText, GraduationCap } from 'lucide-react';

// Types
interface Course {
  code: string;
  name: string;
  section: string;
  professor: string;
  schedule: string;
  days: string;
  times: string;
}

interface ScheduleEvent {
  courseCode: string;
  courseName: string;
  section: string;
  professor: string;
  day: string;
  startTime: string;
  endTime: string;
  hasConflict: boolean;
}

// Utility functions
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

const parseCourseData = (csvData: string): Course[] => {
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

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

const roundTimeToGrid = (time: string): string => {
  const minutes = timeToMinutes(time);
  const roundedMinutes = Math.round(minutes / 30) * 30;
  return minutesToTime(roundedMinutes);
};

const generateScheduleEvents = (courses: Course[]): ScheduleEvent[] => {
  const events: ScheduleEvent[] = [];

  for (const course of courses) {
    try {
      const dayList = course.days.split(',').map(d => d.trim());
      const timeList = course.times.split(',').map(t => t.trim());

      // Si hay más horarios que días, duplicar los días
      const maxLength = Math.max(dayList.length, timeList.length);
      const normalizedDays = [];
      const normalizedTimes = [];

      for (let i = 0; i < maxLength; i++) {
        normalizedDays.push(dayList[i % dayList.length]);
        normalizedTimes.push(timeList[i % timeList.length]);
      }

      for (let i = 0; i < normalizedDays.length; i++) {
        const day = normalizeDayName(normalizedDays[i]);
        const timeRange = normalizedTimes[i];
        
        if (timeRange && timeRange.includes('-')) {
          const [startTime, endTime] = timeRange.split('-').map(t => t.trim());
          
          // Redondear los horarios a la grilla de 30 minutos
          const roundedStartTime = roundTimeToGrid(startTime);
          const roundedEndTime = roundTimeToGrid(endTime);
          
          events.push({
            courseCode: course.code,
            courseName: course.name,
            section: course.section,
            professor: course.professor,
            day,
            startTime: roundedStartTime,
            endTime: roundedEndTime,
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

const hasTimeOverlap = (event1: ScheduleEvent, event2: ScheduleEvent): boolean => {
  const start1 = timeToMinutes(event1.startTime);
  const end1 = timeToMinutes(event1.endTime);
  const start2 = timeToMinutes(event2.startTime);
  const end2 = timeToMinutes(event2.endTime);

  return start1 < end2 && start2 < end1;
};

const detectConflicts = (events: ScheduleEvent[]): ScheduleEvent[] => {
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

// Components
const Header: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <GraduationCap size={48} className="text-blue-200" />
            <div>
              <h1 className="text-2xl font-bold">Simulador de Horarios</h1>
              <p className="text-blue-200 text-sm">Planifica tu semestre académico</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-200">Bienvenido, estudiante</p>
            <p className="text-xs text-blue-300">Sistema de Gestión Académica</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Legend: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-blue-500 rounded border-2 border-blue-600"></div>
        <span className="text-sm text-gray-700">Secciones sin Conflicto</span>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-red-500 rounded border-2 border-red-600"></div>
        <span className="text-sm text-gray-700">Secciones con Conflicto</span>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex">
          <div className="w-3 h-4 bg-green-500 rounded-l"></div>
          <div className="w-3 h-4 bg-purple-500"></div>
          <div className="w-3 h-4 bg-orange-500 rounded-r"></div>
        </div>
        <span className="text-sm text-gray-700">Diferentes Materias</span>
      </div>
    </div>
  );
};

interface DataImporterProps {
  onDataImport: (data: string) => void;
}

const DataImporter: React.FC<DataImporterProps> = ({ onDataImport }) => {
  const [textData, setTextData] = useState('');
  const [showExample, setShowExample] = useState(false);

  const exampleData = `"TICS400","ARQUITECTURA CLOUD","1","NICOLÁS IGNACIO CENZANO","L3-L4A-L7","Lunes","11:30-12:40, 13:00-14:10, 18:00-19:10"
"TICS400","ARQUITECTURA CLOUD","2","NICOLÁS IGNACIO CENZANO","W5-W6-W7","Miércoles","15:00-16:10, 16:30-17:40, 18:00-19:10"
"TEI401","CAPSTONE PROJECT","1","FRANCISCO JAVIER DUQUE","M3-M4A","Martes","11:30-12:40, 13:00-14:10"
"TICS331","INGENIERÍA DE SOFTWARE","1","MARÍA LORETO ARRIAGADA","W3-W4A","Miércoles","11:30-12:40, 13:00-14:10"
"TICS312","SISTEMAS OPERATIVOS","1","MIGUEL ANDRÉS SOLÍS","L5-L6","Lunes","15:00-16:10, 16:30-17:40"
"ECO216","FORMULACIÓN Y EVALUACIÓN DE PROYECTOS","1","HÉCTOR IVÁN ÁLVAREZ","M3-M4A-J2-J3","Martes,Jueves","11:30-12:40, 13:00-14:10, 10:00-11:10, 11:30-12:40"`;

  const handleImport = () => {
    if (textData.trim()) {
      onDataImport(textData);
      setTextData('');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onDataImport(content);
      };
      reader.readAsText(file);
    }
  };

  const loadExample = () => {
    setTextData(exampleData);
    onDataImport(exampleData);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <FileText size={24} />
        Importar Datos de Cursos
      </h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Formato: Código,Nombre del Ramo,Sección,Profesor,Horario,Días,Horas
        </label>
        <textarea
          className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Pegue aquí los datos de los cursos..."
          value={textData}
          onChange={(e) => setTextData(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={handleImport}
          disabled={!textData.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
        >
          <Upload size={16} />
          Importar Datos
        </button>

        <label className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md cursor-pointer transition-colors flex items-center gap-2">
          <Upload size={16} />
          Subir Archivo CSV
          <input
            type="file"
            accept=".csv,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        <button
          onClick={loadExample}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Cargar Ejemplo
        </button>

        <button
          onClick={() => setShowExample(!showExample)}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          {showExample ? 'Ocultar' : 'Ver'} Formato
        </button>
      </div>

      {showExample && (
        <div className="bg-gray-100 p-4 rounded-md">
          <h4 className="font-semibold mb-2">Formato de ejemplo:</h4>
          <pre className="text-xs text-gray-700 whitespace-pre-wrap break-all">
            {exampleData}
          </pre>
        </div>
      )}
    </div>
  );
};

interface ScheduleEventProps {
  event: ScheduleEvent;
}

const ScheduleEventComponent: React.FC<ScheduleEventProps> = ({ event }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const getEventClass = () => {
    if (event.hasConflict) {
      return 'bg-red-500 hover:bg-red-600 border-red-600';
    }
    
    // Generate consistent colors based on course code
    const colors = [
      'bg-blue-500 hover:bg-blue-600 border-blue-600',
      'bg-green-500 hover:bg-green-600 border-green-600',
      'bg-purple-500 hover:bg-purple-600 border-purple-600',
      'bg-orange-500 hover:bg-orange-600 border-orange-600',
      'bg-pink-500 hover:bg-pink-600 border-pink-600',
      'bg-indigo-500 hover:bg-indigo-600 border-indigo-600',
      'bg-teal-500 hover:bg-teal-600 border-teal-600',
      'bg-yellow-500 hover:bg-yellow-600 border-yellow-600',
    ];
    
    const colorIndex = event.courseCode.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[colorIndex];
  };

  return (
    <div className="relative h-full">
      <div
        className={`
          h-full w-full rounded-md border-2 text-white text-xs p-1 cursor-pointer
          transition-all duration-200 flex flex-col justify-center
          ${getEventClass()}
        `}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="font-semibold truncate">{event.courseCode}</div>
        <div className="text-xs opacity-90 truncate">{event.courseName}</div>
        <div className="text-xs opacity-75">Sec. {event.section}</div>
      </div>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg max-w-xs">
            <div className="font-semibold">{event.courseName}</div>
            <div className="text-sm text-gray-300 mt-1">
              Prof: {event.professor}
            </div>
            <div className="text-sm text-gray-300">
              {event.courseCode} - Sección {event.section}
            </div>
            <div className="text-sm text-gray-300">
              {event.startTime} - {event.endTime}
            </div>
            {event.hasConflict && (
              <div className="text-red-300 text-sm mt-2 font-medium">
                ⚠️ Conflicto de horario
              </div>
            )}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
};

interface ScheduleGridProps {
  events: ScheduleEvent[];
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const HOURS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30'
];

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ events }) => {
  const getEventPosition = (event: ScheduleEvent) => {
    const dayIndex = DAYS.indexOf(event.day);
    const startHourIndex = HOURS.indexOf(event.startTime);
    const endHourIndex = HOURS.indexOf(event.endTime);

    if (dayIndex === -1 || startHourIndex === -1 || endHourIndex === -1) {
      console.warn('Invalid event position:', event);
      return null;
    }

    return {
      gridColumn: dayIndex + 2,
      gridRow: `${startHourIndex + 2} / ${endHourIndex + 2}`,
    };
  };

  return (
    <div className="overflow-x-auto">
      <div 
        className="grid min-w-[800px]"
        style={{
          gridTemplateColumns: 'auto repeat(6, 1fr)',
          gridTemplateRows: `auto repeat(${HOURS.length}, 32px)`
        }}
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-2"></div>
        {DAYS.map((day) => (
          <div
            key={day}
            className="border-b border-gray-200 p-2 text-center font-semibold bg-gray-50"
          >
            {day}
          </div>
        ))}

        {/* Time labels and grid */}
        {HOURS.map((hour, hourIndex) => (
          <React.Fragment key={hour}>
            <div className="border-r border-gray-200 p-2 text-xs text-gray-600 text-right pr-4">
              {hour}
            </div>
            {DAYS.map((day, dayIndex) => (
              <div
                key={`${day}-${hour}`}
                className="border-r border-b border-gray-100 relative"
                style={{ gridColumn: dayIndex + 2, gridRow: hourIndex + 2 }}
              />
            ))}
          </React.Fragment>
        ))}

        {/* Events */}
        {events.map((event, index) => {
          const position = getEventPosition(event);
          if (!position) return null;
          
          return (
            <div
              key={`${event.courseCode}-${event.section}-${event.day}-${event.startTime}-${index}`}
              style={{
                gridColumn: position.gridColumn,
                gridRow: position.gridRow,
                zIndex: 10
              }}
              className="relative p-1"
            >
              <ScheduleEventComponent event={event} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Main App
function App() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([]);

  const handleDataImport = (csvData: string) => {
    try {
      const parsedCourses = parseCourseData(csvData);
      setCourses(parsedCourses);
      console.log('Parsed courses:', parsedCourses);
    } catch (error) {
      alert('Error al procesar los datos. Verifique el formato.');
    }
  };

  const handleCourseSelect = (course: Course) => {
    const isAlreadySelected = selectedCourses.some(
      c => c.code === course.code && c.section === course.section
    );

    let newSelectedCourses;
    if (isAlreadySelected) {
      newSelectedCourses = selectedCourses.filter(
        c => !(c.code === course.code && c.section === course.section)
      );
    } else {
      newSelectedCourses = [...selectedCourses, course];
    }

    setSelectedCourses(newSelectedCourses);
    
    const events = generateScheduleEvents(newSelectedCourses);
    console.log('Generated events:', events);
    const eventsWithConflicts = detectConflicts(events);
    setScheduleEvents(eventsWithConflicts);
  };

  const handleClearSchedule = () => {
    setSelectedCourses([]);
    setScheduleEvents([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <DataImporter onDataImport={handleDataImport} />
        </div>

        {courses.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Cursos Disponibles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {courses.map((course, index) => {
                const isSelected = selectedCourses.some(
                  c => c.code === course.code && c.section === course.section
                );
                return (
                  <div
                    key={`${course.code}-${course.section}-${index}`}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-100 border-blue-500 shadow-md'
                        : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                    }`}
                    onClick={() => handleCourseSelect(course)}
                  >
                    <div className="font-semibold text-gray-900">{course.name}</div>
                    <div className="text-sm text-gray-600">
                      {course.code} - Sección {course.section}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Prof: {course.professor}
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      {course.days} - {course.times}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          <Legend />
          <button
            onClick={handleClearSchedule}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Limpiar Horario
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Mi Horario</h2>
          <ScheduleGrid events={scheduleEvents} />
        </div>
      </div>
    </div>
  );
}

export default App;