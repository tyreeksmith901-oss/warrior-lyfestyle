import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { 
  type InsertWeightEntry, 
  type InsertDietEntry, 
  type InsertWorkout, 
  type InsertRecoveryEntry, 
  type InsertSleepEntry 
} from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// === WEIGHT HOOKS ===
export function useWeightEntries() {
  return useQuery({
    queryKey: [api.weight.list.path],
    queryFn: async () => {
      const res = await fetch(api.weight.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch weight entries");
      return api.weight.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateWeightEntry() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: Omit<InsertWeightEntry, "userId">) => {
      const res = await fetch(api.weight.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to log weight");
      return api.weight.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.weight.list.path] });
      toast({ title: "Weight Logged", description: "Keep it up!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to log weight", variant: "destructive" });
    }
  });
}

// === DIET HOOKS ===
export function useDietEntries() {
  return useQuery({
    queryKey: [api.diet.list.path],
    queryFn: async () => {
      const res = await fetch(api.diet.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch diet entries");
      return api.diet.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateDietEntry() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: Omit<InsertDietEntry, "userId">) => {
      const res = await fetch(api.diet.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to log meal");
      return api.diet.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.diet.list.path] });
      toast({ title: "Meal Logged", description: "Bon appétit!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to log meal", variant: "destructive" });
    }
  });
}

// === WORKOUT HOOKS ===
export function useWorkouts() {
  return useQuery({
    queryKey: [api.workouts.list.path],
    queryFn: async () => {
      const res = await fetch(api.workouts.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch workouts");
      return api.workouts.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateWorkout() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: Omit<InsertWorkout, "userId">) => {
      const res = await fetch(api.workouts.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to log workout");
      return api.workouts.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.workouts.list.path] });
      toast({ title: "Workout Logged", description: "Stronger every day!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to log workout", variant: "destructive" });
    }
  });
}

// === RECOVERY HOOKS ===
export function useRecoveryEntries() {
  return useQuery({
    queryKey: [api.recovery.list.path],
    queryFn: async () => {
      const res = await fetch(api.recovery.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch recovery entries");
      return api.recovery.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateRecoveryEntry() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: Omit<InsertRecoveryEntry, "userId">) => {
      const res = await fetch(api.recovery.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to log recovery");
      return api.recovery.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.recovery.list.path] });
      toast({ title: "Recovery Logged", description: "Rest is part of the work." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to log recovery", variant: "destructive" });
    }
  });
}

// === SLEEP HOOKS ===
export function useSleepEntries() {
  return useQuery({
    queryKey: [api.sleep.list.path],
    queryFn: async () => {
      const res = await fetch(api.sleep.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch sleep entries");
      return api.sleep.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateSleepEntry() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: Omit<InsertSleepEntry, "userId">) => {
      const res = await fetch(api.sleep.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to log sleep");
      return api.sleep.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.sleep.list.path] });
      toast({ title: "Sleep Logged", description: "Sweet dreams." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to log sleep", variant: "destructive" });
    }
  });
}

// === DELETE HOOK (Generic) ===
export function useDeleteEntry(resource: "weight" | "diet" | "workouts" | "recovery" | "sleep") {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api[resource].delete.path, { id });
      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete entry");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api[resource].list.path] });
      toast({ title: "Deleted", description: "Entry removed successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete entry", variant: "destructive" });
    }
  });
}
