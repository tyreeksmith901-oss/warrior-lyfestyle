import { useState, useMemo } from "react";
import { Sidebar, MobileNav } from "@/components/Navigation";
import { useWeightEntries, useCreateWeightEntry, useDeleteEntry } from "@/hooks/use-fitness-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Trash2, Plus, Scale, ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval, addMonths, subMonths } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const formSchema = z.object({
  weight: z.coerce.number().min(1, "Weight must be positive"),
  note: z.string().optional(),
});

export default function WeightTracker() {
  const { data: entries = [], isLoading } = useWeightEntries();
  const createEntry = useCreateWeightEntry();
  const deleteEntry = useDeleteEntry("weight");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weight: undefined,
      note: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createEntry.mutate({
      weight: values.weight.toString(),
      note: values.note || null,
      date: new Date(),
    }, {
      onSuccess: () => {
        setIsOpen(false);
        form.reset();
      }
    });
  }

  const last30DaysData = useMemo(() => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    return entries
      .filter(entry => new Date(entry.date) >= thirtyDaysAgo)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(entry => ({
        date: format(new Date(entry.date), "MMM d"),
        weight: parseFloat(entry.weight),
        fullDate: entry.date,
      }));
  }, [entries]);

  const monthlyData = useMemo(() => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    return entries
      .filter(entry => isWithinInterval(new Date(entry.date), { start, end }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries, selectedMonth]);

  const stats = useMemo(() => {
    if (entries.length === 0) return { current: 0, change: 0, min: 0, max: 0 };
    
    const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const current = parseFloat(sorted[0]?.weight || "0");
    const oldest = parseFloat(sorted[sorted.length - 1]?.weight || "0");
    const weights = entries.map(e => parseFloat(e.weight));
    
    return {
      current,
      change: current - oldest,
      min: Math.min(...weights),
      max: Math.max(...weights),
    };
  }, [entries]);

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <MobileNav />
        <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight">Weight Tracker</h1>
              <p className="text-muted-foreground">Monitor your progress over time</p>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="warrior-gradient accent-text shadow-lg" data-testid="button-log-weight">
                  <Plus className="h-4 w-4 mr-2" /> Log Weight
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Weight Entry</DialogTitle>
                  <DialogDescription>Enter your current weight in pounds</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Weight (lbs)</Label>
                          <FormControl>
                            <div className="relative">
                              <Scale className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input 
                                type="number" 
                                step="0.1" 
                                className="pl-9" 
                                placeholder="185.5" 
                                {...field}
                                value={field.value ?? ""}
                                data-testid="input-weight" 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="note"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Note (Optional)</Label>
                          <FormControl>
                            <Input 
                              placeholder="Feeling great..." 
                              {...field}
                              value={field.value ?? ""}
                              data-testid="input-weight-note" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full warrior-gradient accent-text" disabled={createEntry.isPending} data-testid="button-submit-weight">
                      {createEntry.isPending ? "Saving..." : "Save Entry"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="warrior-gradient border-2 accent-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Scale className="h-6 w-6 accent-text" />
                  <div>
                    <p className="text-xs text-white/70">Current</p>
                    <p className="text-xl font-bold accent-text" data-testid="text-current-weight">{stats.current.toFixed(1)} lbs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  {stats.change <= 0 ? (
                    <TrendingDown className="h-6 w-6 text-green-500" />
                  ) : (
                    <TrendingUp className="h-6 w-6 text-red-500" />
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">Change</p>
                    <p className={`text-xl font-bold ${stats.change <= 0 ? 'text-green-500' : 'text-red-500'}`} data-testid="text-weight-change">
                      {stats.change > 0 ? '+' : ''}{stats.change.toFixed(1)} lbs
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Lowest</p>
                  <p className="text-xl font-bold text-green-500">{stats.min.toFixed(1)} lbs</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Highest</p>
                  <p className="text-xl font-bold text-red-500">{stats.max.toFixed(1)} lbs</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 accent-text" />
                Last 30 Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {last30DaysData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={last30DaysData}>
                      <defs>
                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--warrior-gold))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--warrior-gold))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={['dataMin - 5', 'dataMax + 5']} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                        formatter={(value: number) => [`${value.toFixed(1)} lbs`, 'Weight']}
                      />
                      <Area type="monotone" dataKey="weight" stroke="hsl(var(--warrior-gold))" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No data in the last 30 days
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Monthly History</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))} data-testid="button-prev-month">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="font-medium min-w-[120px] text-center">{format(selectedMonth, "MMMM yyyy")}</span>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))} data-testid="button-next-month">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading...</p>
              ) : monthlyData.length > 0 ? (
                <div className="space-y-3">
                  {monthlyData.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg" data-testid={`weight-entry-${entry.id}`}>
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full warrior-gradient flex items-center justify-center">
                          <Scale className="h-5 w-5 accent-text" />
                        </div>
                        <div>
                          <p className="font-bold text-lg">{entry.weight} lbs</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(entry.date), "EEEE, MMMM d 'at' h:mm a")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {entry.note && <span className="text-sm text-muted-foreground italic hidden sm:inline">{entry.note}</span>}
                        <Button variant="ghost" size="icon" onClick={() => deleteEntry.mutate(entry.id)} data-testid={`button-delete-weight-${entry.id}`}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Scale className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No entries for {format(selectedMonth, "MMMM yyyy")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
