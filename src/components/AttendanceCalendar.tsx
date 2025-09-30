"use client";
import { useState } from "react";

interface Player {
  id: string;
  full_name: string;
  primary_position: string;
  current_team: string;
}

interface AttendanceEntry {
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

interface AttendanceCalendarProps {
  player: Player;
  attendance: AttendanceEntry[];
  year: number;
  month: number;
}

const statusColors = {
  present: 'bg-green-100 text-green-800',
  absent: 'bg-red-100 text-red-800',
  late: 'bg-yellow-100 text-yellow-800',
  excused: 'bg-blue-100 text-blue-800'
};

const statusLabels = {
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
  excused: 'Excused'
};

export default function AttendanceCalendar({ 
  player, 
  attendance, 
  year, 
  month 
}: AttendanceCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Create attendance map for quick lookup
  const attendanceMap = attendance.reduce((acc, entry) => {
    acc[entry.date] = entry;
    return acc;
  }, {} as Record<string, AttendanceEntry>);

  // Calculate calendar days
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

  const calendarDays = [];
  const currentDate = new Date(startDate);
  
  // Generate 42 days (6 weeks)
  for (let i = 0; i < 42; i++) {
    calendarDays.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Calculate statistics
  const totalDays = lastDay.getDate();
  const presentDays = attendance.filter(entry => entry.status === 'present').length;
  const absentDays = attendance.filter(entry => entry.status === 'absent').length;
  const lateDays = attendance.filter(entry => entry.status === 'late').length;
  const excusedDays = attendance.filter(entry => entry.status === 'excused').length;
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(year, month - 1);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    
    const newYear = newDate.getFullYear();
    const newMonth = newDate.getMonth() + 1;
    
    // Navigate to new month
    window.location.href = `/players/${player.id}/attendance?year=${newYear}&month=${newMonth}`;
  };

  const getDayStatus = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return attendanceMap[dateStr]?.status;
  };

  const getDayNotes = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return attendanceMap[dateStr]?.notes;
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === month - 1 && date.getFullYear() === year;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{presentDays}</div>
          <div className="text-sm text-green-700">Present</div>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{absentDays}</div>
          <div className="text-sm text-red-700">Absent</div>
        </div>
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{lateDays}</div>
          <div className="text-sm text-yellow-700">Late</div>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{excusedDays}</div>
          <div className="text-sm text-blue-700">Excused</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-600">{attendancePercentage}%</div>
          <div className="text-sm text-gray-700">Attendance</div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white border rounded-lg p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded"
          >
            ←
          </button>
          <h2 className="text-lg font-semibold">
            {new Date(year, month - 1).toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </h2>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded"
          >
            →
          </button>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) => {
            const status = getDayStatus(date);
            const notes = getDayNotes(date);
            const isCurrentMonthDay = isCurrentMonth(date);
            const isTodayDate = isToday(date);
            const dateStr = date.toISOString().split('T')[0];

            return (
              <div
                key={index}
                className={`
                  aspect-square p-2 text-center text-sm cursor-pointer rounded
                  ${isCurrentMonthDay ? 'text-gray-900' : 'text-gray-400'}
                  ${isTodayDate ? 'ring-2 ring-blue-500' : ''}
                  ${status ? statusColors[status] : 'hover:bg-gray-50'}
                  ${selectedDate === dateStr ? 'ring-2 ring-gray-400' : ''}
                `}
                onClick={() => setSelectedDate(selectedDate === dateStr ? null : dateStr)}
              >
                <div className="font-medium">{date.getDate()}</div>
                {status && (
                  <div className="text-xs mt-1">
                    {statusLabels[status].charAt(0)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected day details */}
      {selectedDate && attendanceMap[selectedDate] && (
        <div className="bg-gray-50 border rounded-lg p-4">
          <h3 className="font-medium mb-2">
            {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h3>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Status: </span>
              <span className={`px-2 py-1 rounded text-sm ${statusColors[attendanceMap[selectedDate].status]}`}>
                {statusLabels[attendanceMap[selectedDate].status]}
              </span>
            </div>
            {attendanceMap[selectedDate].notes && (
              <div>
                <span className="font-medium">Notes: </span>
                <span className="text-gray-700">{attendanceMap[selectedDate].notes}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 rounded"></div>
          <span>Present</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 rounded"></div>
          <span>Absent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 rounded"></div>
          <span>Late</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 rounded"></div>
          <span>Excused</span>
        </div>
      </div>
    </div>
  );
}
