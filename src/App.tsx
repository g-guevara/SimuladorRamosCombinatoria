import React, { useState } from 'react';
import { Shuffle, GraduationCap } from 'lucide-react';
import { Course, ScheduleEvent } from './types';
import { 
  parseCourseData, 
  generateScheduleEvents, 
  detectConflicts, 
  recommendSchedule, 
  generateAllValidCombinations 
} from './utils';
import { 
  Header, 
  Legend, 
  DataImporter, 
  ScheduleGrid 
} from './components';

// Main App Component
function App() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([]);
  const [validCombinations, setValidCombinations] = useState<Course[][]>([]);
  const [selectedCombinationIndex, setSelectedCombinationIndex] = useState<number>(-1);
  const [showCombinations, setShowCombinations] = useState<boolean>(false);

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
    
    // Resetear el modo de combinaciones cuando se selecciona manualmente
    setShowCombinations(false);
    setValidCombinations([]);
    setSelectedCombinationIndex(-1);
  };

  const handleClearSchedule = () => {
    setSelectedCourses([]);
    setScheduleEvents([]);
    setShowCombinations(false);
    setValidCombinations([]);
    setSelectedCombinationIndex(-1);
  };

  const handleRecommendSchedule = () => {
    if (courses.length === 0) {
      alert('Primero debes importar datos de cursos para poder generar recomendaciones.');
      return;
    }

    const recommendedCourses = recommendSchedule(courses);
    
    if (recommendedCourses.length === 0) {
      alert('No se pudo generar una recomendación de horario. Verifica que tengas cursos disponibles.');
      return;
    }

    setSelectedCourses(recommendedCourses);
    
    const events = generateScheduleEvents(recommendedCourses);
    const eventsWithConflicts = detectConflicts(events);
    setScheduleEvents(eventsWithConflicts);

    const conflictCount = eventsWithConflicts.filter(event => event.hasConflict).length;
    
    if (conflictCount === 0) {
      alert('¡Excelente! Se generó un horario sin conflictos.');
    } else {
      alert(`Se generó la mejor combinación posible con ${conflictCount} conflictos mínimos.`);
    }
    
    // Resetear el modo de combinaciones
    setShowCombinations(false);
    setValidCombinations([]);
    setSelectedCombinationIndex(-1);
  };

  // Nueva función para manejar la simulación de combinaciones
  const handleSimulateCombinations = () => {
    if (courses.length === 0) {
      alert('Primero debes importar datos de cursos para poder simular combinaciones.');
      return;
    }

    console.log('Generando combinaciones válidas...');
    const combinations = generateAllValidCombinations(courses);
    
    if (combinations.length === 0) {
      alert('No se encontraron combinaciones válidas sin conflictos. Intenta con otros cursos o revisa los horarios.');
      return;
    }

    setValidCombinations(combinations);
    setShowCombinations(true);
    setSelectedCombinationIndex(0);
    
    // Mostrar la primera combinación
    const firstCombination = combinations[0];
    setSelectedCourses(firstCombination);
    
    const events = generateScheduleEvents(firstCombination);
    const eventsWithConflicts = detectConflicts(events);
    setScheduleEvents(eventsWithConflicts);

    alert(`¡Encontradas ${combinations.length} combinaciones válidas sin conflictos! Usa el selector para navegar entre ellas.`);
  };

  // Nueva función para manejar la selección de combinaciones
  const handleCombinationSelect = (combinationIndex: number) => {
    if (combinationIndex >= 0 && combinationIndex < validCombinations.length) {
      setSelectedCombinationIndex(combinationIndex);
      
      const selectedCombination = validCombinations[combinationIndex];
      setSelectedCourses(selectedCombination);
      
      const events = generateScheduleEvents(selectedCombination);
      const eventsWithConflicts = detectConflicts(events);
      setScheduleEvents(eventsWithConflicts);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="container mx-auto px-4 py-6 flex-1 flex flex-col">
        <div className="mb-6">
          <DataImporter onDataImport={handleDataImport} />
        </div>

        {courses.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Seleccionar Cursos</h3>
            <div className="bg-white rounded-lg shadow-md p-4">
              <select
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                onChange={(e) => {
                  if (e.target.value) {
                    const courseIndex = parseInt(e.target.value);
                    const course = courses[courseIndex];
                    handleCourseSelect(course);
                    e.target.value = ''; // Reset dropdown
                  }
                }}
                defaultValue=""
              >
                <option value="" disabled>
                  Selecciona un curso para agregar...
                </option>
                {courses.map((course, index) => {
                  const isSelected = selectedCourses.some(
                    c => c.code === course.code && c.section === course.section
                  );
                  return (
                    <option
                      key={`${course.code}-${course.section}-${index}`}
                      value={index}
                      disabled={isSelected}
                    >
                      {course.name} - Sección {course.section}
                      {isSelected ? ' (Seleccionado)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          <Legend />
          <div className="flex gap-3 flex-wrap">
            {courses.length > 0 && (
              <>
                <button
                  onClick={handleRecommendSchedule}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Shuffle size={16} />
                  Recomendar Horario
                </button>
                <button
                  onClick={handleSimulateCombinations}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <GraduationCap size={16} />
                  Simulador de Combinaciones
                </button>
              </>
            )}
            <button
              onClick={handleClearSchedule}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Limpiar Horario
            </button>
            <button
              onClick={() => {
                setCourses([]);
                setSelectedCourses([]);
                setScheduleEvents([]);
                setShowCombinations(false);
                setValidCombinations([]);
                setSelectedCombinationIndex(-1);
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Limpiar Datos
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold">Mi Horario</h2>
            {showCombinations && validCombinations.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  Combinación válida:
                </span>
                <select
                  value={selectedCombinationIndex}
                  onChange={(e) => handleCombinationSelect(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {validCombinations.map((_, index) => (
                    <option key={index} value={index}>
                      Opción {index + 1} de {validCombinations.length}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="flex-1">
            <ScheduleGrid events={scheduleEvents} />
          </div>
        </div>
        
        {selectedCourses.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">Cursos Seleccionados</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedCourses.map((course, index) => (
                <div key={`${course.code}-${course.section}-${index}`} className="border border-gray-200 rounded-lg p-4">
                  <div className="font-semibold text-blue-800">{course.code}</div>
                  <div className="text-sm text-gray-700 mb-1">{course.name}</div>
                  <div className="text-xs text-gray-600">Sección {course.section}</div>
                  <div className="text-xs text-gray-600">Prof: {course.professor}</div>
                  <button
                    onClick={() => handleCourseSelect(course)}
                    className="mt-2 text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition-colors"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;