import { useChores, useUpdateChoreStatus } from "@/hooks/use-chores";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";

export default function ParentApprovals() {
   // Fetch all chores that are 'completed' and need approval
   // Realistically we'd filter this on backend or fetch all children's chores
   const { data: chores, isLoading } = useChores(); 
   const { mutate: updateStatus } = useUpdateChoreStatus();

   if (isLoading) return <Loader2 className="animate-spin" />;

   const pendingApproval = chores?.filter(c => c.status === "completed") || [];

   return (
      <div className="max-w-4xl mx-auto pb-20">
         <h1 className="text-2xl font-bold mb-6 text-slate-900">Pending Approvals</h1>
         
         {pendingApproval.length === 0 ? (
            <div className="text-center py-20 bg-green-50 rounded-xl border border-green-100">
               <div className="text-4xl mb-4">👍</div>
               <h3 className="text-lg font-bold text-green-800">All caught up!</h3>
               <p className="text-green-600">No pending approvals.</p>
            </div>
         ) : (
            <div className="grid gap-4">
               {pendingApproval.map(chore => (
                  <Card key={chore.id} className="p-6 flex items-center justify-between border-l-4 border-l-orange-400 shadow-sm">
                     <div>
                        <h3 className="font-bold text-lg">{chore.title}</h3>
                        <p className="text-slate-500 text-sm mb-1">{chore.description}</p>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                           Reward: <CurrencyDisplay amount={chore.rewardValue} className="text-slate-600" />
                        </div>
                     </div>
                     <div className="flex gap-2">
                        <Button 
                           size="sm" 
                           variant="outline" 
                           onClick={() => updateStatus({ id: chore.id, status: "declined" })}
                           className="text-red-500 border-red-200 hover:bg-red-50"
                        >
                           <X className="w-4 h-4 mr-1" /> Decline
                        </Button>
                        <Button 
                           size="sm"
                           onClick={() => updateStatus({ id: chore.id, status: "approved" })}
                           className="bg-green-600 hover:bg-green-700 text-white"
                        >
                           <Check className="w-4 h-4 mr-1" /> Approve & Pay
                        </Button>
                     </div>
                  </Card>
               ))}
            </div>
         )}
      </div>
   )
}
