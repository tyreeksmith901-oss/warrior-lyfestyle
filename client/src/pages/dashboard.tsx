import { useAuth } from "@/hooks/use-auth";
import { useWeightEntries, useWorkouts, useSleepEntries, useDietEntries } from "@/hooks/use-fitness-data";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Sidebar, MobileNav } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Activity, Moon, Scale, TrendingUp, Flame, Wallet, CheckSquare, CalendarDays, CreditCard, Quote, Pencil, Plus } from "lucide-react";
import type { Todo, CalendarEvent, BudgetAccount, MotivationalQuote } from "@shared/schema";
import { useState, useMemo } from "react";

function BoxingGlove({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 8c0-2.2-1.8-4-4-4H9C6.8 4 5 5.8 5 8v4c0 2.2 1.8 4 4 4h1v4h4v-4h1c2.2 0 4-1.8 4-4V8z" />
      <path d="M9 8h6" />
      <path d="M12 8v4" />
      <circle cx="8" cy="10" r="1" />
      <circle cx="16" cy="10" r="1" />
    </svg>
  );
}
import { Redirect, Link } from "wouter";
import { format, subDays, isToday, isTomorrow, isThisWeek } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { BudgetTransaction } from "@shared/schema";

function StatCard({ title, value, subtext, icon: Icon, colorClass, href }: any) {
  const content = (
    <Card className="p-6 border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
          <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
        </div>
        <div className={`p-3 rounded-xl ${colorClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { data: weightData } = useWeightEntries();
  const { data: workoutsData } = useWorkouts();
  const { data: sleepData } = useSleepEntries();
  const { data: dietData } = useDietEntries();
  
  const { data: transactions = [] } = useQuery<BudgetTransaction[]>({
    queryKey: ["/api/budget/transactions"],
    queryFn: async () => {
      const res = await fetch("/api/budget/transactions", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: todos = [] } = useQuery<Todo[]>({
    queryKey: ["/api/todos"],
    enabled: isAuthenticated,
  });

  const { data: calendarEvents = [] } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/calendar"],
    enabled: isAuthenticated,
  });

  const { data: accounts = [] } = useQuery<BudgetAccount[]>({
    queryKey: ["/api/budget/accounts"],
    enabled: isAuthenticated,
  });

  const { data: quotes = [] } = useQuery<MotivationalQuote[]>({
    queryKey: ["/api/quotes"],
    enabled: isAuthenticated,
  });

  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [newQuoteText, setNewQuoteText] = useState("");
  const [newQuoteAuthor, setNewQuoteAuthor] = useState("");
  const [editingQuote, setEditingQuote] = useState<MotivationalQuote | null>(null);

  const createQuote = useMutation({
    mutationFn: async (data: { text: string; author?: string }) => {
      return apiRequest("POST", "/api/quotes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      setIsQuoteDialogOpen(false);
      setNewQuoteText("");
      setNewQuoteAuthor("");
    },
  });

  const updateQuote = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { text: string; author?: string } }) => {
      return apiRequest("PUT", `/api/quotes/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      setIsQuoteDialogOpen(false);
      setEditingQuote(null);
      setNewQuoteText("");
      setNewQuoteAuthor("");
    },
  });

  const defaultQuotes = [
    { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
    { text: "Champions are made from something deep inside them - a desire, a dream, a vision.", author: "Muhammad Ali" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "The body achieves what the mind believes.", author: "Napoleon Hill" },
    { text: "Strength does not come from physical capacity. It comes from an indomitable will.", author: "Mahatma Gandhi" },
    { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Unknown" },
    { text: "A warrior's greatest battle is the one within.", author: "Unknown" },
    { text: "Your only limit is the one you set yourself.", author: "Unknown" },
    { text: "Excellence is not a skill. It is an attitude.", author: "Ralph Marston" },
    { text: "Do not pray for easy lives. Pray to be stronger men.", author: "John F. Kennedy" },
  ];

  const dailyQuote = useMemo(() => {
    if (quotes.length > 0) {
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
      return quotes[dayOfYear % quotes.length];
    }
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return defaultQuotes[dayOfYear % defaultQuotes.length];
  }, [quotes]);

  const handleSaveQuote = () => {
    if (!newQuoteText.trim()) return;
    if (editingQuote) {
      updateQuote.mutate({ id: editingQuote.id, data: { text: newQuoteText, author: newQuoteAuthor || undefined } });
    } else {
      createQuote.mutate({ text: newQuoteText, author: newQuoteAuthor || undefined });
    }
  };

  const openEditQuote = () => {
    if (quotes.length > 0 && 'id' in dailyQuote) {
      setEditingQuote(dailyQuote as MotivationalQuote);
      setNewQuoteText((dailyQuote as MotivationalQuote).text);
      setNewQuoteAuthor((dailyQuote as MotivationalQuote).author || "");
    } else {
      setEditingQuote(null);
      setNewQuoteText("");
      setNewQuoteAuthor("");
    }
    setIsQuoteDialogOpen(true);
  };

  if (isLoading) return <div className="h-screen w-screen flex items-center justify-center bg-background"><Skeleton className="h-12 w-12 rounded-full" /></div>;
  if (!isAuthenticated) return <Redirect to="/" />;

  const latestWeight = weightData?.[0]?.weight || "—";
  const workoutCount = workoutsData?.length || 0;
  const avgSleep = sleepData && sleepData.length > 0
    ? (sleepData.reduce((acc, curr) => acc + Number(curr.duration), 0) / sleepData.length).toFixed(1)
    : "—";

  const todayCalories = dietData
    ?.filter(d => new Date(d.date).toDateString() === new Date().toDateString())
    .reduce((sum, d) => sum + (d.calories || 0), 0) || 0;

  const monthlyExpenses = transactions
    .filter(t => t.type === "expense" && new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const chartData = weightData ? [...weightData].reverse().slice(-14).map(w => ({
    date: format(new Date(w.date), "MMM d"),
    weight: parseFloat(w.weight),
  })) : [];

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <MobileNav />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl warrior-gradient flex items-center justify-center border-2 accent-border">
                <BoxingGlove className="h-8 w-8 accent-text" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold tracking-tight">
                  Welcome back, <span className="accent-text">{user?.firstName || "Warrior"}</span>
                </h1>
                <p className="text-muted-foreground mt-1">
                  Your warrior dashboard - health and wealth at a glance
                </p>
              </div>
            </div>

            {/* Daily Motivational Quote Widget */}
            <Card className="p-6 border shadow-sm relative" data-testid="widget-quote">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl warrior-gradient shrink-0">
                  <Quote className="h-6 w-6 accent-text" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-medium italic text-foreground" data-testid="text-daily-quote">
                    "{dailyQuote.text}"
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    — {dailyQuote.author || "Unknown"}
                  </p>
                </div>
                <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={openEditQuote}
                      data-testid="button-edit-quote"
                    >
                      {quotes.length > 0 ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingQuote ? "Edit Quote" : "Add Your Own Quote"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Quote Text</label>
                        <Input
                          value={newQuoteText}
                          onChange={(e) => setNewQuoteText(e.target.value)}
                          placeholder="Enter your motivational quote..."
                          data-testid="input-quote-text"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Author (optional)</label>
                        <Input
                          value={newQuoteAuthor}
                          onChange={(e) => setNewQuoteAuthor(e.target.value)}
                          placeholder="Who said this?"
                          data-testid="input-quote-author"
                        />
                      </div>
                      <Button 
                        onClick={handleSaveQuote} 
                        className="w-full warrior-gradient accent-text"
                        disabled={!newQuoteText.trim() || createQuote.isPending || updateQuote.isPending}
                        data-testid="button-save-quote"
                      >
                        {editingQuote ? "Update Quote" : "Add Quote"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard
                title="Current Weight"
                value={`${latestWeight} lbs`}
                subtext="Latest measurement"
                icon={Scale}
                colorClass="warrior-gradient accent-text"
                href="/weight"
              />
              <StatCard
                title="Today's Calories"
                value={todayCalories}
                subtext="Consumed today"
                icon={Flame}
                colorClass="bg-orange-500/10 text-orange-600"
                href="/diet"
              />
              <StatCard
                title="Total Workouts"
                value={workoutCount}
                subtext="Keep pushing!"
                icon={Activity}
                colorClass="bg-emerald-500/10 text-emerald-600"
                href="/workouts"
              />
              <StatCard
                title="Avg. Sleep"
                value={`${avgSleep} hrs`}
                subtext="Last 30 days"
                icon={Moon}
                colorClass="bg-indigo-500/10 text-indigo-600"
                href="/recovery-sleep"
              />
              <StatCard
                title="Monthly Expenses"
                value={`$${monthlyExpenses.toFixed(0)}`}
                subtext="This month"
                icon={Wallet}
                colorClass="bg-red-500/10 text-red-600"
                href="/budget"
              />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-6 gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">Weight Trend</h3>
                    <p className="text-sm text-muted-foreground">Last 14 entries</p>
                  </div>
                  <div className="h-8 w-8 rounded-full warrior-gradient flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 accent-text" />
                  </div>
                </div>
                
                <div className="h-[300px] w-full">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="date" 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          domain={['dataMin - 1', 'dataMax + 1']}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--card))", 
                            borderColor: "hsl(var(--border))",
                            borderRadius: "8px" 
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="weight" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorWeight)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      No weight data yet - start tracking!
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-6 shadow-sm border">
                <h3 className="font-semibold text-lg mb-4">Recent Workouts</h3>
                <div className="space-y-4">
                  {workoutsData && workoutsData.length > 0 ? (
                    workoutsData.slice(0, 5).map((workout) => (
                      <div key={workout.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="h-10 w-10 rounded-full warrior-gradient flex items-center justify-center shrink-0">
                          <Activity className="h-5 w-5 accent-text" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{workout.exerciseName}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(workout.date), "MMM d, h:mm a")}</p>
                        </div>
                        <div className="text-sm font-semibold accent-text">
                          {workout.caloriesBurned ? `${workout.caloriesBurned} cal` : `${workout.duration}m`}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">No workouts logged yet</p>
                  )}
                </div>
              </Card>
            </div>

            {/* Widgets Section */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* To-Do List Widget */}
              <Link href="/todos">
                <Card className="p-6 shadow-sm border hover:shadow-md transition-all cursor-pointer" data-testid="widget-todos">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <CheckSquare className="h-5 w-5 accent-text" />
                      To-Do List
                    </h3>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full" data-testid="text-todos-pending">
                      {todos.filter(t => !t.completed).length} pending
                    </span>
                  </div>
                  <div className="space-y-2">
                    {todos.filter(t => !t.completed).slice(0, 4).map((todo) => (
                      <div key={todo.id} className="flex items-center gap-2 text-sm">
                        <Checkbox checked={false} disabled className="h-4 w-4" />
                        <span className="truncate">{todo.title}</span>
                        {todo.priority === "high" && (
                          <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">!</span>
                        )}
                      </div>
                    ))}
                    {todos.filter(t => !t.completed).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">All caught up!</p>
                    )}
                    {todos.filter(t => !t.completed).length > 4 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{todos.filter(t => !t.completed).length - 4} more tasks
                      </p>
                    )}
                  </div>
                </Card>
              </Link>

              {/* Calendar Widget */}
              <Link href="/calendar">
                <Card className="p-6 shadow-sm border hover:shadow-md transition-all cursor-pointer" data-testid="widget-calendar">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <CalendarDays className="h-5 w-5 accent-text" />
                      Upcoming Events
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {calendarEvents
                      .filter(e => new Date(e.startDate) >= new Date())
                      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                      .slice(0, 4)
                      .map((event) => {
                        const eventDate = new Date(event.startDate);
                        let dateLabel = format(eventDate, "MMM d");
                        if (isToday(eventDate)) dateLabel = "Today";
                        else if (isTomorrow(eventDate)) dateLabel = "Tomorrow";
                        return (
                          <div key={event.id} className="flex items-center gap-3 text-sm">
                            <div 
                              className="w-2 h-2 rounded-full shrink-0" 
                              style={{ backgroundColor: event.color || 'hsl(var(--primary))' }}
                            />
                            <span className="truncate flex-1">{event.title}</span>
                            <span className="text-xs text-muted-foreground">{dateLabel}</span>
                          </div>
                        );
                      })}
                    {calendarEvents.filter(e => new Date(e.startDate) >= new Date()).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No upcoming events</p>
                    )}
                  </div>
                </Card>
              </Link>

              {/* Account Balances Widget */}
              <Link href="/budget">
                <Card className="p-6 shadow-sm border hover:shadow-md transition-all cursor-pointer" data-testid="widget-accounts">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <CreditCard className="h-5 w-5 accent-text" />
                      Account Balances
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {accounts.slice(0, 4).map((account) => (
                      <div key={account.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: account.color || 'hsl(var(--primary))' }}
                          />
                          <span className="text-sm">{account.name}</span>
                        </div>
                        <span className={`text-sm font-semibold ${parseFloat(account.balance) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          ${parseFloat(account.balance).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    {accounts.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No accounts yet</p>
                    )}
                    {accounts.length > 0 && (
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between font-medium">
                          <span>Total</span>
                          <span className="accent-text" data-testid="text-total-balance">
                            ${accounts.reduce((sum, a) => sum + parseFloat(a.balance), 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
