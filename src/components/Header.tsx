import React from 'react';
import { GraduationCap } from 'lucide-react';

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

export default Header;