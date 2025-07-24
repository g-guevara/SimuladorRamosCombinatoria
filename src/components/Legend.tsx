import React from 'react';

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

export default Legend;