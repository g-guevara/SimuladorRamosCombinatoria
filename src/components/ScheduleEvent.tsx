import React, { useState } from 'react';
import { ScheduleEvent } from '../types/schedule';

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

export default ScheduleEventComponent;