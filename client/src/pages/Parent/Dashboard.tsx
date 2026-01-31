import { useChildren } from "@/hooks/use-app-users";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, UserCircle, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";

export default function ParentDashboard() {
  const { data: children, isLoading } = useChildren();

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-center border-b pb-6">
         <div>
            <h1 className="text-3xl font-display text-slate-900">Parent Dashboard</h1>
            <p className="text-slate-500">Manage your family finances and chores.</p>
         </div>
         <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" /> Add Child
         </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
         {children?.map(child => (
            <Card key={child.id} className="p-6 hover:shadow-lg transition-all border-l-4 border-l-blue-500">
               <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-3xl">
                     {child.dinosaurColor === "green" ? "🦖" : "🦕"}
                  </div>
                  <div>
                     <h3 className="text-xl font-bold">{child.displayName}</h3>
                     <p className="text-sm text-slate-500">@{child.username}</p>
                  </div>
               </div>
               
               <div className="bg-slate-50 rounded-xl p-4 mb-6 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Current Balance</span>
                  <CurrencyDisplay amount={child.balance} className="text-2xl text-slate-800" />
               </div>

               <div className="grid grid-cols-2 gap-3">
                  <Link href={`/parent/chores?child=${child.id}`}>
                     <Button variant="outline" className="w-full">Assign Chores</Button>
                  </Link>
                  <Link href={`/parent/approvals?child=${child.id}`}>
                     <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        View Activity <ArrowRight className="w-4 h-4 ml-1" />
                     </Button>
                  </Link>
               </div>
            </Card>
         ))}
         
         {children?.length === 0 && (
            <div className="col-span-full text-center py-20 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
               <UserCircle className="w-16 h-16 mx-auto text-slate-300 mb-4" />
               <h3 className="text-xl font-bold text-slate-600">No children linked yet</h3>
               <p className="text-slate-400 mb-6">Invite your kids to join using your username!</p>
               <Button>Invite Child</Button>
            </div>
         )}
      </div>
    </div>
  );
}
