import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "@/pages/landing-page";
import Dashboard from "@/pages/dashboard";
import WeightTracker from "@/pages/weight-tracker";
import DietTracker from "@/pages/diet-tracker";
import Workouts from "@/pages/workouts";
import RecoverySleep from "@/pages/recovery-sleep";
import Journal from "@/pages/journal";
import ProgressPhotos from "@/pages/progress-photos";
import Calendar from "@/pages/calendar";
import Budget from "@/pages/budget";
import BudgetPlanner from "@/pages/budget-planner";
import Todos from "@/pages/todos";
import Records from "@/pages/records";
import Paycheck from "@/pages/paycheck";
import AICoach from "@/pages/ai-coach";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/weight" component={WeightTracker} />
      <Route path="/diet" component={DietTracker} />
      <Route path="/workouts" component={Workouts} />
      <Route path="/recovery-sleep" component={RecoverySleep} />
      <Route path="/journal" component={Journal} />
      <Route path="/progress-photos" component={ProgressPhotos} />
      <Route path="/calendar" component={Calendar} />
      <Route path="/budget" component={Budget} />
      <Route path="/budget-planner" component={BudgetPlanner} />
      <Route path="/todos" component={Todos} />
      <Route path="/records" component={Records} />
      <Route path="/paycheck" component={Paycheck} />
      <Route path="/ai-coach" component={AICoach} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
