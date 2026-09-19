import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { CalendarEvent } from "../../api/types";
import UpcomingEvents from "./UpcomingEvents";
import EventForm from "./EventForm";
import EventModal from "./EventModal";
import { calendarApi } from "../../api/calendarApi";
import { jobPostingApi } from "../../api/jobPostingApi";
import { useState, useEffect, useRef } from "react";
import { Calendar as CalendarIcon, Plus } from "lucide-react";

interface CalendarPageProps {
  readOnly?: boolean;
  events?: CalendarEvent[];
  onAddEvent?: (newEvent: CalendarEvent) => void;
}

import { getEventColor } from "./calendarUtils";

export default function CalendarPage({
  readOnly = false,
  events: propEvents,
  onAddEvent
}: CalendarPageProps) {
  const [events, setEvents] = useState<CalendarEvent[]>(propEvents || []);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const calendarRef = useRef<FullCalendar | null>(null);

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    if (event.scheduledDate && calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(event.scheduledDate);
      const calendarEl = document.querySelector('.fc');
      if (calendarEl) {
        calendarEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchEvents = async () => {
      try {
        const [apiEvents, jobPostings] = await Promise.all([
          calendarApi.getAll().catch(() => []),
          jobPostingApi.getAll().catch(() => [])
        ]);

        if (!isMounted) return;

        let combinedEvents: CalendarEvent[] = propEvents && propEvents.length > 0 ? [...propEvents] : [];

        if (Array.isArray(apiEvents) && apiEvents.length > 0) {
          apiEvents.forEach((ae) => {
            if (!combinedEvents.some((e) => String(e.id) === String(ae.id))) {
              combinedEvents.push(ae);
            }
          });
        }

        // 2. Derive placement application deadlines from job posting data
        if (Array.isArray(jobPostings)) {
          jobPostings.forEach((jp) => {
            if (jp.deadline) {
              const deadlineDate = jp.deadline.includes('T') ? jp.deadline.split('T')[0] : jp.deadline;
              const exists = combinedEvents.some((e) => e.scheduledDate === deadlineDate && e.title.includes(jp.title));
              if (!exists) {
                combinedEvents.push({
                  id: `deadline-${jp.id}`,
                  title: `🔴 ${jp.title} — Application Deadline`,
                  eventType: 'Placement Deadline',
                  companyName: 'Company',
                  role: jp.title,
                  scheduledDate: deadlineDate,
                  startTime: '',
                  description: `Application deadline for ${jp.title}. Package: ${jp.salary ? `${jp.salary} LPA` : 'N/A'}. Location: ${jp.location || 'Campus'}.`,
                  status: jp.status
                });
              }
            }
          });
        }

        // Filter events strictly: Admin/TPO (readOnly=false) must never see private events
        const filteredEvents = readOnly
          ? combinedEvents
          : combinedEvents.filter((e) => !e.isPrivate && !String(e.id).startsWith('private-'));

        if (filteredEvents.length > 0) {
          setEvents(filteredEvents);
        }
      } catch (err) {
        console.error('Failed to load calendar data:', err);
      }
    };

    fetchEvents();

    return () => {
      isMounted = false;
    };
  }, [propEvents, readOnly]);

  const handleSaveEvent = (newEvent: Record<string, string>) => {
    const calendarEvent: CalendarEvent = {
      id: `event-${Date.now()}`,
      title: `${newEvent.company} - ${newEvent.role} (${newEvent.type})`,
      eventType: newEvent.type || "PPT",
      companyName: newEvent.company,
      company: newEvent.company,
      role: newEvent.role,
      scheduledDate: newEvent.date,
      startTime: newEvent.time,
      location: newEvent.venue,
      venue: newEvent.venue,
      description: newEvent.description || undefined,
      status: "SCHEDULED",
      branches: newEvent.branches ? newEvent.branches.split(',').map((b: string) => b.trim()) : [],
    };

    setEvents((prevEvents) => [calendarEvent, ...prevEvents]);
    if (onAddEvent) {
      onAddEvent(calendarEvent);
    }
    calendarApi.create({
      title: calendarEvent.title,
      eventType: calendarEvent.eventType,
      scheduledDate: calendarEvent.scheduledDate,
      startTime: calendarEvent.startTime,
      location: calendarEvent.location,
      description: calendarEvent.description
    }).catch(() => {
      // Ignored for mock mode
    });

    setShowEventForm(false);
  };

  const calendarEvents = events.map((event: CalendarEvent) => {
    const color = getEventColor(event);
    return {
      id: String(event.id),
      title: event.title || `${event.companyName || event.company || ''} ${event.eventType ? `(${event.eventType})` : ''}`,
      start: event.scheduledDate && event.startTime
        ? (event.startTime.includes('T') ? event.startTime : `${event.scheduledDate}T${event.startTime.slice(0, 5)}:00`)
        : event.scheduledDate,
      end: event.scheduledDate && event.endTime
        ? (event.endTime.includes('T') ? event.endTime : `${event.scheduledDate}T${event.endTime.slice(0, 5)}:00`)
        : undefined,
      backgroundColor: color.bg,
      borderColor: color.border,
      textColor: color.text,
      extendedProps: { rawEvent: event }
    };
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* PAGE HEADER */}
      <div className="sp-page-header">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight flex items-center gap-3">
            <CalendarIcon size={28} className="text-blue-600 shrink-0" />
            Placement Calendar
          </h1>
          <p className="sp-page-subtitle">
            {readOnly
              ? "View scheduled placement drives, application deadlines, and add private off-campus events."
              : "Schedule and manage all placement activities across campus drives."}
          </p>
        </div>

        {/* ADD EVENT BUTTON */}
        <button
          type="button"
          className="btn btn-primary h-12 px-7 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 self-start sm:self-center cursor-pointer transition-all"
          onClick={() => setShowEventForm(true)}
        >
          <Plus size={18} />
          <span>{readOnly ? "Add Private Event / Task" : "Add Placement Event / Task"}</span>
        </button>
      </div>

      {/* CALENDAR + UPCOMING EVENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* MAIN CALENDAR */}
        <div className="col-span-1 lg:col-span-3 glass-card p-6 sm:p-7 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            height="720px"
            events={calendarEvents}
            eventClick={(info) => {
              const raw = info.event.extendedProps.rawEvent as CalendarEvent;
              if (raw) handleSelectEvent(raw);
            }}
          />
        </div>

        {/* UPCOMING EVENTS */}
        <div>
          <UpcomingEvents events={events} onSelectEvent={handleSelectEvent} />
        </div>
      </div>

      {/* ADD EVENT MODAL */}
      {showEventForm && (
        <EventForm
          onClose={() => setShowEventForm(false)}
          onSave={handleSaveEvent}
          isPrivate={readOnly}
        />
      )}

      {/* EVENT DETAILS MODAL */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}