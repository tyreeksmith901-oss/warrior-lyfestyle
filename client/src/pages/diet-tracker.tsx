import { useState, useMemo } from "react";
import { Sidebar, MobileNav } from "@/components/Navigation";
import { useDietEntries, useCreateDietEntry, useDeleteEntry } from "@/hooks/use-fitness-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Plus, Utensils, Search, Flame, Target, Apple, ChevronLeft, ChevronRight } from "lucide-react";
import { searchFoods, type FoodItem } from "@/lib/foodDatabase";
import { format, addDays, subDays, isToday, startOfDay } from "date-fns";

export default function DietTracker() {
  const { data: entries = [], isLoading } = useDietEntries();
  const createEntry = useCreateDietEntry();
  const deleteEntry = useDeleteEntry("diet");
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servings, setServings] = useState("1");
  const [mealType, setMealType] = useState("breakfast");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [customFood, setCustomFood] = useState({
    foodName: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
  });

  const searchResults = useMemo(() => searchFoods(searchQuery), [searchQuery]);

  const resetForm = () => {
    setSearchQuery("");
    setSelectedFood(null);
    setServings("1");
    setMealType("breakfast");
    setCustomFood({ foodName: "", calories: "", protein: "", carbs: "", fats: "" });
  };

  const handleAddFood = () => {
    if (selectedFood) {
      const multiplier = parseFloat(servings) || 1;
      createEntry.mutate({
        mealType,
        foodName: selectedFood.name,
        servingSize: String(selectedFood.servingSize * multiplier),
        servingUnit: selectedFood.servingUnit,
        calories: Math.round(selectedFood.calories * multiplier),
        protein: Math.round(selectedFood.protein * multiplier),
        carbs: Math.round(selectedFood.carbs * multiplier),
        fats: Math.round(selectedFood.fats * multiplier),
        fiber: selectedFood.fiber ? Math.round(selectedFood.fiber * multiplier) : null,
        sugar: selectedFood.sugar ? Math.round(selectedFood.sugar * multiplier) : null,
        date: selectedDate,
      }, {
        onSuccess: () => {
          setIsOpen(false);
          resetForm();
        }
      });
    } else if (customFood.foodName && customFood.calories) {
      createEntry.mutate({
        mealType,
        foodName: customFood.foodName,
        calories: parseInt(customFood.calories),
        protein: parseInt(customFood.protein) || null,
        carbs: parseInt(customFood.carbs) || null,
        fats: parseInt(customFood.fats) || null,
        date: selectedDate,
      }, {
        onSuccess: () => {
          setIsOpen(false);
          resetForm();
        }
      });
    }
  };

  const dayEntries = useMemo(() => {
    const targetDate = startOfDay(selectedDate).toDateString();
    return entries.filter(entry => new Date(entry.date).toDateString() === targetDate);
  }, [entries, selectedDate]);

  const dayTotals = useMemo(() => {
    return dayEntries.reduce(
      (acc, entry) => ({
        calories: acc.calories + (entry.calories || 0),
        protein: acc.protein + (entry.protein || 0),
        carbs: acc.carbs + (entry.carbs || 0),
        fats: acc.fats + (entry.fats || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  }, [dayEntries]);

  const groupedByMeal = useMemo(() => {
    const groups: Record<string, typeof dayEntries> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };
    dayEntries.forEach(entry => {
      if (groups[entry.mealType]) {
        groups[entry.mealType].push(entry);
      }
    });
    return groups;
  }, [dayEntries]);

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <MobileNav />
        <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight">Diet & Nutrition</h1>
              <p className="text-muted-foreground">Track your meals with AI-powered calorie counting</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setSelectedDate(subDays(selectedDate, 1))} data-testid="button-prev-day">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-center min-w-[140px]">
                <span className="font-medium">{format(selectedDate, "EEEE, MMM d")}</span>
                {isToday(selectedDate) && <span className="text-xs text-muted-foreground ml-2">(Today)</span>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 1))} data-testid="button-next-day">
                <ChevronRight className="h-4 w-4" />
              </Button>
              {!isToday(selectedDate) && (
                <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())} data-testid="button-today">
                  Today
                </Button>
              )}
            </div>
            
            <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="warrior-gradient accent-text shadow-lg" data-testid="button-log-food">
                  <Plus className="h-4 w-4 mr-2" /> Log Food
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Log Food</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label>Meal Type</Label>
                    <Select value={mealType} onValueChange={setMealType}>
                      <SelectTrigger data-testid="select-meal-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breakfast">Breakfast</SelectItem>
                        <SelectItem value="lunch">Lunch</SelectItem>
                        <SelectItem value="dinner">Dinner</SelectItem>
                        <SelectItem value="snack">Snack</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Search Food Database</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search foods..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setSelectedFood(null);
                        }}
                        className="pl-10"
                        data-testid="input-search-food"
                      />
                    </div>
                    {searchResults.length > 0 && !selectedFood && (
                      <div className="mt-2 max-h-40 overflow-y-auto border rounded-md">
                        {searchResults.map((food, idx) => (
                          <button
                            key={idx}
                            className="w-full p-2 text-left hover:bg-muted border-b last:border-b-0 flex justify-between items-center"
                            onClick={() => {
                              setSelectedFood(food);
                              setSearchQuery(food.name);
                            }}
                            data-testid={`food-result-${idx}`}
                          >
                            <span className="font-medium text-sm">{food.name}</span>
                            <span className="text-xs text-muted-foreground">{food.calories} cal</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedFood && (
                    <div className="p-3 bg-muted rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{selectedFood.name}</span>
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedFood(null); setSearchQuery(""); }}>
                          Clear
                        </Button>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-sm text-center">
                        <div>
                          <div className="font-bold accent-text">{Math.round(selectedFood.calories * (parseFloat(servings) || 1))}</div>
                          <div className="text-xs text-muted-foreground">cal</div>
                        </div>
                        <div>
                          <div className="font-bold">{Math.round(selectedFood.protein * (parseFloat(servings) || 1))}g</div>
                          <div className="text-xs text-muted-foreground">protein</div>
                        </div>
                        <div>
                          <div className="font-bold">{Math.round(selectedFood.carbs * (parseFloat(servings) || 1))}g</div>
                          <div className="text-xs text-muted-foreground">carbs</div>
                        </div>
                        <div>
                          <div className="font-bold">{Math.round(selectedFood.fats * (parseFloat(servings) || 1))}g</div>
                          <div className="text-xs text-muted-foreground">fats</div>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Servings ({selectedFood.servingSize}{selectedFood.servingUnit} each)</Label>
                        <Input type="number" min="0.25" step="0.25" value={servings} onChange={(e) => setServings(e.target.value)} data-testid="input-servings" />
                      </div>
                    </div>
                  )}

                  {!selectedFood && (
                    <div className="border-t pt-4">
                      <p className="text-sm text-muted-foreground mb-3">Or enter custom food:</p>
                      <div className="space-y-3">
                        <div>
                          <Label>Food Name</Label>
                          <Input value={customFood.foodName} onChange={(e) => setCustomFood({ ...customFood, foodName: e.target.value })} placeholder="e.g., Homemade smoothie" data-testid="input-custom-food" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Calories</Label>
                            <Input type="number" value={customFood.calories} onChange={(e) => setCustomFood({ ...customFood, calories: e.target.value })} data-testid="input-custom-calories" />
                          </div>
                          <div>
                            <Label>Protein (g)</Label>
                            <Input type="number" value={customFood.protein} onChange={(e) => setCustomFood({ ...customFood, protein: e.target.value })} />
                          </div>
                          <div>
                            <Label>Carbs (g)</Label>
                            <Input type="number" value={customFood.carbs} onChange={(e) => setCustomFood({ ...customFood, carbs: e.target.value })} />
                          </div>
                          <div>
                            <Label>Fats (g)</Label>
                            <Input type="number" value={customFood.fats} onChange={(e) => setCustomFood({ ...customFood, fats: e.target.value })} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button onClick={handleAddFood} disabled={createEntry.isPending || (!selectedFood && !customFood.foodName)} className="w-full warrior-gradient accent-text" data-testid="button-submit-food">
                    {createEntry.isPending ? "Adding..." : "Add to Log"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="warrior-gradient border-2 accent-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Flame className="h-6 w-6 accent-text" />
                  <div>
                    <p className="text-xs text-white/70">Calories</p>
                    <p className="text-xl font-bold accent-text" data-testid="text-total-calories">{dayTotals.calories}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Target className="h-6 w-6 text-red-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Protein</p>
                    <p className="text-xl font-bold" data-testid="text-total-protein">{dayTotals.protein}g</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Apple className="h-6 w-6 text-orange-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Carbs</p>
                    <p className="text-xl font-bold" data-testid="text-total-carbs">{dayTotals.carbs}g</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Utensils className="h-6 w-6 text-yellow-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Fats</p>
                    <p className="text-xl font-bold" data-testid="text-total-fats">{dayTotals.fats}g</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {(["breakfast", "lunch", "dinner", "snack"] as const).map((meal) => (
              <Card key={meal}>
                <CardHeader className="pb-3">
                  <CardTitle className="capitalize flex items-center gap-2">
                    <Utensils className="h-5 w-5 accent-text" />
                    {meal}
                    <span className="text-sm font-normal text-muted-foreground ml-auto">
                      {groupedByMeal[meal].reduce((sum, e) => sum + (e.calories || 0), 0)} cal
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {groupedByMeal[meal].length === 0 ? (
                    <p className="text-muted-foreground text-sm">No foods logged</p>
                  ) : (
                    <div className="space-y-2">
                      {groupedByMeal[meal].map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg" data-testid={`diet-entry-${entry.id}`}>
                          <div className="flex-1">
                            <p className="font-medium">{entry.foodName}</p>
                            <p className="text-xs text-muted-foreground">
                              {entry.calories} cal | P: {entry.protein || 0}g | C: {entry.carbs || 0}g | F: {entry.fats || 0}g
                            </p>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => deleteEntry.mutate(entry.id)} data-testid={`button-delete-diet-${entry.id}`}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
