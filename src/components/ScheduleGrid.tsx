import React from 'react';
import { ScheduleEvent } from '../types/schedule';
import ScheduleEventComponent from './ScheduleEvent';

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
    const duration = endHourIndex - startHourIndex;

    return {
      gridColumn: dayIndex + 2,
      gridRow: `${startHourIndex + 2} / ${endHourIndex + 2}`,
      duration
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
          return (
            <div
              key={`${event.courseCode}-${event.section}-${event.day}-${event.startTime}-${index}`}
              style={{
                gridColumn: position.gridColumn,
                gridRow: position.gridRow,
                zIndex: 10
              }}
              className="relative"
            >
              <ScheduleEventComponent event={event} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScheduleGrid;