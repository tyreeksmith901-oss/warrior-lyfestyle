import { useState, useMemo } from "react";
import { Sidebar, MobileNav } from "@/components/Navigation";
import { useWorkouts, useCreateWorkout, useDeleteEntry } from "@/hooks/use-fitness-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Trash2, Plus, Dumbbell, Timer, Search, Flame, Weight, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { format, getDay, startOfWeek, endOfWeek, isWithinInterval, addWeeks, subWeeks, isSameWeek } from "date-fns";
import { searchWorkouts, getAllWorkoutCategories, type WorkoutItem } from "@/lib/workoutDatabase";

export default function Workouts() {
  const { data: workouts = [], isLoading } = useWorkouts();
  const createWorkout = useCreateWorkout();
  const deleteWorkout = useDeleteEntry("workouts");
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutItem | null>(null);
  const [duration, setDuration] = useState("30");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [liftWeight, setLiftWeight] = useState("");
  const [customWorkout, setCustomWorkout] = useState({
    exerciseName: "",
    category: "Strength",
    caloriesBurned: "",
    intensity: "medium" as "low" | "medium" | "high",
  });

  const searchResults = useMemo(() => searchWorkouts(searchQuery), [searchQuery]);
  const categories = getAllWorkoutCategories();

  const resetForm = () => {
    setSearchQuery("");
    setSelectedWorkout(null);
    setDuration("30");
    setSets("");
    setReps("");
    setLiftWeight("");
    setCustomWorkout({ exerciseName: "", category: "Strength", caloriesBurned: "", intensity: "medium" });
  };

  const calculateCalories = (caloriesPerMin: number, mins: number) => {
    return Math.round(caloriesPerMin * mins);
  };

  const isStrengthExercise = (category: string) => {
    const cat = category.toLowerCase();
    return cat.includes("strength") || cat.includes("powerlifting") || cat.includes("bodybuilding") || cat.includes("weight");
  };

  const handleAddWorkout = () => {
    if (selectedWorkout) {
      const mins = parseInt(duration) || 30;
      createWorkout.mutate({
        exerciseName: selectedWorkout.name,
        category: selectedWorkout.category,
        duration: mins,
        caloriesBurned: calculateCalories(selectedWorkout.caloriesPerMinute, mins),
        intensity: selectedWorkout.intensity,
        sets: sets ? parseInt(sets) : null,
        reps: reps ? parseInt(reps) : null,
        weight: liftWeight || null,
        date: new Date(),
      }, {
        onSuccess: () => {
          setIsOpen(false);
          resetForm();
        }
      });
    } else if (customWorkout.exerciseName) {
      createWorkout.mutate({
        exerciseName: customWorkout.exerciseName,
        category: customWorkout.category,
        duration: parseInt(duration) || 30,
        caloriesBurned: parseInt(customWorkout.caloriesBurned) || null,
        intensity: customWorkout.intensity,
        sets: sets ? parseInt(sets) : null,
        reps: reps ? parseInt(reps) : null,
        weight: liftWeight || null,
        date: new Date(),
      }, {
        onSuccess: () => {
          setIsOpen(false);
          resetForm();
        }
      });
    }
  };

  const [viewMode, setViewMode] = useState<"all" | "byDay">("byDay");
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const isCurrentWeek = isSameWeek(selectedWeek, new Date(), { weekStartsOn: 0 });

  const weekWorkouts = useMemo(() => {
    const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 0 });
    return workouts.filter(w => {
      const date = new Date(w.date);
      return isWithinInterval(date, { start: weekStart, end: weekEnd });
    });
  }, [workouts, selectedWeek]);

  const weekCalories = useMemo(() => {
    return weekWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
  }, [weekWorkouts]);

  const weekDuration = useMemo(() => {
    return weekWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
  }, [weekWorkouts]);

  const workoutsByDay = useMemo(() => {
    const grouped: Record<number, typeof workouts> = {};
    for (let i = 0; i < 7; i++) grouped[i] = [];
    weekWorkouts.forEach(w => {
      const dayIndex = getDay(new Date(w.date));
      grouped[dayIndex].push(w);
    });
    return grouped;
  }, [weekWorkouts]);

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <MobileNav />
        <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight">Workouts</h1>
              <p className="text-muted-foreground">Track your training with weights and calorie burn estimates</p>
            </div>
            
            <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="warrior-gradient accent-text shadow-lg" data-testid="button-log-workout">
                  <Plus className="h-4 w-4 mr-2" /> Log Workout
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Log Workout</DialogTitle>
                  <DialogDescription>Search for an exercise or enter a custom workout</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label>Search Exercise Database</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search exercises, martial arts..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setSelectedWorkout(null);
                        }}
                        className="pl-10"
                        data-testid="input-search-workout"
                      />
                    </div>
                    {searchResults.length > 0 && !selectedWorkout && (
                      <div className="mt-2 max-h-48 overflow-y-auto border rounded-md bg-card">
                        {searchResults.map((workout, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className="w-full p-2 text-left hover:bg-muted border-b last:border-b-0"
                            onClick={() => {
                              setSelectedWorkout(workout);
                              setSearchQuery(workout.name);
                            }}
                            data-testid={`workout-result-${idx}`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-sm">{workout.name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                workout.intensity === 'high' ? 'bg-red-500/20 text-red-400' :
                                workout.intensity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>
                                {workout.intensity}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground flex gap-2">
                              <span>{workout.category}</span>
                              <span>~{workout.caloriesPerMinute} cal/min</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedWorkout && (
                    <div className="p-3 bg-muted rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{selectedWorkout.name}</span>
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedWorkout(null); setSearchQuery(""); }}>
                          Clear
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm text-center">
                        <div>
                          <div className="font-bold accent-text">{calculateCalories(selectedWorkout.caloriesPerMinute, parseInt(duration) || 30)}</div>
                          <div className="text-xs text-muted-foreground">calories</div>
                        </div>
                        <div>
                          <div className="font-bold">{selectedWorkout.caloriesPerMinute}</div>
                          <div className="text-xs text-muted-foreground">cal/min</div>
                        </div>
                        <div>
                          <div className={`font-bold capitalize ${
                            selectedWorkout.intensity === 'high' ? 'text-red-400' :
                            selectedWorkout.intensity === 'medium' ? 'text-yellow-400' :
                            'text-green-400'
                          }`}>{selectedWorkout.intensity}</div>
                          <div className="text-xs text-muted-foreground">intensity</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Duration (minutes)</Label>
                          <Input 
                            type="number" 
                            min="1" 
                            value={duration} 
                            onChange={(e) => setDuration(e.target.value)} 
                            data-testid="input-duration" 
                          />
                        </div>
                        {isStrengthExercise(selectedWorkout.category) && (
                          <div>
                            <Label className="text-xs">Weight (lbs)</Label>
                            <Input 
                              type="number" 
                              min="0" 
                              value={liftWeight} 
                              onChange={(e) => setLiftWeight(e.target.value)} 
                              placeholder="245"
                              data-testid="input-lift-weight" 
                            />
                          </div>
                        )}
                      </div>
                      
                      {isStrengthExercise(selectedWorkout.category) && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Sets</Label>
                            <Input 
                              type="number" 
                              min="1" 
                              value={sets} 
                              onChange={(e) => setSets(e.target.value)} 
                              placeholder="4"
                              data-testid="input-sets" 
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Reps</Label>
                            <Input 
                              type="number" 
                              min="1" 
                              value={reps} 
                              onChange={(e) => setReps(e.target.value)} 
                              placeholder="8"
                              data-testid="input-reps" 
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {!selectedWorkout && (
                    <div className="border-t pt-4">
                      <p className="text-sm text-muted-foreground mb-3">Or enter custom workout:</p>
                      <div className="space-y-3">
                        <div>
                          <Label>Exercise Name</Label>
                          <Input 
                            value={customWorkout.exerciseName} 
                            onChange={(e) => setCustomWorkout({ ...customWorkout, exerciseName: e.target.value })} 
                            placeholder="e.g., Bench Press" 
                            data-testid="input-custom-workout" 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Category</Label>
                            <Select value={customWorkout.category} onValueChange={(v) => setCustomWorkout({ ...customWorkout, category: v })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((cat) => (
                                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Intensity</Label>
                            <Select value={customWorkout.intensity} onValueChange={(v: "low" | "medium" | "high") => setCustomWorkout({ ...customWorkout, intensity: v })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Duration (min)</Label>
                            <Input 
                              type="number" 
                              value={duration} 
                              onChange={(e) => setDuration(e.target.value)} 
                            />
                          </div>
                          <div>
                            <Label>Weight Lifted (lbs)</Label>
                            <Input 
                              type="number" 
                              value={liftWeight} 
                              onChange={(e) => setLiftWeight(e.target.value)} 
                              placeholder="225"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <Label>Sets</Label>
                            <Input 
                              type="number" 
                              value={sets} 
                              onChange={(e) => setSets(e.target.value)} 
                              placeholder="4"
                            />
                          </div>
                          <div>
                            <Label>Reps</Label>
                            <Input 
                              type="number" 
                              value={reps} 
                              onChange={(e) => setReps(e.target.value)} 
                              placeholder="8"
                            />
                          </div>
                          <div>
                            <Label>Calories</Label>
                            <Input 
                              type="number" 
                              value={customWorkout.caloriesBurned} 
                              onChange={(e) => setCustomWorkout({ ...customWorkout, caloriesBurned: e.target.value })} 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button onClick={handleAddWorkout} disabled={createWorkout.isPending || (!selectedWorkout && !customWorkout.exerciseName)} className="w-full warrior-gradient accent-text" data-testid="button-submit-workout">
                    {createWorkout.isPending ? "Adding..." : "Log Workout"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <Card className="warrior-gradient border-2 accent-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Flame className="h-8 w-8 accent-text" />
                  <div>
                    <p className="text-sm text-white/70">Week's Burn</p>
                    <p className="text-2xl font-bold accent-text" data-testid="text-week-calories">{weekCalories} cal</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Timer className="h-8 w-8 text-blue-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Week's Duration</p>
                    <p className="text-2xl font-bold" data-testid="text-week-duration">{weekDuration} min</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5 accent-text" />
                    Workout History
                  </CardTitle>
                  <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "all" | "byDay")}>
                    <TabsList>
                      <TabsTrigger value="byDay" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" /> By Week
                      </TabsTrigger>
                      <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                {viewMode === "byDay" && (
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedWeek(subWeeks(selectedWeek, 1))} data-testid="button-prev-week">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-center min-w-[200px]">
                      <span className="font-medium text-sm">
                        {format(startOfWeek(selectedWeek, { weekStartsOn: 0 }), "MMM d")} - {format(endOfWeek(selectedWeek, { weekStartsOn: 0 }), "MMM d, yyyy")}
                      </span>
                      {isCurrentWeek && <span className="text-xs text-muted-foreground ml-2">(This Week)</span>}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedWeek(addWeeks(selectedWeek, 1))} data-testid="button-next-week">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    {!isCurrentWeek && (
                      <Button variant="outline" size="sm" onClick={() => setSelectedWeek(new Date())} data-testid="button-this-week">
                        This Week
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading...</p>
              ) : viewMode === "byDay" ? (
                <div className="space-y-4">
                  {dayNames.map((dayName, dayIndex) => {
                    const dayWorkouts = workoutsByDay[dayIndex] || [];
                    const isTodayInWeek = isCurrentWeek && getDay(new Date()) === dayIndex;
                    return (
                      <div key={dayIndex} className={`rounded-lg border ${isTodayInWeek ? 'border-primary bg-primary/5' : 'border-border'}`}>
                        <div className={`px-4 py-2 flex items-center justify-between ${isTodayInWeek ? 'bg-primary/10' : 'bg-muted/50'}`}>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${isTodayInWeek ? 'accent-text' : ''}`}>{dayName}</span>
                            {isTodayInWeek && <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Today</span>}
                          </div>
                          <span className="text-sm text-muted-foreground">{dayWorkouts.length} workout{dayWorkouts.length !== 1 ? 's' : ''}</span>
                        </div>
                        {dayWorkouts.length > 0 ? (
                          <div className="p-2 space-y-2">
                            {dayWorkouts.map((workout) => (
                              <div key={workout.id} className="flex items-center justify-between p-3 bg-background rounded border-l-4 border-l-primary" data-testid={`workout-day-${workout.id}`}>
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full warrior-gradient flex items-center justify-center">
                                    <Dumbbell className="h-4 w-4 accent-text" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="font-medium text-sm">{workout.exerciseName}</p>
                                      {workout.weight && (
                                        <span className="text-xs font-bold accent-text flex items-center gap-1">
                                          <Weight className="h-3 w-3" />
                                          {workout.weight} lbs
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex gap-2 text-xs text-muted-foreground flex-wrap">
                                      <span>{workout.duration} min</span>
                                      {workout.sets && workout.reps && <span>{workout.sets}x{workout.reps}</span>}
                                      {workout.caloriesBurned && <span className="accent-text">{workout.caloriesBurned} cal</span>}
                                    </div>
                                  </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => deleteWorkout.mutate(workout.id)} data-testid={`button-delete-day-workout-${workout.id}`}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3 text-center text-sm text-muted-foreground">
                            No workouts logged
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : workouts.length > 0 ? (
                <div className="space-y-3">
                  {workouts.map((workout) => (
                    <div key={workout.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border-l-4 border-l-primary" data-testid={`workout-entry-${workout.id}`}>
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full warrior-gradient flex items-center justify-center">
                          <Dumbbell className="h-5 w-5 accent-text" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold">{workout.exerciseName}</p>
                            {workout.weight && (
                              <span className="text-sm font-bold accent-text flex items-center gap-1">
                                <Weight className="h-3 w-3" />
                                {workout.weight} lbs
                              </span>
                            )}
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                              workout.intensity === 'high' ? 'bg-red-500/20 text-red-400' :
                              workout.intensity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {workout.intensity}
                            </span>
                          </div>
                          <div className="flex gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                            <span>{workout.category}</span>
                            <span>{workout.duration} min</span>
                            {workout.sets && workout.reps && (
                              <span>{workout.sets} sets x {workout.reps} reps</span>
                            )}
                            {workout.caloriesBurned && <span className="accent-text font-medium">{workout.caloriesBurned} cal</span>}
                          </div>
                          <p className="text-xs text-muted-foreground">{format(new Date(workout.date), "PPP p")}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteWorkout.mutate(workout.id)} data-testid={`button-delete-workout-${workout.id}`}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No workouts yet. Get moving!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
