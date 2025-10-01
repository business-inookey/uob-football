"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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
  present: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  absent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  late: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  excused: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
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
  const router = useRouter();

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
    router.push(`/players/${player.id}/attendance?year=${newYear}&month=${newMonth}`);
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
    <div className="space-y-8">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card p-6 text-center bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <div className="text-3xl font-bold text-emerald-600 mb-1">{presentDays}</div>
          <div className="text-sm font-medium text-emerald-700">Present</div>
        </div>
        <div className="card p-6 text-center bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="text-3xl font-bold text-red-600 mb-1">{absentDays}</div>
          <div className="text-sm font-medium text-red-700">Absent</div>
        </div>
        <div className="card p-6 text-center bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <div className="text-3xl font-bold text-amber-600 mb-1">{lateDays}</div>
          <div className="text-sm font-medium text-amber-700">Late</div>
        </div>
        <div className="card p-6 text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="text-3xl font-bold text-blue-600 mb-1">{excusedDays}</div>
          <div className="text-sm font-medium text-blue-700">Excused</div>
        </div>
        <div className="card p-6 text-center bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="text-3xl font-bold text-primary mb-1">{attendancePercentage}%</div>
          <div className="text-sm font-medium text-primary">Attendance</div>
        </div>
      </div>

      {/* Calendar */}
      <div className="card p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={() => navigateMonth('prev')}
            variant="outline"
            size="sm"
            dataTitle="Previous Month"
            dataText="Loading..."
            dataStart="Month Changed!"
          >
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Previous</span>
          </Button>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground text-center">
            {new Date(year, month - 1).toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </h2>
          <Button
            onClick={() => navigateMonth('next')}
            variant="outline"
            size="sm"
            dataTitle="Next Month"
            dataText="Loading..."
            dataStart="Month Changed!"
          >
            <span className="hidden sm:inline">Next</span>
            <svg className="w-4 h-4 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-semibold text-muted-foreground p-3">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
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
                  aspect-square p-2 text-center text-sm cursor-pointer rounded-lg transition-all duration-200
                  ${isCurrentMonthDay ? 'text-foreground' : 'text-muted-foreground'}
                  ${isTodayDate ? 'ring-2 ring-primary bg-primary/5' : ''}
                  ${status ? `${statusColors[status]} hover:opacity-80` : 'hover:bg-muted/50'}
                  ${selectedDate === dateStr ? 'ring-2 ring-primary bg-primary/10' : ''}
                `}
                onClick={() => setSelectedDate(selectedDate === dateStr ? null : dateStr)}
              >
                <div className="font-semibold mb-1">{date.getDate()}</div>
                {status && (
                  <div className="text-xs font-medium">
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
        <div className="card p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-foreground">
              {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground">Status:</span>
              <span className={`badge ${statusColors[attendanceMap[selectedDate].status]}`}>
                {statusLabels[attendanceMap[selectedDate].status]}
              </span>
            </div>
            
            {attendanceMap[selectedDate].notes && (
              <div className="space-y-2">
                <span className="text-sm font-medium text-foreground">Notes:</span>
                <p className="text-muted-foreground bg-background/50 p-3 rounded-lg">
                  {attendanceMap[selectedDate].notes}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-emerald-100 rounded-full"></div>
            <span className="text-sm font-medium text-foreground">Present</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-red-100 rounded-full"></div>
            <span className="text-sm font-medium text-foreground">Absent</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-amber-100 rounded-full"></div>
            <span className="text-sm font-medium text-foreground">Late</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-blue-100 rounded-full"></div>
            <span className="text-sm font-medium text-foreground">Excused</span>
          </div>
        </div>
      </div>
    </div>
  );
}