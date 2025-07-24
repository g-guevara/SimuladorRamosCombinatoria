import React, { useState } from 'react';
import { Upload, FileText, GraduationCap } from 'lucide-react';
import { ScheduleEvent, DAYS, HOURS } from './types';

// Header Component
export const Header: React.FC = () => {
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

// Legend Component
export const Legend: React.FC = () => {
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

// DataImporter Component
interface DataImporterProps {
  onDataImport: (data: string) => void;
}

export const DataImporter: React.FC<DataImporterProps> = ({ onDataImport }) => {
  const [textData, setTextData] = useState('');
  const [showExample, setShowExample] = useState(false);

  const exampleData = `"TICS400","ARQUITECTURA CLOUD","1","NICOLÁS IGNACIO CENZANO","L3-L4A-L7","Lunes","11:30-12:40, 13:00-14:10, 18:00-19:10"
"TICS400","ARQUITECTURA CLOUD","2","NICOLÁS IGNACIO CENZANO","W5-W6-W7","Miércoles","15:00-16:10, 16:30-17:40, 18:00-19:10"
"TEI401","CAPSTONE PROJECT","1","FRANCISCO JAVIER DUQUE","M3-M4A","Martes","11:30-12:40, 13:00-14:10"
"TICS331","INGENIERÍA DE SOFTWARE","1","MARÍA LORETO ARRIAGADA","W3-W4A","Miércoles","11:30-12:40, 13:00-14:10"
"TICS312","SISTEMAS OPERATIVOS","1","MIGUEL ANDRÉS SOLÍS","L5-L6","Lunes","15:00-16:10, 16:30-17:40"
"ECO216","FORMULACIÓN Y EVALUACIÓN DE PROYECTOS","3","CLAUDIO ANDRÉS JIMÉNEZ","M4A-M5-V3-V4A","Martes-Viernes","13:00-14:10, 15:00-16:10, 11:30-12:40, 13:00-14:10"`;

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
          Formato: Código,Nombre del Ramo,Sección,Profesor,Módulos (ej: M4A-M5-V3),Días,Horas
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

// ScheduleEvent Component
interface ScheduleEventProps {
  event: ScheduleEvent;
}

export const ScheduleEventComponent: React.FC<ScheduleEventProps> = ({ event }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const getEventClass = () => {
    if (event.hasConflict) {
      return 'bg-red-500 hover:bg-red-600 border-red-600';
    }
    
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
        <div className="font-semibold truncate text-xs">{event.courseCode}</div>
        <div className="text-xs opacity-90 truncate leading-tight">{event.courseName}</div>
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

// ScheduleGrid Component
interface ScheduleGridProps {
  events: ScheduleEvent[];
}

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({ events }) => {
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

  const availableHeight = `calc(100vh - 16rem)`;

  return (
    <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: availableHeight }}>
      <div 
        className="grid min-w-[800px]"
        style={{
          gridTemplateColumns: 'auto repeat(6, 1fr)',
          gridTemplateRows: `auto repeat(${HOURS.length}, minmax(20px, 1fr))`,
          height: availableHeight
        }}
      >
        <div className="border-b border-gray-200 p-1 sticky top-0 bg-white z-20"></div>
        {DAYS.map((day) => (
          <div
            key={day}
            className="border-b border-gray-200 p-1 text-center font-semibold bg-gray-50 text-sm sticky top-0 z-20"
          >
            {day}
          </div>
        ))}

        {HOURS.map((hour, hourIndex) => (
          <React.Fragment key={hour}>
            <div className="border-r border-gray-200 p-1 text-xs text-gray-600 text-right pr-2 sticky left-0 bg-white z-10">
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

        {events.map((event, index) => {
          const position = getEventPosition(event);
          if (!position) return null;
          
          return (
            <div
              key={`${event.courseCode}-${event.section}-${event.day}-${event.startTime}-${index}`}
              style={{
                gridColumn: position.gridColumn,
                gridRow: position.gridRow,
                zIndex: 30
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