import { useState } from "react";
import { useChildren } from "@/hooks/use-app-users";
import { useCreateChore, useChores } from "@/hooks/use-chores";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertChoreSchema } from "@shared/schema";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Plus } from "lucide-react";

export default function ParentChores() {
   const { data: children } = useChildren();
   const [selectedChild, setSelectedChild] = useState<string | undefined>(undefined);
   const { data: chores } = useChores(selectedChild);
   const { mutate: createChore } = useCreateChore();
   const [isOpen, setIsOpen] = useState(false);

   // Form Setup
   const form = useForm<z.infer<typeof insertChoreSchema>>({
      resolver: zodResolver(insertChoreSchema),
      defaultValues: {
         title: "",
         description: "",
         rewardValue: 100,
         assigneeId: 0,
         creatorId: 0, // Handled by backend mostly, but schema requires it
      }
   });

   const onSubmit = (data: any) => {
      // In a real app we'd get current user ID for creatorId
      // For now, assume backend handles creatorId from auth session
      createChore({ ...data, assigneeId: parseInt(selectedChild!), creatorId: 0 });
      setIsOpen(false);
      form.reset();
   };

   return (
      <div className="max-w-4xl mx-auto pb-20">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
               <h1 className="text-2xl font-bold text-slate-900">Manage Chores</h1>
               <p className="text-slate-500">Create and assign tasks.</p>
            </div>
            
            <div className="flex gap-4">
               <Select onValueChange={setSelectedChild} value={selectedChild}>
                  <SelectTrigger className="w-[200px]">
                     <SelectValue placeholder="Select Child" />
                  </SelectTrigger>
                  <SelectContent>
                     {children?.map(child => (
                        <SelectItem key={child.id} value={child.id.toString()}>{child.displayName}</SelectItem>
                     ))}
                  </SelectContent>
               </Select>

               <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogTrigger asChild>
                     <Button disabled={!selectedChild} className="bg-green-600 hover:bg-green-700">
                        <Plus className="w-4 h-4 mr-2" /> Add Chore
                     </Button>
                  </DialogTrigger>
                  <DialogContent>
                     <DialogHeader>
                        <DialogTitle>Create New Chore</DialogTitle>
                     </DialogHeader>
                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                           <FormField
                              control={form.control}
                              name="title"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl><Input placeholder="Clean Room" {...field} /></FormControl>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           />
                           <FormField
                              control={form.control}
                              name="description"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl><Input placeholder="Put away toys and vacuum" {...field} /></FormControl>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           />
                           <FormField
                              control={form.control}
                              name="rewardValue"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormLabel>Reward (cents)</FormLabel>
                                    <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           />
                           <DialogFooter>
                              <Button type="submit">Create</Button>
                           </DialogFooter>
                        </form>
                     </Form>
                  </DialogContent>
               </Dialog>
            </div>
         </div>

         {!selectedChild ? (
            <div className="text-center py-20 bg-slate-50 rounded-xl border border-slate-200">
               <p className="text-slate-500">Select a child to view their chores.</p>
            </div>
         ) : (
            <div className="space-y-4">
               {chores?.map(chore => (
                  <Card key={chore.id} className="p-4 flex justify-between items-center">
                     <div>
                        <h3 className="font-bold">{chore.title}</h3>
                        <p className="text-sm text-slate-500">{chore.description}</p>
                     </div>
                     <div className="flex items-center gap-4">
                        <span className="font-bold text-yellow-600">${(chore.rewardValue / 100).toFixed(2)}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                           chore.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                           chore.status === 'approved' ? 'bg-green-100 text-green-700' :
                           'bg-slate-100 text-slate-500'
                        }`}>
                           {chore.status.toUpperCase()}
                        </span>
                     </div>
                  </Card>
               ))}
               {chores?.length === 0 && <p className="text-center text-slate-400">No chores assigned yet.</p>}
            </div>
         )}
      </div>
   );
}
