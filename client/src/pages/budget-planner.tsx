import { useAuth } from "@/hooks/use-auth";
import { Sidebar, MobileNav } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, ChevronLeft, ChevronRight, Link2, DollarSign, TrendingUp, TrendingDown, ClipboardList } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Redirect } from "wouter";
import { useState, useMemo } from "react";
import { format, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths, startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth, isWithinInterval, isSameDay, parseISO } from "date-fns";
import type { BudgetPlanEntry, Job } from "@shared/schema";

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

type ViewMode = 'day' | 'week' | 'month';

export default function BudgetPlanner() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [linkPaycheckDialogOpen, setLinkPaycheckDialogOpen] = useState(false);
  
  const [newEntry, setNewEntry] = useState({
    type: 'income' as 'income' | 'expense',
    description: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  const { data: entries = [], isLoading: entriesLoading } = useQuery<BudgetPlanEntry[]>({
    queryKey: ['/api/budget-plan'],
    enabled: !!user
  });

  const { data: jobs = [] } = useQuery<Job[]>({
    queryKey: ['/api/jobs'],
    enabled: !!user
  });

  const createEntryMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/budget-plan", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budget-plan'] });
      setDialogOpen(false);
      setNewEntry({ type: 'income', description: '', amount: '', date: format(new Date(), 'yyyy-MM-dd') });
      toast({ title: "Entry added", description: "Budget plan entry added successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add entry", variant: "destructive" });
    }
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/budget-plan/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budget-plan'] });
      toast({ title: "Entry deleted" });
    }
  });

  const getDateRange = useMemo(() => {
    switch (viewMode) {
      case 'day':
        return {
          start: startOfDay(selectedDate),
          end: endOfDay(selectedDate),
          label: format(selectedDate, 'EEEE, MMMM d, yyyy')
        };
      case 'week':
        return {
          start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
          end: endOfWeek(selectedDate, { weekStartsOn: 1 }),
          label: `${format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMM d')} - ${format(endOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}`
        };
      case 'month':
        return {
          start: startOfMonth(selectedDate),
          end: endOfMonth(selectedDate),
          label: format(selectedDate, 'MMMM yyyy')
        };
    }
  }, [viewMode, selectedDate]);

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const entryDate = typeof entry.date === 'string' ? parseISO(entry.date) : new Date(entry.date);
      return isWithinInterval(entryDate, { start: getDateRange.start, end: getDateRange.end });
    });
  }, [entries, getDateRange]);

  const incomeEntries = filteredEntries.filter(e => e.type === 'income');
  const expenseEntries = filteredEntries.filter(e => e.type === 'expense');
  
  const totalIncome = incomeEntries.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const totalExpenses = expenseEntries.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const netBalance = totalIncome - totalExpenses;

  const navigateDate = (direction: 'prev' | 'next') => {
    const modifier = direction === 'prev' ? -1 : 1;
    switch (viewMode) {
      case 'day':
        setSelectedDate(prev => addDays(prev, modifier));
        break;
      case 'week':
        setSelectedDate(prev => addWeeks(prev, modifier));
        break;
      case 'month':
        setSelectedDate(prev => addMonths(prev, modifier));
        break;
    }
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const handleAddEntry = () => {
    if (!newEntry.description || !newEntry.amount || !newEntry.date) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    createEntryMutation.mutate({
      type: newEntry.type,
      description: newEntry.description,
      amount: newEntry.amount,
      date: newEntry.date,
      isFromPaycheck: false
    });
  };

  const handleLinkPaycheck = (job: Job) => {
    const weeklyPay = parseFloat(job.hourlyRate) * 40;
    createEntryMutation.mutate({
      type: 'income',
      description: `${job.name} (Weekly Paycheck)`,
      amount: weeklyPay.toFixed(2),
      date: newEntry.date || format(new Date(), 'yyyy-MM-dd'),
      isFromPaycheck: true
    });
    setLinkPaycheckDialogOpen(false);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 p-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <MobileNav />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="mb-8">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl warrior-gradient flex items-center justify-center border-2 accent-border">
                <ClipboardList className="h-8 w-8 accent-text" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Budget Planner</h1>
                <p className="text-muted-foreground">Plan your income and expenses</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigateDate('prev')} data-testid="button-prev-date">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium min-w-[200px] text-center" data-testid="text-date-range">
                {getDateRange.label}
              </span>
              <Button variant="outline" size="icon" onClick={() => navigateDate('next')} data-testid="button-next-date">
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={goToToday} data-testid="button-today">
                Today
              </Button>
            </div>

            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="w-auto">
              <TabsList>
                <TabsTrigger value="day" data-testid="tab-day">Day</TabsTrigger>
                <TabsTrigger value="week" data-testid="tab-week">Week</TabsTrigger>
                <TabsTrigger value="month" data-testid="tab-month">Month</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex gap-2">
              <Dialog open={linkPaycheckDialogOpen} onOpenChange={setLinkPaycheckDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2" data-testid="button-link-paycheck">
                    <Link2 className="h-4 w-4" />
                    Link Paycheck
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Link Paycheck</DialogTitle>
                    <DialogDescription>Add estimated weekly income from your jobs</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={newEntry.date}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, date: e.target.value }))}
                        data-testid="input-paycheck-date"
                      />
                    </div>
                    {jobs.filter(j => j.isActive).length === 0 ? (
                      <p className="text-muted-foreground text-sm">No jobs found. Add jobs in Paycheck Predictor first.</p>
                    ) : (
                      <div className="space-y-2">
                        {jobs.filter(j => j.isActive).map(job => (
                          <Button
                            key={job.id}
                            variant="outline"
                            className="w-full justify-between"
                            onClick={() => handleLinkPaycheck(job)}
                            data-testid={`button-link-job-${job.id}`}
                          >
                            <span>{job.name}</span>
                            <span className="accent-text">${(parseFloat(job.hourlyRate) * 40).toFixed(2)}/week</span>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 warrior-gradient accent-text" data-testid="button-add-entry">
                    <Plus className="h-4 w-4" />
                    Add Entry
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Budget Entry</DialogTitle>
                    <DialogDescription>Add a planned income or expense</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Type</Label>
                      <Select value={newEntry.type} onValueChange={(v) => setNewEntry(prev => ({ ...prev, type: v as 'income' | 'expense' }))}>
                        <SelectTrigger data-testid="select-entry-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">Income</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={newEntry.description}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="e.g., Rent, Groceries, Paycheck"
                        data-testid="input-entry-description"
                      />
                    </div>
                    <div>
                      <Label>Amount ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newEntry.amount}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="0.00"
                        data-testid="input-entry-amount"
                      />
                    </div>
                    <div>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={newEntry.date}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, date: e.target.value }))}
                        data-testid="input-entry-date"
                      />
                    </div>
                    <Button 
                      onClick={handleAddEntry} 
                      className="w-full warrior-gradient accent-text"
                      disabled={createEntryMutation.isPending}
                      data-testid="button-submit-entry"
                    >
                      Add Entry
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Income</p>
                    <p className="text-2xl font-bold text-green-500" data-testid="text-total-income">${totalIncome.toFixed(2)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-green-500/10">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-500" data-testid="text-total-expenses">${totalExpenses.toFixed(2)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-red-500/10">
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Net Balance</p>
                    <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-500' : 'text-red-500'}`} data-testid="text-net-balance">
                      {netBalance >= 0 ? '+' : ''}{netBalance.toFixed(2)}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${netBalance >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                    <DollarSign className={`h-5 w-5 ${netBalance >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-500">
                  <TrendingUp className="h-5 w-5" />
                  Predicted Income
                </CardTitle>
              </CardHeader>
              <CardContent>
                {entriesLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : incomeEntries.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No income entries for this period</p>
                ) : (
                  <div className="space-y-2">
                    {incomeEntries.map(entry => {
                      const entryDate = typeof entry.date === 'string' ? parseISO(entry.date) : new Date(entry.date);
                      return (
                        <div 
                          key={entry.id} 
                          className="flex items-center justify-between p-3 rounded-lg bg-green-500/5 border border-green-500/20"
                          data-testid={`entry-income-${entry.id}`}
                        >
                          <div className="flex-1">
                            <p className="font-medium">{entry.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(entryDate, 'MMM d, yyyy')}
                              {entry.isFromPaycheck && <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Paycheck</span>}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-green-500">+${parseFloat(entry.amount).toFixed(2)}</span>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => deleteEntryMutation.mutate(entry.id)}
                              data-testid={`button-delete-income-${entry.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between font-bold">
                    <span>Total Income</span>
                    <span className="text-green-500">${totalIncome.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-500">
                  <TrendingDown className="h-5 w-5" />
                  Predicted Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                {entriesLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : expenseEntries.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No expense entries for this period</p>
                ) : (
                  <div className="space-y-2">
                    {expenseEntries.map(entry => {
                      const entryDate = typeof entry.date === 'string' ? parseISO(entry.date) : new Date(entry.date);
                      return (
                        <div 
                          key={entry.id} 
                          className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/20"
                          data-testid={`entry-expense-${entry.id}`}
                        >
                          <div className="flex-1">
                            <p className="font-medium">{entry.description}</p>
                            <p className="text-sm text-muted-foreground">{format(entryDate, 'MMM d, yyyy')}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-red-500">-${parseFloat(entry.amount).toFixed(2)}</span>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => deleteEntryMutation.mutate(entry.id)}
                              data-testid={`button-delete-expense-${entry.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between font-bold">
                    <span>Total Expenses</span>
                    <span className="text-red-500">${totalExpenses.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
