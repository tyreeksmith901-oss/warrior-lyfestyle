import { useState, useMemo } from "react";
import { Sidebar, MobileNav } from "@/components/Navigation";
import { useRecoveryEntries, useSleepEntries, useCreateRecoveryEntry, useCreateSleepEntry, useDeleteEntry } from "@/hooks/use-fitness-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Plus, Moon, Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfWeek, endOfWeek, isWithinInterval, addWeeks, subWeeks, isSameWeek } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";

// === RECOVERY FORM ===
const recoverySchema = z.object({
  type: z.string().min(1, "Type is required"),
  duration: z.coerce.number().min(1),
  notes: z.string().optional(),
});

function RecoverySection() {
  const { data: entries = [], isLoading } = useRecoveryEntries();
  const createEntry = useCreateRecoveryEntry();
  const deleteEntry = useDeleteEntry("recovery");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  const isCurrentWeek = isSameWeek(selectedWeek, new Date(), { weekStartsOn: 0 });

  const weekEntries = useMemo(() => {
    const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 0 });
    return entries.filter(entry => {
      const date = new Date(entry.date);
      return isWithinInterval(date, { start: weekStart, end: weekEnd });
    });
  }, [entries, selectedWeek]);

  const form = useForm({
    resolver: zodResolver(recoverySchema),
    defaultValues: { type: "", duration: 15, notes: "" },
  });

  function onSubmit(values: any) {
    createEntry.mutate({ ...values, date: new Date() }, { onSuccess: () => setIsOpen(false) });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-xl font-semibold">Recovery Sessions</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-purple-500 text-purple-600 hover:bg-purple-50">
              <Plus className="h-4 w-4 mr-2" /> Log Recovery
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Log Recovery</DialogTitle></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Activity Type</Label>
                      <FormControl><Input placeholder="Stretching, Massage, Meditation..." {...field} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Duration (min)</Label>
                      <FormControl><Input type="number" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-purple-600">Save</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center justify-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => setSelectedWeek(subWeeks(selectedWeek, 1))} data-testid="button-recovery-prev-week">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center min-w-[200px]">
          <span className="font-medium text-sm">
            {format(startOfWeek(selectedWeek, { weekStartsOn: 0 }), "MMM d")} - {format(endOfWeek(selectedWeek, { weekStartsOn: 0 }), "MMM d, yyyy")}
          </span>
          {isCurrentWeek && <span className="text-xs text-muted-foreground ml-2">(This Week)</span>}
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSelectedWeek(addWeeks(selectedWeek, 1))} data-testid="button-recovery-next-week">
          <ChevronRight className="h-4 w-4" />
        </Button>
        {!isCurrentWeek && (
          <Button variant="outline" size="sm" onClick={() => setSelectedWeek(new Date())} data-testid="button-recovery-this-week">
            This Week
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {weekEntries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No recovery sessions this week</div>
        ) : weekEntries.map((entry) => (
          <Card key={entry.id} className="p-4 flex justify-between items-center border-l-4 border-l-purple-500">
            <div className="flex gap-4 items-center">
              <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">{entry.type}</p>
                <p className="text-xs text-muted-foreground">{format(new Date(entry.date), "EEEE, MMM d")} • {entry.duration} mins</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => deleteEntry.mutate(entry.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

// === SLEEP FORM ===
const sleepSchema = z.object({
  duration: z.coerce.number().min(0.1),
  quality: z.coerce.number().min(1).max(10),
  notes: z.string().optional(),
});

function SleepSection() {
  const { data: entries = [], isLoading } = useSleepEntries();
  const createEntry = useCreateSleepEntry();
  const deleteEntry = useDeleteEntry("sleep");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  const isCurrentWeek = isSameWeek(selectedWeek, new Date(), { weekStartsOn: 0 });

  const weekEntries = useMemo(() => {
    const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 0 });
    return entries.filter(entry => {
      const date = new Date(entry.date);
      return isWithinInterval(date, { start: weekStart, end: weekEnd });
    });
  }, [entries, selectedWeek]);

  const form = useForm({
    resolver: zodResolver(sleepSchema),
    defaultValues: { duration: 8, quality: 7, notes: "" },
  });

  function onSubmit(values: any) {
    createEntry.mutate({ 
      ...values, 
      duration: values.duration.toString(), 
      date: new Date() 
    }, { onSuccess: () => setIsOpen(false) });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-xl font-semibold">Sleep History</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-indigo-500 text-indigo-600 hover:bg-indigo-50">
              <Plus className="h-4 w-4 mr-2" /> Log Sleep
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Log Sleep</DialogTitle></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Duration (hours)</Label>
                      <FormControl><Input type="number" step="0.5" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quality"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Quality (1-10): {field.value}</Label>
                      <FormControl>
                        <Slider 
                          min={1} max={10} step={1} 
                          value={[field.value]} 
                          onValueChange={(vals) => field.onChange(vals[0])} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-indigo-600">Save</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center justify-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => setSelectedWeek(subWeeks(selectedWeek, 1))} data-testid="button-sleep-prev-week">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center min-w-[200px]">
          <span className="font-medium text-sm">
            {format(startOfWeek(selectedWeek, { weekStartsOn: 0 }), "MMM d")} - {format(endOfWeek(selectedWeek, { weekStartsOn: 0 }), "MMM d, yyyy")}
          </span>
          {isCurrentWeek && <span className="text-xs text-muted-foreground ml-2">(This Week)</span>}
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSelectedWeek(addWeeks(selectedWeek, 1))} data-testid="button-sleep-next-week">
          <ChevronRight className="h-4 w-4" />
        </Button>
        {!isCurrentWeek && (
          <Button variant="outline" size="sm" onClick={() => setSelectedWeek(new Date())} data-testid="button-sleep-this-week">
            This Week
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {weekEntries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No sleep entries this week</div>
        ) : weekEntries.map((entry) => (
          <Card key={entry.id} className="p-4 flex justify-between items-center border-l-4 border-l-indigo-500">
             <div className="flex gap-4 items-center">
              <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                <Moon className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium">{entry.duration} Hours</p>
                <p className="text-xs text-muted-foreground">{format(new Date(entry.date), "EEEE, MMM d")} • Quality: {entry.quality}/10</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => deleteEntry.mutate(entry.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function RecoverySleep() {
  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <MobileNav />
        <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold tracking-tight">Recovery & Sleep</h1>
            <p className="text-muted-foreground">Rest is when the growth happens.</p>
          </div>

          <Tabs defaultValue="sleep" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="sleep" className="px-8">Sleep</TabsTrigger>
              <TabsTrigger value="recovery" className="px-8">Recovery</TabsTrigger>
            </TabsList>
            <TabsContent value="sleep">
              <SleepSection />
            </TabsContent>
            <TabsContent value="recovery">
              <RecoverySection />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
