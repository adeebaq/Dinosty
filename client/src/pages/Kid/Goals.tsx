import { useState } from "react";
import { useGoals, useCreateGoal, useContributeGoal } from "@/hooks/use-goals";
import { useUser } from "@/hooks/use-app-users";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Plus, Target, Rocket } from "lucide-react";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import confetti from "canvas-confetti";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGoalSchema } from "@shared/schema";

export default function KidGoals() {
  const { data: user } = useUser();
  const { data: goals, isLoading } = useGoals(user?.id?.toString());
  const { mutateAsync: createGoal } = useCreateGoal();
  const { mutateAsync: contribute } = useContributeGoal();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);

  if (isLoading) return <div>Loading...</div>;

  const handleContribute = async (id: number, current: number, target: number) => {
    // Simple logic: contribute remaining amount or whatever balance user has
    // For MVP just allow contributing $1 at a time for fun interaction
    try {
      if (!user || user.balance < 100) {
        alert("Not enough money!");
        return;
      }
      await contribute({ id, amount: 100 }); // Contribute $1.00
      confetti({ particleCount: 50, origin: { y: 0.7 } });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 pb-20">
       <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display text-blue-800">My Goals</h1>
            <p className="text-slate-600">Save up for things you want!</p>
          </div>
          <CreateGoalDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onCreate={createGoal} userId={user?.id!} />
       </div>

       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals?.map(goal => {
             const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
             const isReached = progress >= 100;

             return (
               <Card key={goal.id} className="relative overflow-hidden border-2 border-slate-100 hover:border-blue-300 transition-all shadow-md group">
                  <div className="p-6">
                     <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl shadow-inner">
                           {isReached ? "🏆" : "🎯"}
                        </div>
                        <div className="text-right">
                           <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Target</p>
                           <CurrencyDisplay amount={goal.targetAmount} className="text-xl" />
                        </div>
                     </div>
                     
                     <h3 className="text-xl font-bold text-slate-800 mb-2">{goal.title}</h3>
                     
                     <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-sm font-medium">
                           <span className="text-slate-500">Saved</span>
                           <span className="text-blue-600">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-4 rounded-full bg-slate-100" indicatorClassName={isReached ? "bg-green-500" : "bg-blue-500"} />
                        <div className="text-right text-xs text-slate-400">
                           <CurrencyDisplay amount={goal.currentAmount} showIcon={false} className="text-slate-600" /> saved so far
                        </div>
                     </div>

                     <Button 
                        onClick={() => handleContribute(goal.id, goal.currentAmount, goal.targetAmount)}
                        disabled={isReached || (user?.balance || 0) < 100}
                        className={isReached 
                           ? "w-full bg-green-500 hover:bg-green-600 text-white font-bold" 
                           : "w-full bg-blue-500 hover:bg-blue-600 text-white font-bold shadow-blue-200 shadow-lg"
                        }
                     >
                        {isReached ? "Goal Reached!" : "Add $1.00"}
                     </Button>
                  </div>
                  {isReached && <div className="absolute inset-0 bg-white/50 flex items-center justify-center backdrop-blur-[2px]">
                     <div className="bg-green-500 text-white px-6 py-2 rounded-full font-bold shadow-xl transform -rotate-6 border-4 border-white">
                        COMPLETED!
                     </div>
                  </div>}
               </Card>
             );
          })}
          
          <button 
             onClick={() => setIsCreateOpen(true)}
             className="border-4 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-300 hover:bg-blue-50 transition-all group min-h-[300px]"
          >
             <div className="w-16 h-16 rounded-full bg-slate-100 group-hover:bg-blue-200 flex items-center justify-center mb-4 transition-colors">
                <Plus className="w-8 h-8 text-slate-400 group-hover:text-blue-600" />
             </div>
             <span className="font-bold text-lg">Create New Goal</span>
          </button>
       </div>
    </div>
  );
}

function CreateGoalDialog({ open, onOpenChange, onCreate, userId }: any) {
   const form = useForm<z.infer<typeof insertGoalSchema>>({
      resolver: zodResolver(insertGoalSchema),
      defaultValues: {
         title: "",
         targetAmount: 1000, // $10 default
         userId,
      }
   });

   const handleSubmit = async (data: any) => {
      await onCreate({ ...data, userId });
      onOpenChange(false);
      form.reset();
   };

   return (
      <Dialog open={open} onOpenChange={onOpenChange}>
         <DialogTrigger asChild><span className="hidden"></span></DialogTrigger>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>Set a New Goal</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
               <div className="space-y-2">
                  <Label>What are you saving for?</Label>
                  <Input {...form.register("title")} placeholder="e.g. Lego Set, New Bike" />
               </div>
               <div className="space-y-2">
                  <Label>How much does it cost? (in cents)</Label>
                  <div className="flex items-center gap-2">
                     <span className="text-2xl">🪙</span>
                     <Input type="number" {...form.register("targetAmount", { valueAsNumber: true })} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                     Enter 1000 for $10.00
                  </p>
               </div>
               <DialogFooter>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Create Goal</Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   )
}
