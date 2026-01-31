import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/Navigation";

import Home from "@/pages/Home";
import Onboarding from "@/pages/Onboarding";
import NotFound from "@/pages/not-found";

// Kid Pages
import KidChores from "@/pages/Kid/Chores";
import KidGoals from "@/pages/Kid/Goals";
import KidLearn from "@/pages/Kid/Learn";

// Parent Pages
import ParentDashboard from "@/pages/Parent/Dashboard";
import ParentChores from "@/pages/Parent/Chores";
import ParentApprovals from "@/pages/Parent/Approvals";

function Router() {
  return (
    <div className="min-h-screen bg-slate-50">
       <Navigation />
       <main className="container mx-auto px-4 py-8">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/onboarding" component={Onboarding} />
            
            {/* Kid Routes */}
            <Route path="/kid/chores" component={KidChores} />
            <Route path="/kid/goals" component={KidGoals} />
            <Route path="/kid/learn" component={KidLearn} />
            
            {/* Parent Routes */}
            <Route path="/parent/dashboard" component={ParentDashboard} />
            <Route path="/parent/chores" component={ParentChores} />
            <Route path="/parent/approvals" component={ParentApprovals} />
            
            <Route component={NotFound} />
          </Switch>
       </main>
    </div>
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
