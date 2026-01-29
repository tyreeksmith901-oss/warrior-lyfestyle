import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, LineChart, Shield, Wallet, Dumbbell } from "lucide-react";
import { Redirect } from "wouter";

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

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (isAuthenticated) return <Redirect to="/dashboard" />;

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-secondary/30">
      <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg warrior-gradient flex items-center justify-center border-2 accent-border">
            <BoxingGlove className="h-6 w-6 accent-text" />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight">
            <span className="text-primary">Warrior</span>{" "}
            <span className="accent-text">Lyfestyle</span>
          </span>
        </div>
        <Button 
          onClick={handleLogin} 
          variant="outline" 
          className="font-semibold rounded-full px-6 border-2 accent-border accent-text hover:bg-secondary/10"
          data-testid="button-signin"
        >
          Sign In
        </Button>
      </nav>

      <main className="flex-1 container mx-auto px-6 pt-12 pb-24 md:pt-24 lg:pt-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-foreground">
              Forge your <span className="accent-text">warrior</span> discipline.
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
              Complete health and finance mastery in one app. Track fitness, nutrition, martial arts training, and budget with AI-powered insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                onClick={handleLogin} 
                size="lg" 
                className="rounded-full text-lg h-14 px-8 warrior-gradient accent-text border-2 accent-border shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all hover:-translate-y-1"
                data-testid="button-start-journey"
              >
                Begin Your Path <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex flex-wrap items-center gap-6 pt-8 text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 accent-text" />
                <span>Secure Data</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 accent-text" />
                <span>AI Powered</span>
              </div>
              <div className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 accent-text" />
                <span>Full Fitness</span>
              </div>
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 accent-text" />
                <span>Budget Tools</span>
              </div>
            </div>
          </div>

          <div className="relative animate-in fade-in zoom-in duration-1000 delay-200">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-[2.5rem] blur-3xl opacity-50" />
            <div className="relative warrior-gradient border-2 accent-border rounded-[2rem] shadow-2xl p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between mb-8 gap-4">
                <div className="space-y-1">
                  <div className="h-4 w-32 bg-secondary/30 rounded-full animate-pulse" />
                  <div className="h-8 w-48 bg-secondary/20 rounded-full animate-pulse" />
                </div>
                <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center">
                  <BoxingGlove className="h-6 w-6 accent-text" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl space-y-2 border accent-border/30">
                  <div className="h-8 w-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                    <Dumbbell className="h-4 w-4 accent-text" />
                  </div>
                  <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
                  <div className="h-6 w-16 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="bg-white/5 p-4 rounded-2xl space-y-2 border accent-border/30">
                  <div className="h-8 w-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                    <LineChart className="h-4 w-4 accent-text" />
                  </div>
                  <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
                  <div className="h-6 w-16 bg-white/5 rounded animate-pulse" />
                </div>
              </div>

              <div className="h-32 bg-gradient-to-t from-secondary/10 to-transparent rounded-xl border border-dashed accent-border/30 flex items-end justify-center pb-4">
                 <span className="text-xs font-medium accent-text/60">Your warrior journey visualized</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
