import { useAuth } from "@/hooks/use-auth";
import { useUser } from "@/hooks/use-app-users";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { DinoMascot } from "@/components/DinoMascot";

export default function Home() {
  const { user: authUser, isLoading: isAuthLoading } = useAuth();
  const { data: appUser, isLoading: isUserLoading } = useUser();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthLoading || isUserLoading) return;

    if (authUser) {
       if (appUser) {
          // If user has a profile, go to dashboard
          if (appUser.isParent) {
             setLocation("/parent/dashboard");
          } else {
             setLocation("/kid/chores");
          }
       } else {
          // Auth but no profile -> Onboarding
          setLocation("/onboarding");
       }
    }
  }, [authUser, appUser, isAuthLoading, isUserLoading, setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50 flex flex-col items-center justify-center p-4">
       <div className="max-w-md w-full text-center space-y-8">
          <div className="relative inline-block">
             <div className="absolute inset-0 bg-green-300 rounded-full blur-3xl opacity-30 animate-pulse" />
             <DinoMascot className="w-48 h-48 mx-auto relative z-10" mood="excited" />
          </div>
          
          <div className="space-y-4">
             <h1 className="text-5xl font-display font-black text-slate-800 tracking-tight">
                Dino<span className="text-green-600">Finance</span>
             </h1>
             <p className="text-lg text-slate-600 font-medium">
                Learn to earn, save, and spend smart with your dino friend!
             </p>
          </div>

          <div className="space-y-4 pt-8">
             <Button 
                size="lg" 
                className="w-full h-14 text-xl font-bold rounded-2xl bg-slate-900 text-white hover:bg-slate-800 shadow-xl hover:-translate-y-1 transition-all"
                onClick={() => window.location.href = "/api/login"}
             >
                Login / Sign Up
             </Button>
             <p className="text-xs text-slate-400">Parents need to create an account first!</p>
          </div>
       </div>
    </div>
  );
}
