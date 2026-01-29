import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Dumbbell, 
  Utensils, 
  Scale, 
  Moon, 
  Bot, 
  LayoutDashboard, 
  LogOut, 
  Menu,
  BookOpen,
  Camera,
  Wallet,
  CalendarDays,
  CheckSquare,
  Trophy,
  Calculator,
  ClipboardList
} from "lucide-react";

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
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/weight", label: "Weight", icon: Scale },
  { href: "/diet", label: "Diet & Nutrition", icon: Utensils },
  { href: "/workouts", label: "Workouts", icon: Dumbbell },
  { href: "/recovery-sleep", label: "Recovery & Sleep", icon: Moon },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/progress-photos", label: "Progress Photos", icon: Camera },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/todos", label: "To-Do List", icon: CheckSquare },
  { href: "/budget", label: "Budget", icon: Wallet },
  { href: "/budget-planner", label: "Budget Planner", icon: ClipboardList },
  { href: "/paycheck", label: "Paycheck Predictor", icon: Calculator },
  { href: "/records", label: "Fight Records", icon: Trophy },
  { href: "/ai-coach", label: "AI Assistant", icon: Bot },
];

export function Sidebar() {
  const [location] = useLocation();
  const { logout } = useAuth();

  return (
    <div className="hidden md:flex h-screen w-64 flex-col border-r bg-card px-4 py-6">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="h-9 w-9 rounded-lg warrior-gradient flex items-center justify-center border accent-border">
          <BoxingGlove className="h-5 w-5 accent-text" />
        </div>
        <div className="flex flex-col">
          <span className="font-display text-lg font-bold tracking-tight leading-tight">
            <span className="text-primary">Warrior</span>
          </span>
          <span className="font-display text-sm font-bold accent-text leading-tight">Lyfestyle</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <button
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "warrior-gradient accent-text shadow-lg shadow-primary/25" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                data-testid={`nav-${item.href.replace('/', '')}`}
              >
                <item.icon className={cn("h-4 w-4", isActive ? "accent-text" : "text-muted-foreground")} />
                {item.label}
              </button>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t pt-4">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => logout()}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { logout } = useAuth();

  return (
    <div className="md:hidden flex items-center justify-between p-4 border-b bg-background sticky top-0 z-50">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-4">
          <div className="flex items-center gap-2 px-2 mb-8 mt-4">
            <div className="h-8 w-8 rounded-lg warrior-gradient flex items-center justify-center border accent-border">
              <BoxingGlove className="h-5 w-5 accent-text" />
            </div>
            <span className="font-display text-xl font-bold">
              <span className="text-primary">Warrior</span>{" "}
              <span className="accent-text">Lyfestyle</span>
            </span>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
            {NAV_ITEMS.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    onClick={() => setOpen(false)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive 
                        ? "warrior-gradient accent-text shadow-lg shadow-primary/25" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto absolute bottom-4 left-4 right-4 border-t pt-4">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => logout()}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg warrior-gradient flex items-center justify-center border accent-border">
          <BoxingGlove className="h-4 w-4 accent-text" />
        </div>
        <span className="font-display text-lg font-bold">
          <span className="text-primary">Warrior</span>{" "}
          <span className="accent-text">Lyfestyle</span>
        </span>
      </div>
    </div>
  );
}

export default function Navigation() {
  return (
    <>
      <Sidebar />
      <MobileNav />
    </>
  );
}
