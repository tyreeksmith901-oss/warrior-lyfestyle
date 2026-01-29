import { useState } from "react";
import { Sidebar, MobileNav } from "@/components/Navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Trophy, Medal, Target, Award, Edit2 } from "lucide-react";
import { format } from "date-fns";
import type { MartialArtsRecord, MartialArtsBelt } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const SPORTS = [
  "Boxing",
  "MMA",
  "Muay Thai",
  "BJJ",
  "Wrestling",
  "Judo",
  "Karate",
  "Taekwondo",
  "Kickboxing",
  "Kung Fu",
  "Krav Maga",
  "Capoeira",
  "Sambo",
  "Other"
];

const BELT_SPORTS = ["BJJ", "Karate", "Taekwondo", "Judo"];

const BJJ_BELTS = [
  { value: "white", label: "White Belt", color: "bg-white text-black border border-gray-300" },
  { value: "blue", label: "Blue Belt", color: "bg-blue-600 text-white" },
  { value: "purple", label: "Purple Belt", color: "bg-purple-600 text-white" },
  { value: "brown", label: "Brown Belt", color: "bg-amber-700 text-white" },
  { value: "black", label: "Black Belt", color: "bg-black text-white" },
];

const METHODS = [
  { value: "KO", label: "Knockout (KO)" },
  { value: "TKO", label: "Technical Knockout (TKO)" },
  { value: "Submission", label: "Submission" },
  { value: "Decision", label: "Decision" },
  { value: "Split Decision", label: "Split Decision" },
  { value: "Unanimous Decision", label: "Unanimous Decision" },
  { value: "Points", label: "Points" },
  { value: "DQ", label: "Disqualification" },
  { value: "Forfeit", label: "Forfeit" },
  { value: "Other", label: "Other" }
];

export default function Records() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isBeltOpen, setIsBeltOpen] = useState(false);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [sport, setSport] = useState("Boxing");
  const [result, setResult] = useState("win");
  const [method, setMethod] = useState("");
  const [opponent, setOpponent] = useState("");
  const [event, setEvent] = useState("");
  const [location, setLocation] = useState("");
  const [round, setRound] = useState("");
  const [notes, setNotes] = useState("");
  const [filterSport, setFilterSport] = useState("all");

  const [beltSport, setBeltSport] = useState("BJJ");
  const [belt, setBelt] = useState("white");
  const [stripes, setStripes] = useState("0");
  const [beltDate, setBeltDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [beltNotes, setBeltNotes] = useState("");
  const [editingBelt, setEditingBelt] = useState<MartialArtsBelt | null>(null);

  const { data: records = [], isLoading } = useQuery<MartialArtsRecord[]>({
    queryKey: ["/api/records"],
    queryFn: async () => {
      const res = await fetch("/api/records", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch records");
      return res.json();
    },
  });

  const { data: belts = [] } = useQuery<MartialArtsBelt[]>({
    queryKey: ["/api/belts"],
    queryFn: async () => {
      const res = await fetch("/api/belts", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch belts");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/records", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/records"] });
      setIsOpen(false);
      resetForm();
      toast({ title: "Record added", description: "Your fight record has been saved." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save record", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/records/${id}`, { method: "DELETE", credentials: "include" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/records"] });
      toast({ title: "Record deleted" });
    },
  });

  const createBeltMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/belts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/belts"] });
      setIsBeltOpen(false);
      resetBeltForm();
      toast({ title: "Belt updated", description: "Your belt rank has been saved." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save belt", variant: "destructive" });
    }
  });

  const updateBeltMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await fetch(`/api/belts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update belt");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/belts"] });
      setIsBeltOpen(false);
      setEditingBelt(null);
      resetBeltForm();
      toast({ title: "Belt updated" });
    },
  });

  const deleteBeltMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/belts/${id}`, { method: "DELETE", credentials: "include" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/belts"] });
      toast({ title: "Belt removed" });
    },
  });

  const resetForm = () => {
    setDate(format(new Date(), "yyyy-MM-dd"));
    setSport("Boxing");
    setResult("win");
    setMethod("");
    setOpponent("");
    setEvent("");
    setLocation("");
    setRound("");
    setNotes("");
  };

  const resetBeltForm = () => {
    setBeltSport("BJJ");
    setBelt("white");
    setStripes("0");
    setBeltDate(format(new Date(), "yyyy-MM-dd"));
    setBeltNotes("");
    setEditingBelt(null);
  };

  const handleSubmit = () => {
    if (!sport || !result) return;
    createMutation.mutate({
      date: new Date(date).toISOString(),
      sport,
      result,
      method: method || null,
      opponent: opponent || null,
      event: event || null,
      location: location || null,
      round: round ? parseInt(round) : null,
      notes: notes || null,
    });
  };

  const handleBeltSubmit = () => {
    if (!beltSport || !belt) return;
    const data = {
      sport: beltSport,
      belt,
      stripes: parseInt(stripes) || 0,
      dateAchieved: beltDate ? new Date(beltDate).toISOString() : null,
      notes: beltNotes || null,
    };
    if (editingBelt) {
      updateBeltMutation.mutate({ id: editingBelt.id, data });
    } else {
      createBeltMutation.mutate(data);
    }
  };

  const openEditBelt = (b: MartialArtsBelt) => {
    setEditingBelt(b);
    setBeltSport(b.sport);
    setBelt(b.belt);
    setStripes(String(b.stripes || 0));
    setBeltDate(b.dateAchieved ? format(new Date(b.dateAchieved), "yyyy-MM-dd") : "");
    setBeltNotes(b.notes || "");
    setIsBeltOpen(true);
  };

  const filteredRecords = filterSport === "all" 
    ? records 
    : records.filter(r => r.sport === filterSport);

  const stats = {
    total: records.length,
    wins: records.filter(r => r.result === "win").length,
    losses: records.filter(r => r.result === "loss").length,
    draws: records.filter(r => r.result === "draw").length,
  };

  const sportStats = SPORTS.map(s => ({
    sport: s,
    wins: records.filter(r => r.sport === s && r.result === "win").length,
    losses: records.filter(r => r.sport === s && r.result === "loss").length,
    draws: records.filter(r => r.sport === s && r.result === "draw").length,
    total: records.filter(r => r.sport === s).length,
  })).filter(s => s.total > 0);

  const getResultColor = (result: string) => {
    switch (result) {
      case "win": return "bg-green-600 text-white";
      case "loss": return "bg-red-600 text-white";
      case "draw": return "bg-yellow-600 text-white";
      default: return "bg-muted";
    }
  };

  const getBeltColor = (belt: string) => {
    const found = BJJ_BELTS.find(b => b.value === belt);
    return found?.color || "bg-muted";
  };

  const bjjBelt = belts.find(b => b.sport === "BJJ");

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <MobileNav />
        <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight flex items-center gap-2">
                <Trophy className="h-8 w-8 accent-text" />
                Fight Records
              </h1>
              <p className="text-muted-foreground">Track your martial arts competition history</p>
            </div>
            <div className="flex gap-2">
              <Dialog open={isBeltOpen} onOpenChange={(open) => { setIsBeltOpen(open); if (!open) resetBeltForm(); }}>
                <DialogTrigger asChild>
                  <Button variant="outline" data-testid="button-manage-belt">
                    <Award className="h-4 w-4 mr-2" />
                    Belt Rank
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingBelt ? "Update Belt Rank" : "Set Belt Rank"}</DialogTitle>
                    <DialogDescription>Track your current belt level</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Martial Art</Label>
                      <Select value={beltSport} onValueChange={setBeltSport}>
                        <SelectTrigger data-testid="select-belt-sport">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BELT_SPORTS.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Belt</Label>
                      <Select value={belt} onValueChange={setBelt}>
                        <SelectTrigger data-testid="select-belt">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BJJ_BELTS.map((b) => (
                            <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Stripes</Label>
                        <Select value={stripes} onValueChange={setStripes}>
                          <SelectTrigger data-testid="select-stripes">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[0, 1, 2, 3, 4].map((s) => (
                              <SelectItem key={s} value={String(s)}>{s} stripe{s !== 1 ? "s" : ""}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Date Achieved</Label>
                        <Input
                          type="date"
                          value={beltDate}
                          onChange={(e) => setBeltDate(e.target.value)}
                          data-testid="input-belt-date"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea
                        placeholder="Instructor, gym, etc."
                        value={beltNotes}
                        onChange={(e) => setBeltNotes(e.target.value)}
                        data-testid="input-belt-notes"
                      />
                    </div>

                    <Button
                      onClick={handleBeltSubmit}
                      className="w-full warrior-gradient accent-text"
                      disabled={createBeltMutation.isPending || updateBeltMutation.isPending}
                      data-testid="button-submit-belt"
                    >
                      {createBeltMutation.isPending || updateBeltMutation.isPending ? "Saving..." : editingBelt ? "Update Belt" : "Save Belt"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button className="warrior-gradient accent-text" data-testid="button-add-record">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Record
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add Fight Record</DialogTitle>
                    <DialogDescription>Log a new competition result</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          data-testid="input-record-date"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Sport</Label>
                        <Select value={sport} onValueChange={setSport}>
                          <SelectTrigger data-testid="select-sport">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SPORTS.map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Result</Label>
                        <Select value={result} onValueChange={setResult}>
                          <SelectTrigger data-testid="select-result">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="win">Win</SelectItem>
                            <SelectItem value="loss">Loss</SelectItem>
                            <SelectItem value="draw">Draw</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Method</Label>
                        <Select value={method} onValueChange={setMethod}>
                          <SelectTrigger data-testid="select-method">
                            <SelectValue placeholder="Select method..." />
                          </SelectTrigger>
                          <SelectContent>
                            {METHODS.map((m) => (
                              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="opponent">Opponent</Label>
                      <Input
                        id="opponent"
                        placeholder="Opponent name"
                        value={opponent}
                        onChange={(e) => setOpponent(e.target.value)}
                        data-testid="input-opponent"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="event">Event / Tournament</Label>
                      <Input
                        id="event"
                        placeholder="Event or tournament name"
                        value={event}
                        onChange={(e) => setEvent(e.target.value)}
                        data-testid="input-event"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          placeholder="City, State"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          data-testid="input-location"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="round">Round</Label>
                        <Input
                          id="round"
                          type="number"
                          min="1"
                          placeholder="Round #"
                          value={round}
                          onChange={(e) => setRound(e.target.value)}
                          data-testid="input-round"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Additional details about the fight..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        data-testid="input-notes"
                      />
                    </div>

                    <Button
                      onClick={handleSubmit}
                      className="w-full warrior-gradient accent-text"
                      disabled={createMutation.isPending}
                      data-testid="button-submit-record"
                    >
                      {createMutation.isPending ? "Saving..." : "Save Record"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Running Record Banner */}
          <Card className="mb-8 warrior-gradient">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-bold accent-text mb-1">Overall Record</h2>
                  <p className="text-sm opacity-80 accent-text">Your complete fight history</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold accent-text">{stats.wins}</div>
                    <div className="text-sm opacity-80 accent-text">WINS</div>
                  </div>
                  <div className="text-4xl font-bold accent-text">-</div>
                  <div className="text-center">
                    <div className="text-4xl font-bold accent-text">{stats.losses}</div>
                    <div className="text-sm opacity-80 accent-text">LOSSES</div>
                  </div>
                  <div className="text-4xl font-bold accent-text">-</div>
                  <div className="text-center">
                    <div className="text-4xl font-bold accent-text">{stats.draws}</div>
                    <div className="text-sm opacity-80 accent-text">DRAWS</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* BJJ Belt Display */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 accent-text" />
                Belt Ranks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {belts.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No belt ranks set yet. Click "Belt Rank" to add your current level.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {belts.map((b) => (
                    <div key={b.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge className={`${getBeltColor(b.belt)} text-sm px-3 py-1`}>
                          {b.belt.charAt(0).toUpperCase() + b.belt.slice(1)}
                          {b.stripes && b.stripes > 0 ? ` (${b.stripes} stripe${b.stripes > 1 ? 's' : ''})` : ''}
                        </Badge>
                        <span className="font-medium">{b.sport}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditBelt(b)}
                          data-testid={`button-edit-belt-${b.id}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteBeltMutation.mutate(b.id)}
                          className="text-muted-foreground hover:text-destructive"
                          data-testid={`button-delete-belt-${b.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats by Sport */}
          {sportStats.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Medal className="h-5 w-5 accent-text" />
                  Record by Sport
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sportStats.map((s) => (
                    <div key={s.sport} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="font-medium">{s.sport}</span>
                      <span className="text-sm font-semibold">
                        <span className="text-green-500">{s.wins}W</span>
                        {" - "}
                        <span className="text-red-500">{s.losses}L</span>
                        {s.draws > 0 && <span className="text-yellow-500"> - {s.draws}D</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filter & Records List */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 accent-text" />
                  Fight History
                </CardTitle>
                <Select value={filterSport} onValueChange={setFilterSport}>
                  <SelectTrigger className="w-48" data-testid="select-filter-sport">
                    <SelectValue placeholder="Filter by sport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sports</SelectItem>
                    {SPORTS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading records...</div>
              ) : filteredRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No fight records yet. Add your first record to start tracking!
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRecords.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg hover-elevate"
                      data-testid={`record-item-${record.id}`}
                    >
                      <Badge className={getResultColor(record.result)}>
                        {record.result.toUpperCase()}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">{record.sport}</span>
                          {record.method && (
                            <Badge variant="outline">{record.method}</Badge>
                          )}
                          {record.round && (
                            <span className="text-sm text-muted-foreground">Round {record.round}</span>
                          )}
                        </div>
                        {record.opponent && (
                          <div className="text-sm mt-1">
                            vs. <span className="font-medium">{record.opponent}</span>
                          </div>
                        )}
                        {record.event && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {record.event}
                            {record.location && ` • ${record.location}`}
                          </div>
                        )}
                        {record.notes && (
                          <div className="text-sm text-muted-foreground mt-2 italic">
                            {record.notes}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground mt-2">
                          {format(new Date(record.date), "MMM d, yyyy")}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(record.id)}
                        className="text-muted-foreground hover:text-destructive"
                        data-testid={`button-delete-record-${record.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
