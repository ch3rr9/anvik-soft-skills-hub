
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { CalendarEvent } from "@/types/schedule-types";

interface CalendarEventsProps {
  events: CalendarEvent[];
  date: Date;
}

const CalendarEvents = ({ events, date }: CalendarEventsProps) => {
  const dayEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate.toDateString() === date.toDateString();
  });

  if (dayEvents.length === 0) return null;

  const getEventBadgeVariant = (type: string, status?: string) => {
    if (type === 'test') {
      if (status === 'completed') return 'default';
      if (status === 'overdue') return 'destructive';
      return 'secondary';
    }
    return 'outline';
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'test': return '📝';
      case 'meeting': return '👥';
      case 'deadline': return '⏰';
      default: return '📅';
    }
  };

  return (
    <div className="mt-1 space-y-1">
      {dayEvents.slice(0, 2).map((event) => (
        <Badge
          key={event.id}
          variant={getEventBadgeVariant(event.type, event.status)}
          className="text-xs truncate w-full justify-start"
        >
          <span className="mr-1">{getEventIcon(event.type)}</span>
          {event.title}
        </Badge>
      ))}
      {dayEvents.length > 2 && (
        <div className="text-xs text-muted-foreground">
          +{dayEvents.length - 2} еще
        </div>
      )}
    </div>
  );
};

export default CalendarEvents;
