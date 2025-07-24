import React, { useState } from 'react';
import { Upload, FileText } from 'lucide-react';

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

export default DataImporter;