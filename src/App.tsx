import { useState, FC } from 'react';
import { Shuffle, GraduationCap, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';
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
  const [showFixedCoursesModal, setShowFixedCoursesModal] = useState<boolean>(false);
  const [fixedCourses, setFixedCourses] = useState<Course[]>([]);

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
    setFixedCourses([]);
  };

  const handleClearSchedule = () => {
    setSelectedCourses([]);
    setScheduleEvents([]);
    setShowCombinations(false);
    setValidCombinations([]);
    setSelectedCombinationIndex(-1);
    setFixedCourses([]);
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
    setFixedCourses([]);
  };

  // Nueva función para manejar la simulación de combinaciones
  const handleSimulateCombinations = () => {
    if (courses.length === 0) {
      alert('Primero debes importar datos de cursos para poder simular combinaciones.');
      return;
    }

    // Mostrar el modal para seleccionar cursos fijos
    setShowFixedCoursesModal(true);
  };

  // Función para manejar la selección de cursos fijos
  const handleFixedCourseToggle = (course: Course) => {
    const isAlreadyFixed = fixedCourses.some(
      c => c.code === course.code && c.section === course.section
    );

    if (isAlreadyFixed) {
      setFixedCourses(fixedCourses.filter(
        c => !(c.code === course.code && c.section === course.section)
      ));
    } else {
      setFixedCourses([...fixedCourses, course]);
    }
  };

  // Función para proceder con la simulación después de seleccionar cursos fijos
  const handleProceedWithSimulation = () => {
    setShowFixedCoursesModal(false);

    console.log('Generando combinaciones válidas con cursos fijos:', fixedCourses);
    const combinations = generateAllValidCombinations(courses, fixedCourses);
    
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

  // Funciones para navegar entre combinaciones
  const handlePreviousCombination = () => {
    if (selectedCombinationIndex > 0) {
      handleCombinationSelect(selectedCombinationIndex - 1);
    }
  };

  const handleNextCombination = () => {
    if (selectedCombinationIndex < validCombinations.length - 1) {
      handleCombinationSelect(selectedCombinationIndex + 1);
    }
  };

  // Componente Modal para seleccionar cursos fijos
  const FixedCoursesModal = () => {
    if (!showFixedCoursesModal) return null;

    // Agrupar cursos por código para mostrar las opciones disponibles
    const coursesByCode: { [key: string]: Course[] } = {};
    courses.forEach(course => {
      if (!coursesByCode[course.code]) {
        coursesByCode[course.code] = [];
      }
      coursesByCode[course.code].push(course);
    });

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Seleccionar Cursos Fijos
            </h2>
            <button
              onClick={() => setShowFixedCoursesModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <p className="text-sm text-gray-600 mb-4">
              Selecciona los cursos que quieres incluir <strong>obligatoriamente</strong> en todas las combinaciones. 
              Estos cursos no participarán en la combinatoria automática.
            </p>
            
            <div className="space-y-4">
              {Object.entries(coursesByCode).map(([courseCode, courseSections]) => (
                <div key={courseCode} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {courseCode} - {courseSections[0].name}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {courseSections.map((course, index) => {
                      const isSelected = fixedCourses.some(
                        c => c.code === course.code && c.section === course.section
                      );
                      
                      return (
                        <label
                          key={`${course.code}-${course.section}-${index}`}
                          className={`
                            flex items-center p-3 rounded-md border cursor-pointer transition-all
                            ${isSelected 
                              ? 'bg-blue-50 border-blue-300 text-blue-900' 
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                            }
                          `}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleFixedCourseToggle(course)}
                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium">
                              Sección {course.section}
                            </div>
                            <div className="text-xs text-gray-600 truncate">
                              Prof: {course.professor}
                            </div>
                            <div className="text-xs text-gray-500">
                              {course.schedule}
                            </div>
                          </div>
                          {isSelected && (
                            <Check size={16} className="text-blue-600 ml-2" />
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              {fixedCourses.length} curso{fixedCourses.length !== 1 ? 's' : ''} fijo{fixedCourses.length !== 1 ? 's' : ''} seleccionado{fixedCourses.length !== 1 ? 's' : ''}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFixedCoursesModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleProceedWithSimulation}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center gap-2"
              >
                <GraduationCap size={16} />
                Generar Combinaciones
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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
                setFixedCourses([]);
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePreviousCombination}
                    disabled={selectedCombinationIndex <= 0}
                    className="p-1 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Combinación anterior"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  
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
                  
                  <button
                    onClick={handleNextCombination}
                    disabled={selectedCombinationIndex >= validCombinations.length - 1}
                    className="p-1 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Combinación siguiente"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
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
      
      {/* Modal de cursos fijos */}
      <FixedCoursesModal />
    </div>
  );
}

export default App;
