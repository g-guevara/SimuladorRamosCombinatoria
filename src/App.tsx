import React, { useState } from 'react';
import Header from './components/Header';
import ScheduleGrid from './components/ScheduleGrid';
import DataImporter from './components/DataImporter';
import Legend from './components/Legend';
import { Course, ScheduleEvent } from './types/schedule';
import { parseCourseData, generateScheduleEvents, detectConflicts } from './utils/scheduleUtils';

function App() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([]);

  const handleDataImport = (csvData: string) => {
    try {
      const parsedCourses = parseCourseData(csvData);
      setCourses(parsedCourses);
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