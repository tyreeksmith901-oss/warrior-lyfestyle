import { useState, useMemo, useRef } from "react";
import { Sidebar, MobileNav } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CalendarDays, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Clock, 
  MapPin, 
  Upload, 
  Download,
  Calendar as CalendarIcon,
  List,
  Grid3X3,
  Pencil
} from "lucide-react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
  parseISO,
  addDays
} from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { CalendarEvent } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
  { value: "work", label: "Work", color: "#3B82F6" },
  { value: "personal", label: "Personal", color: "#10B981" },
  { value: "health", label: "Health", color: "#EF4444" },
  { value: "fitness", label: "Fitness", color: "#F59E0B" },
  { value: "finance", label: "Finance", color: "#8B5CF6" },
  { value: "social", label: "Social", color: "#EC4899" },
  { value: "other", label: "Other", color: "#6B7280" },
];

const REMINDERS = [
  { value: "none", label: "No reminder" },
  { value: "15min", label: "15 minutes before" },
  { value: "30min", label: "30 minutes before" },
  { value: "1hour", label: "1 hour before" },
  { value: "1day", label: "1 day before" },
];

const RECURRING_OPTIONS = [
  { value: "none", label: "Does not repeat" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"month" | "week" | "list">("month");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [editEvent, setEditEvent] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "09:00",
    endDate: "",
    endTime: "10:00",
    allDay: false,
    location: "",
    category: "personal",
    reminder: "none",
    recurring: "none",
    color: "#D4AF37",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "09:00",
    endDate: "",
    endTime: "10:00",
    allDay: false,
    location: "",
    category: "personal",
    reminder: "none",
    recurring: "none",
    color: "#D4AF37",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/calendar"],
  });

  const createEvent = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/calendar", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar"] });
      setIsCreateOpen(false);
      resetForm();
      toast({ title: "Event created successfully" });
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/calendar/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar"] });
      setSelectedEvent(null);
      toast({ title: "Event deleted" });
    },
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest("PUT", `/api/calendar/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar"] });
      setIsEditOpen(false);
      setSelectedEvent(null);
      toast({ title: "Event updated successfully" });
    },
  });

  const importEvents = useMutation({
    mutationFn: async (data: { icsData: string; sourceCalendar: string }) => {
      const res = await apiRequest("POST", "/api/calendar/import", data);
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar"] });
      toast({ title: `Imported ${data.imported} events` });
    },
    onError: () => {
      toast({ title: "Failed to import calendar", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setNewEvent({
      title: "",
      description: "",
      startDate: "",
      startTime: "09:00",
      endDate: "",
      endTime: "10:00",
      allDay: false,
      location: "",
      category: "personal",
      reminder: "none",
      recurring: "none",
      color: "#D4AF37",
    });
  };

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.startDate) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }

    const startDateTime = newEvent.allDay 
      ? new Date(newEvent.startDate)
      : new Date(`${newEvent.startDate}T${newEvent.startTime}`);
    
    const endDateTime = newEvent.allDay
      ? new Date(newEvent.endDate || newEvent.startDate)
      : new Date(`${newEvent.endDate || newEvent.startDate}T${newEvent.endTime}`);

    createEvent.mutate({
      title: newEvent.title,
      description: newEvent.description || null,
      startDate: startDateTime,
      endDate: endDateTime,
      allDay: newEvent.allDay,
      location: newEvent.location || null,
      category: newEvent.category,
      reminder: newEvent.reminder === "none" ? null : newEvent.reminder,
      recurring: newEvent.recurring === "none" ? null : newEvent.recurring,
      color: newEvent.color,
    });
  };

  const openEditDialog = (event: CalendarEvent) => {
    const startDate = new Date(event.startDate);
    const endDate = event.endDate ? new Date(event.endDate) : startDate;
    
    setEditingEventId(event.id);
    setEditEvent({
      title: event.title,
      description: event.description || "",
      startDate: format(startDate, "yyyy-MM-dd"),
      startTime: format(startDate, "HH:mm"),
      endDate: format(endDate, "yyyy-MM-dd"),
      endTime: format(endDate, "HH:mm"),
      allDay: event.allDay || false,
      location: event.location || "",
      category: event.category || "personal",
      reminder: event.reminder || "none",
      recurring: event.recurring || "none",
      color: event.color || "#D4AF37",
    });
    setSelectedEvent(null);
    setIsEditOpen(true);
  };

  const handleEditEvent = () => {
    if (!editingEventId) return;
    if (!editEvent.title || !editEvent.startDate) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }

    const startDateTime = editEvent.allDay 
      ? new Date(editEvent.startDate)
      : new Date(`${editEvent.startDate}T${editEvent.startTime}`);
    
    const endDateTime = editEvent.allDay
      ? new Date(editEvent.endDate || editEvent.startDate)
      : new Date(`${editEvent.endDate || editEvent.startDate}T${editEvent.endTime}`);

    updateEvent.mutate({
      id: editingEventId,
      data: {
        title: editEvent.title,
        description: editEvent.description || null,
        startDate: startDateTime,
        endDate: endDateTime,
        allDay: editEvent.allDay,
        location: editEvent.location || null,
        category: editEvent.category,
        reminder: editEvent.reminder === "none" ? null : editEvent.reminder,
        recurring: editEvent.recurring === "none" ? null : editEvent.recurring,
        color: editEvent.color,
      }
    });
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const icsData = event.target?.result as string;
        importEvents.mutate({ icsData, sourceCalendar: "ics" });
      };
      reader.readAsText(file);
    }
  };

  const handleExport = () => {
    window.location.href = "/api/calendar/export";
  };

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return isSameDay(eventDate, date);
    });
  };

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    return events
      .filter(event => new Date(event.startDate) >= today)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 10);
  }, [events]);

  const getCategoryColor = (category: string | null) => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat?.color || "#D4AF37";
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <MobileNav />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight">Calendar</h1>
              <p className="text-muted-foreground">Manage your schedule and events</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="file"
                ref={fileInputRef}
                accept=".ics"
                onChange={handleFileImport}
                className="hidden"
              />
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                disabled={importEvents.isPending}
                data-testid="button-import-calendar"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import .ics
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExport}
                data-testid="button-export-calendar"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="warrior-gradient accent-text shadow-lg" data-testid="button-create-event">
                    <Plus className="h-4 w-4 mr-2" /> New Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Event</DialogTitle>
                    <DialogDescription>Add a new event to your calendar</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label>Title *</Label>
                      <Input
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        placeholder="Event title"
                        data-testid="input-event-title"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={newEvent.allDay}
                        onCheckedChange={(checked) => setNewEvent({ ...newEvent, allDay: checked })}
                        data-testid="switch-all-day"
                      />
                      <Label>All day event</Label>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Start Date *</Label>
                        <Input
                          type="date"
                          value={newEvent.startDate}
                          onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value, endDate: e.target.value })}
                          data-testid="input-start-date"
                        />
                      </div>
                      {!newEvent.allDay && (
                        <div>
                          <Label>Start Time</Label>
                          <Input
                            type="time"
                            value={newEvent.startTime}
                            onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                            data-testid="input-start-time"
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={newEvent.endDate}
                          onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                          data-testid="input-end-date"
                        />
                      </div>
                      {!newEvent.allDay && (
                        <div>
                          <Label>End Time</Label>
                          <Input
                            type="time"
                            value={newEvent.endTime}
                            onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                            data-testid="input-end-time"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <Label>Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          className="pl-10"
                          value={newEvent.location}
                          onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                          placeholder="Add location"
                          data-testid="input-location"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        placeholder="Add description"
                        rows={3}
                        data-testid="input-description"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Category</Label>
                        <Select value={newEvent.category} onValueChange={(v) => setNewEvent({ ...newEvent, category: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                <div className="flex items-center gap-2">
                                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                                  {cat.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Reminder</Label>
                        <Select value={newEvent.reminder} onValueChange={(v) => setNewEvent({ ...newEvent, reminder: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {REMINDERS.map((rem) => (
                              <SelectItem key={rem.value} value={rem.value}>{rem.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Repeat</Label>
                      <Select value={newEvent.recurring} onValueChange={(v) => setNewEvent({ ...newEvent, recurring: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RECURRING_OPTIONS.map((rec) => (
                            <SelectItem key={rec.value} value={rec.value}>{rec.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Event Color</Label>
                      <div className="flex gap-2 mt-2">
                        {["#D4AF37", "#3B82F6", "#10B981", "#EF4444", "#F59E0B", "#8B5CF6", "#EC4899"].map((color) => (
                          <button
                            key={color}
                            type="button"
                            className={`h-8 w-8 rounded-full border-2 ${newEvent.color === color ? 'border-foreground' : 'border-transparent'}`}
                            style={{ backgroundColor: color }}
                            onClick={() => setNewEvent({ ...newEvent, color })}
                          />
                        ))}
                      </div>
                    </div>

                    <Button 
                      onClick={handleCreateEvent} 
                      disabled={createEvent.isPending} 
                      className="w-full warrior-gradient accent-text"
                      data-testid="button-submit-event"
                    >
                      {createEvent.isPending ? "Creating..." : "Create Event"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} data-testid="button-prev-month">
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <CardTitle className="min-w-[180px] text-center">
                        {format(currentMonth, "MMMM yyyy")}
                      </CardTitle>
                      <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} data-testid="button-next-month">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant={viewMode === "month" ? "secondary" : "ghost"} 
                        size="icon"
                        onClick={() => setViewMode("month")}
                        data-testid="button-view-month"
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant={viewMode === "list" ? "secondary" : "ghost"} 
                        size="icon"
                        onClick={() => setViewMode("list")}
                        data-testid="button-view-list"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {viewMode === "month" ? (
                    <>
                      <div className="grid grid-cols-7 gap-px mb-2">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                            {day}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
                        {monthDays.map((day, idx) => {
                          const dayEvents = getEventsForDay(day);
                          const isCurrentMonth = isSameMonth(day, currentMonth);
                          const today = isToday(day);
                          
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setSelectedDate(day);
                                setNewEvent({ ...newEvent, startDate: format(day, "yyyy-MM-dd"), endDate: format(day, "yyyy-MM-dd") });
                              }}
                              className={`min-h-[80px] p-1 text-left transition-colors ${
                                isCurrentMonth ? 'bg-card hover:bg-muted' : 'bg-muted/50'
                              } ${today ? 'ring-2 ring-primary ring-inset' : ''}`}
                              data-testid={`calendar-day-${format(day, "yyyy-MM-dd")}`}
                            >
                              <div className={`text-sm font-medium mb-1 ${
                                today ? 'text-primary' : isCurrentMonth ? '' : 'text-muted-foreground'
                              }`}>
                                {format(day, "d")}
                              </div>
                              <div className="space-y-0.5">
                                {dayEvents.slice(0, 3).map((event) => (
                                  <div
                                    key={event.id}
                                    className="text-[10px] px-1 py-0.5 rounded truncate cursor-pointer"
                                    style={{ 
                                      backgroundColor: `${event.color || getCategoryColor(event.category)}20`,
                                      color: event.color || getCategoryColor(event.category),
                                      borderLeft: `2px solid ${event.color || getCategoryColor(event.category)}`
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedEvent(event);
                                    }}
                                    data-testid={`event-${event.id}`}
                                  >
                                    {event.title}
                                  </div>
                                ))}
                                {dayEvents.length > 3 && (
                                  <div className="text-[10px] text-muted-foreground px-1">
                                    +{dayEvents.length - 3} more
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      {isLoading ? (
                        <p>Loading events...</p>
                      ) : events.length > 0 ? (
                        events
                          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                          .map((event) => (
                            <div 
                              key={event.id} 
                              className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border-l-4"
                              style={{ borderLeftColor: event.color || getCategoryColor(event.category) }}
                              data-testid={`list-event-${event.id}`}
                            >
                              <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${event.color || getCategoryColor(event.category)}20` }}>
                                  <CalendarDays className="h-5 w-5" style={{ color: event.color || getCategoryColor(event.category) }} />
                                </div>
                                <div>
                                  <p className="font-bold">{event.title}</p>
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {format(new Date(event.startDate), event.allDay ? "MMM d, yyyy" : "MMM d, yyyy 'at' h:mm a")}
                                    </span>
                                    {event.location && (
                                      <span className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {event.location}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => deleteEvent.mutate(event.id)}
                                data-testid={`button-delete-event-${event.id}`}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          ))
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-20" />
                          <p>No events scheduled</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingEvents.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingEvents.map((event) => (
                        <div 
                          key={event.id} 
                          className="p-3 rounded-lg border-l-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                          style={{ borderLeftColor: event.color || getCategoryColor(event.category) }}
                          onClick={() => setSelectedEvent(event)}
                          data-testid={`upcoming-event-${event.id}`}
                        >
                          <p className="font-medium text-sm">{event.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(event.startDate), event.allDay ? "MMM d" : "MMM d 'at' h:mm a")}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No upcoming events</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Events</span>
                      <span className="font-bold">{events.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">This Month</span>
                      <span className="font-bold">
                        {events.filter(e => isSameMonth(new Date(e.startDate), new Date())).length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Upcoming</span>
                      <span className="font-bold accent-text">{upcomingEvents.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {selectedEvent && (
            <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{selectedEvent.title}</DialogTitle>
                  <DialogDescription>Event details</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {format(new Date(selectedEvent.startDate), selectedEvent.allDay ? "MMMM d, yyyy" : "MMMM d, yyyy 'at' h:mm a")}
                      {selectedEvent.endDate && !isSameDay(new Date(selectedEvent.startDate), new Date(selectedEvent.endDate)) && (
                        <> - {format(new Date(selectedEvent.endDate), selectedEvent.allDay ? "MMMM d, yyyy" : "MMMM d, yyyy 'at' h:mm a")}</>
                      )}
                    </span>
                  </div>
                  {selectedEvent.location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedEvent.location}</span>
                    </div>
                  )}
                  {selectedEvent.description && (
                    <p className="text-sm">{selectedEvent.description}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-4 w-4 rounded-full" 
                      style={{ backgroundColor: selectedEvent.color || getCategoryColor(selectedEvent.category) }} 
                    />
                    <span className="text-sm capitalize">{selectedEvent.category || "Uncategorized"}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      onClick={() => openEditDialog(selectedEvent)}
                      data-testid="button-edit-selected-event"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="flex-1" 
                      onClick={() => deleteEvent.mutate(selectedEvent.id)}
                      data-testid="button-delete-selected-event"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          <Dialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) setEditingEventId(null); }}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Event</DialogTitle>
                <DialogDescription>Update your event details</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={editEvent.title}
                    onChange={(e) => setEditEvent({ ...editEvent, title: e.target.value })}
                    placeholder="Event title"
                    data-testid="input-edit-event-title"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={editEvent.allDay}
                    onCheckedChange={(checked) => setEditEvent({ ...editEvent, allDay: checked })}
                    data-testid="switch-edit-all-day"
                  />
                  <Label>All day event</Label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Start Date *</Label>
                    <Input
                      type="date"
                      value={editEvent.startDate}
                      onChange={(e) => setEditEvent({ ...editEvent, startDate: e.target.value })}
                      data-testid="input-edit-start-date"
                    />
                  </div>
                  {!editEvent.allDay && (
                    <div>
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={editEvent.startTime}
                        onChange={(e) => setEditEvent({ ...editEvent, startTime: e.target.value })}
                        data-testid="input-edit-start-time"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={editEvent.endDate}
                      onChange={(e) => setEditEvent({ ...editEvent, endDate: e.target.value })}
                      data-testid="input-edit-end-date"
                    />
                  </div>
                  {!editEvent.allDay && (
                    <div>
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        value={editEvent.endTime}
                        onChange={(e) => setEditEvent({ ...editEvent, endTime: e.target.value })}
                        data-testid="input-edit-end-time"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label>Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      value={editEvent.location}
                      onChange={(e) => setEditEvent({ ...editEvent, location: e.target.value })}
                      placeholder="Add location"
                      data-testid="input-edit-location"
                    />
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={editEvent.description}
                    onChange={(e) => setEditEvent({ ...editEvent, description: e.target.value })}
                    placeholder="Add description"
                    rows={3}
                    data-testid="input-edit-description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Category</Label>
                    <Select value={editEvent.category} onValueChange={(v) => setEditEvent({ ...editEvent, category: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                              {cat.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Reminder</Label>
                    <Select value={editEvent.reminder} onValueChange={(v) => setEditEvent({ ...editEvent, reminder: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {REMINDERS.map((rem) => (
                          <SelectItem key={rem.value} value={rem.value}>{rem.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Repeat</Label>
                  <Select value={editEvent.recurring} onValueChange={(v) => setEditEvent({ ...editEvent, recurring: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RECURRING_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Event Color</Label>
                  <div className="flex gap-2 flex-wrap mt-2">
                    {["#D4AF37", "#3B82F6", "#10B981", "#EF4444", "#F59E0B", "#8B5CF6", "#EC4899"].map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`h-8 w-8 rounded-full border-2 ${editEvent.color === color ? "border-white" : "border-transparent"}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setEditEvent({ ...editEvent, color })}
                      />
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full warrior-gradient accent-text"
                  onClick={handleEditEvent}
                  disabled={updateEvent.isPending}
                  data-testid="button-save-event"
                >
                  {updateEvent.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}
