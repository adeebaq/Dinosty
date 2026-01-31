import { useChores, useUpdateChoreStatus } from "@/hooks/use-chores";
import { useUser } from "@/hooks/use-app-users";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, Clock, Loader2 } from "lucide-react";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { DinoMascot } from "@/components/DinoMascot";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

export default function KidChores() {
  const { data: user } = useUser();
  const { data: chores, isLoading } = useChores(user?.id?.toString());
  const { mutate: updateStatus } = useUpdateChoreStatus();

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="w-10 h-10 animate-spin text-green-500"/></div>;

  const handleComplete = (id: number) => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#16a34a', '#fbbf24', '#0ea5e9']
    });
    updateStatus({ id, status: "completed" });
  };

  const pendingChores = chores?.filter(c => c.status === "pending") || [];
  const completedChores = chores?.filter(c => c.status === "completed" || c.status === "approved") || [];

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-3xl font-display text-green-800">My Chores</h1>
            <p className="text-slate-600">Complete tasks to earn coins!</p>
         </div>
         <div className="hidden md:block">
            <DinoMascot className="w-20 h-20" mood="happy" />
         </div>
      </div>
      
      {/* Current Balance Card */}
      <Card className="bg-gradient-to-r from-yellow-400 to-orange-400 border-none shadow-lg text-white p-6 relative overflow-hidden">
         <div className="relative z-10 flex justify-between items-center">
            <div>
               <h2 className="text-lg font-bold opacity-90">My Pocket Money</h2>
               <div className="text-5xl font-display font-black mt-1 text-shadow-sm">
                  <CurrencyDisplay amount={user?.balance || 0} showIcon={false} className="text-white" />
               </div>
            </div>
            <div className="text-6xl animate-bounce">🪙</div>
         </div>
         <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-16 -mt-16 pointer-events-none" />
      </Card>

      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
           <span className="bg-blue-100 text-blue-600 p-2 rounded-lg">📋</span>
           To Do List
        </h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          {pendingChores.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
               <p className="text-slate-500 font-medium">All caught up! Great job! 🎉</p>
            </div>
          ) : (
            pendingChores.map(chore => (
              <Card key={chore.id} className="p-4 border-2 border-slate-100 hover:border-blue-200 transition-colors shadow-sm card-hover group">
                 <div className="flex justify-between items-start">
                    <div>
                       <h4 className="font-bold text-lg text-slate-800">{chore.title}</h4>
                       <p className="text-sm text-slate-500 mb-4">{chore.description}</p>
                       <span className="inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold">
                          Reward: <CurrencyDisplay amount={chore.rewardValue} showIcon={false} className="text-yellow-700" />
                       </span>
                    </div>
                    <Button 
                      size="lg" 
                      onClick={() => handleComplete(chore.id)}
                      className="bg-slate-100 hover:bg-green-500 text-slate-400 hover:text-white rounded-full w-12 h-12 p-0 transition-all"
                    >
                       <CheckCircle className="w-8 h-8" />
                    </Button>
                 </div>
              </Card>
            ))
          )}
        </div>
      </section>

      <section>
         <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-400">
            <span className="bg-green-100 text-green-600 p-2 rounded-lg">✅</span>
            Completed & Approved
         </h3>
         <div className="space-y-3 opacity-80">
            {completedChores.map(chore => (
               <div key={chore.id} className="bg-slate-50 p-4 rounded-xl flex items-center justify-between border border-slate-100">
                  <div className="flex items-center gap-3">
                     <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        chore.status === "approved" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-500"
                     )}>
                        {chore.status === "approved" ? <CheckCircle className="w-5 h-5"/> : <Clock className="w-5 h-5"/>}
                     </div>
                     <div>
                        <p className="font-bold text-slate-700 line-through decoration-slate-400 decoration-2">{chore.title}</p>
                        <p className="text-xs text-slate-400 capitalize">{chore.status === "approved" ? "Paid!" : "Waiting for parent..."}</p>
                     </div>
                  </div>
                  <CurrencyDisplay amount={chore.rewardValue} className="text-slate-400 text-sm" />
               </div>
            ))}
         </div>
      </section>
    </div>
  );
}
