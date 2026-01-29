import { useState, useMemo } from "react";
import { Sidebar, MobileNav } from "@/components/Navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, BookOpen, Smile, Meh, Frown, Heart, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfWeek, endOfWeek, isWithinInterval, addWeeks, subWeeks, isSameWeek } from "date-fns";
import type { JournalEntry } from "@shared/schema";

const moodIcons = {
  great: { icon: Heart, color: "text-green-500", bg: "bg-green-100" },
  good: { icon: Smile, color: "text-blue-500", bg: "bg-blue-100" },
  okay: { icon: Meh, color: "text-yellow-500", bg: "bg-yellow-100" },
  bad: { icon: Frown, color: "text-orange-500", bg: "bg-orange-100" },
  terrible: { icon: Zap, color: "text-red-500", bg: "bg-red-100" },
};

export default function Journal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("good");
  const [tags, setTags] = useState("");
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  const isCurrentWeek = isSameWeek(selectedWeek, new Date(), { weekStartsOn: 0 });

  const { data: entries = [], isLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal"],
    queryFn: async () => {
      const res = await fetch("/api/journal", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch journal entries");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create journal entry");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
      setIsOpen(false);
      resetForm();
      toast({ title: "Entry saved", description: "Your thoughts have been recorded." });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/journal/${id}`, { method: "DELETE", credentials: "include" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
      toast({ title: "Entry deleted" });
    },
  });

  const resetForm = () => {
    setTitle("");
    setContent("");
    setMood("good");
    setTags("");
  };

  const handleSubmit = () => {
    if (!content.trim()) return;
    createMutation.mutate({
      title: title || null,
      content,
      mood,
      tags: tags || null,
      date: new Date().toISOString(),
    });
  };

  const weekEntries = useMemo(() => {
    const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 0 });
    return entries.filter(entry => {
      const date = new Date(entry.date);
      return isWithinInterval(date, { start: weekStart, end: weekEnd });
    });
  }, [entries, selectedWeek]);

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <MobileNav />
        <main className="flex-1 p-6 md:p-8 max-w-4xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight">Journal</h1>
              <p className="text-muted-foreground">Reflect on your warrior journey</p>
            </div>
            
            <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="warrior-gradient accent-text shadow-lg" data-testid="button-new-entry">
                  <Plus className="h-4 w-4 mr-2" /> New Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>New Journal Entry</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label>Title (optional)</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Give your entry a title..." data-testid="input-journal-title" />
                  </div>
                  <div>
                    <Label>How are you feeling?</Label>
                    <Select value={mood} onValueChange={setMood}>
                      <SelectTrigger data-testid="select-mood">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="great">Great</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="okay">Okay</SelectItem>
                        <SelectItem value="bad">Bad</SelectItem>
                        <SelectItem value="terrible">Terrible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Your thoughts</Label>
                    <Textarea 
                      value={content} 
                      onChange={(e) => setContent(e.target.value)} 
                      placeholder="Write whatever is on your mind..."
                      className="min-h-[150px]"
                      data-testid="input-journal-content"
                    />
                  </div>
                  <div>
                    <Label>Tags (comma-separated, optional)</Label>
                    <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="fitness, goals, motivation..." data-testid="input-journal-tags" />
                  </div>
                  <Button onClick={handleSubmit} disabled={createMutation.isPending || !content.trim()} className="w-full warrior-gradient accent-text" data-testid="button-save-entry">
                    {createMutation.isPending ? "Saving..." : "Save Entry"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex items-center justify-center gap-2 mb-6">
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

          <div className="space-y-4">
            {isLoading ? (
              <p>Loading...</p>
            ) : weekEntries.length > 0 ? (
              weekEntries.map((entry) => {
                const moodData = moodIcons[entry.mood as keyof typeof moodIcons] || moodIcons.good;
                const MoodIcon = moodData.icon;
                return (
                  <Card key={entry.id} className="hover:shadow-md transition-all" data-testid={`journal-entry-${entry.id}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full ${moodData.bg} flex items-center justify-center`}>
                            <MoodIcon className={`h-5 w-5 ${moodData.color}`} />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{entry.title || "Untitled Entry"}</CardTitle>
                            <p className="text-xs text-muted-foreground">{format(new Date(entry.date), "PPP 'at' p")}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(entry.id)} data-testid={`button-delete-journal-${entry.id}`}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">{entry.content}</p>
                      {entry.tags && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {entry.tags.split(",").map((tag, idx) => (
                            <span key={idx} className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No journal entries this week</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
