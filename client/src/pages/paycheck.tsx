import { useState, useMemo, useEffect } from "react";
import { Sidebar, MobileNav } from "@/components/Navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, DollarSign, Briefcase, Calculator, Clock, History, Save, Check } from "lucide-react";
import type { Job, PaycheckHistory, PaycheckDailyHours } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { format, startOfWeek } from "date-fns";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const JOB_COLORS = [
  "#D4AF37",
  "#4CAF50",
  "#2196F3",
  "#9C27B0",
  "#FF5722",
  "#00BCD4",
  "#E91E63",
];

export default function Paycheck() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [jobName, setJobName] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  
  const [hours, setHours] = useState<Record<number, Record<string, number>>>({});
  const [savingDay, setSavingDay] = useState<string | null>(null);

  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const { data: history = [] } = useQuery<PaycheckHistory[]>({
    queryKey: ["/api/paycheck-history"],
  });

  const { data: savedHours = [] } = useQuery<PaycheckDailyHours[]>({
    queryKey: ["/api/paycheck-daily-hours", weekStart],
  });

  useEffect(() => {
    if (savedHours.length > 0) {
      const hoursMap: Record<number, Record<string, number>> = {};
      savedHours.forEach((entry) => {
        if (!hoursMap[entry.jobId]) {
          hoursMap[entry.jobId] = {};
        }
        hoursMap[entry.jobId][entry.day] = parseFloat(entry.hours);
      });
      setHours(hoursMap);
    } else {
      setHours({});
    }
  }, [savedHours, weekStart]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/jobs", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      setIsOpen(false);
      resetForm();
      toast({ title: "Job added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add job", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/jobs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({ title: "Job deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete job", variant: "destructive" });
    },
  });

  const saveWeekMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/paycheck-history", data);
    },
    onSuccess: async () => {
      await apiRequest("DELETE", `/api/paycheck-daily-hours/${weekStart}`);
      queryClient.invalidateQueries({ queryKey: ["/api/paycheck-history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/paycheck-daily-hours", weekStart] });
      setHours({});
      toast({ title: "Week saved to history" });
    },
    onError: () => {
      toast({ title: "Failed to save week", variant: "destructive" });
    },
  });

  const saveDayMutation = useMutation({
    mutationFn: async ({ day, hoursData }: { day: string; hoursData: { jobId: number; hours: string }[] }) => {
      return apiRequest("POST", "/api/paycheck-daily-hours/save-day", {
        weekStart,
        day,
        hoursData,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/paycheck-daily-hours", weekStart] });
      setSavingDay(null);
      toast({ title: `${variables.day} hours saved` });
    },
    onError: () => {
      setSavingDay(null);
      toast({ title: "Failed to save hours", variant: "destructive" });
    },
  });

  const deleteHistoryMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/paycheck-history/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/paycheck-history"] });
      toast({ title: "Entry deleted" });
    },
  });

  const resetForm = () => {
    setJobName("");
    setHourlyRate("");
  };

  const handleSubmit = () => {
    if (!jobName.trim() || !hourlyRate) return;
    
    const colorIndex = jobs.length % JOB_COLORS.length;
    createMutation.mutate({
      name: jobName.trim(),
      hourlyRate: hourlyRate,
      color: JOB_COLORS[colorIndex],
    });
  };

  const updateHours = (jobId: number, day: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setHours(prev => ({
      ...prev,
      [jobId]: {
        ...prev[jobId],
        [day]: numValue,
      }
    }));
  };

  const getJobHours = (jobId: number, day: string): number => {
    return hours[jobId]?.[day] || 0;
  };

  const getJobTotalHours = (jobId: number): number => {
    return DAYS.reduce((sum, day) => sum + getJobHours(jobId, day), 0);
  };

  const getJobGrossPay = (job: Job): number => {
    const totalHours = getJobTotalHours(job.id);
    return totalHours * parseFloat(job.hourlyRate);
  };

  const calculations = useMemo(() => {
    const jobBreakdowns = jobs.map(job => ({
      job,
      totalHours: getJobTotalHours(job.id),
      grossPay: getJobGrossPay(job),
    }));

    const totalHours = jobBreakdowns.reduce((sum, b) => sum + b.totalHours, 0);
    const totalGrossPay = jobBreakdowns.reduce((sum, b) => sum + b.grossPay, 0);

    return { jobBreakdowns, totalHours, totalGrossPay };
  }, [jobs, hours]);

  const handleSaveDay = (day: string) => {
    const hoursData = jobs.map(job => ({
      jobId: job.id,
      hours: (getJobHours(job.id, day) || 0).toString(),
    }));
    
    setSavingDay(day);
    saveDayMutation.mutate({ day, hoursData });
  };

  const handleSaveWeek = () => {
    if (calculations.totalHours === 0) {
      toast({ title: "No hours to save", variant: "destructive" });
      return;
    }

    const weekStartDate = startOfWeek(new Date(), { weekStartsOn: 1 });
    const jobBreakdown = calculations.jobBreakdowns.map(b => ({
      jobName: b.job.name,
      hours: b.totalHours,
      gross: b.grossPay,
      rate: b.job.hourlyRate,
    }));

    saveWeekMutation.mutate({
      weekStart: format(weekStartDate, "yyyy-MM-dd"),
      totalHours: calculations.totalHours.toFixed(2),
      totalGross: calculations.totalGrossPay.toFixed(2),
      jobBreakdown: JSON.stringify(jobBreakdown),
    });
  };

  const isDaySaved = (day: string) => {
    if (jobs.length === 0) return false;
    const activeJobs = jobs.filter(j => j.isActive !== false);
    if (activeJobs.length === 0) return false;
    return activeJobs.every(job => 
      savedHours.some(h => h.day === day && h.jobId === job.id)
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 overflow-auto pb-20 md:pb-6">
        <MobileNav />
        
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Calculator className="w-8 h-8 accent-text" />
              <div>
                <h1 className="text-2xl font-bold accent-text">Paycheck Predictor</h1>
                <p className="text-muted-foreground">Calculate your expected gross income</p>
              </div>
            </div>
          </div>

          <Card className="warrior-gradient accent-border border">
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-10 h-10 accent-text" />
                  <div>
                    <p className="text-sm text-muted-foreground">Predicted Weekly Gross Pay</p>
                    <p className="text-3xl font-bold accent-text" data-testid="text-total-gross-pay">
                      ${calculations.totalGrossPay.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-8 h-8 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Hours</p>
                      <p className="text-2xl font-bold" data-testid="text-total-hours">
                        {calculations.totalHours.toFixed(1)}
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleSaveWeek}
                    disabled={calculations.totalHours === 0 || saveWeekMutation.isPending}
                    className="bg-white/20 hover:bg-white/30 accent-text"
                    data-testid="button-save-week"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saveWeekMutation.isPending ? "Saving..." : "Save Week"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="current" className="space-y-4">
            <TabsList>
              <TabsTrigger value="current">Current Week</TabsTrigger>
              <TabsTrigger value="history">
                <History className="w-4 h-4 mr-1" />
                History ({history.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="space-y-6">

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Your Jobs
              </CardTitle>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" data-testid="button-add-job">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Job
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Job</DialogTitle>
                    <DialogDescription>Enter your job details to track hours and predict pay.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Job Name</Label>
                      <Input
                        placeholder="e.g., Main Job, Side Gig"
                        value={jobName}
                        onChange={(e) => setJobName(e.target.value)}
                        data-testid="input-job-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Hourly Rate ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="e.g., 21.50"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        data-testid="input-hourly-rate"
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleSubmit}
                      disabled={!jobName.trim() || !hourlyRate || createMutation.isPending}
                      data-testid="button-submit-job"
                    >
                      {createMutation.isPending ? "Adding..." : "Add Job"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-muted-foreground text-center py-8">Loading jobs...</p>
              ) : jobs.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No jobs added yet.</p>
                  <p className="text-sm text-muted-foreground">Add a job to start predicting your paycheck.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.filter(j => j.isActive !== false).map((job) => (
                    <Card key={job.id} className="bg-muted/30">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: job.color || "#D4AF37" }}
                            />
                            <div>
                              <h3 className="font-semibold" data-testid={`text-job-name-${job.id}`}>{job.name}</h3>
                              <p className="text-sm text-muted-foreground" data-testid={`text-job-rate-${job.id}`}>
                                ${parseFloat(job.hourlyRate).toFixed(2)}/hr
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="text-base" data-testid={`badge-job-gross-${job.id}`}>
                              ${getJobGrossPay(job).toFixed(2)}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteMutation.mutate(job.id)}
                              data-testid={`button-delete-job-${job.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-7 gap-2">
                          {DAYS.map((day) => (
                            <div key={day} className="text-center">
                              <Label className="text-xs block mb-1">{day.slice(0, 3)}</Label>
                              <Input
                                type="number"
                                step="0.5"
                                min="0"
                                max="24"
                                className="text-center p-1 h-9"
                                placeholder="0"
                                value={getJobHours(job.id, day) || ""}
                                onChange={(e) => updateHours(job.id, day, e.target.value)}
                                data-testid={`input-hours-${job.id}-${day.toLowerCase()}`}
                              />
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex justify-end mt-3 text-sm text-muted-foreground">
                          <span data-testid={`text-job-hours-${job.id}`}>
                            {getJobTotalHours(job.id).toFixed(1)} hours this week
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Save Day Buttons Row */}
                  <Card className="bg-muted/30">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Save className="w-4 h-4" />
                          Save Daily Hours
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Save each day as you go - hours persist even after refresh
                        </p>
                      </div>
                      <div className="grid grid-cols-7 gap-2">
                        {DAYS.map((day) => (
                          <Button
                            key={day}
                            variant={isDaySaved(day) ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => handleSaveDay(day)}
                            disabled={savingDay === day || saveDayMutation.isPending}
                            className="flex flex-col h-auto py-2"
                            data-testid={`button-save-${day.toLowerCase()}`}
                          >
                            {isDaySaved(day) ? (
                              <Check className="w-4 h-4 mb-1 text-green-500" />
                            ) : (
                              <Save className="w-4 h-4 mb-1" />
                            )}
                            <span className="text-xs">{day.slice(0, 3)}</span>
                            {savingDay === day && <span className="text-xs">...</span>}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>

          {calculations.jobBreakdowns.length > 0 && calculations.totalHours > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Pay Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {calculations.jobBreakdowns.filter(b => b.totalHours > 0).map(({ job, totalHours, grossPay }) => (
                    <div key={job.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: job.color || "#D4AF37" }}
                        />
                        <span className="font-medium">{job.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${grossPay.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">
                          {totalHours.toFixed(1)} hrs × ${parseFloat(job.hourlyRate).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-3 border-t-2">
                    <span className="font-bold">Total Gross Pay</span>
                    <span className="text-xl font-bold accent-text">${calculations.totalGrossPay.toFixed(2)}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  This is your estimated gross pay before taxes and deductions. Actual net pay will be lower.
                </p>
              </CardContent>
            </Card>
          )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Paycheck History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {history.length > 0 ? (
                    <div className="space-y-4">
                      {history.map((entry) => {
                        const breakdown = JSON.parse(entry.jobBreakdown);
                        return (
                          <div key={entry.id} className="p-4 bg-muted/50 rounded-lg" data-testid={`history-entry-${entry.id}`}>
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="font-bold text-lg">Week of {format(new Date(entry.weekStart), "MMM d, yyyy")}</p>
                                <p className="text-sm text-muted-foreground">
                                  {parseFloat(entry.totalHours).toFixed(1)} hours worked
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <p className="text-2xl font-bold accent-text">${parseFloat(entry.totalGross).toFixed(2)}</p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteHistoryMutation.mutate(entry.id)}
                                  data-testid={`button-delete-history-${entry.id}`}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              {breakdown.map((job: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                  <span>{job.jobName}</span>
                                  <span className="text-muted-foreground">
                                    {job.hours.toFixed(1)} hrs × ${parseFloat(job.rate).toFixed(2)} = ${job.gross.toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">
                      No paycheck history yet. Save your first week to start tracking!
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
