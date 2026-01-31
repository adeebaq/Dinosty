import { useModules, useCompleteModule } from "@/hooks/use-modules";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayCircle, CheckCircle, Lock } from "lucide-react";
import confetti from "canvas-confetti";
import { DinoMascot } from "@/components/DinoMascot";

const MODULES_DATA = [
  {
     id: "safety-101",
     title: "Online Safety",
     description: "Learn how to keep your information safe online.",
     color: "bg-red-500",
     icon: "🛡️"
  },
  {
     id: "savings-basics",
     title: "Power of Saving",
     description: "Why saving money now helps you later.",
     color: "bg-blue-500",
     icon: "🐷"
  },
  {
     id: "earning-money",
     title: "Earning Money",
     description: "Different ways you can earn money.",
     color: "bg-green-500",
     icon: "💵"
  }
];

export default function KidLearn() {
  const { data: progress } = useModules();
  const { mutate: complete } = useCompleteModule();

  const isCompleted = (id: string) => progress?.some(p => p.moduleId === id && p.isCompleted);

  const handleStart = (id: string) => {
    // In a real app, this would open a modal with content.
    // For this MVP, we'll simulate "Learning" then completing.
    const confirmed = window.confirm("Ready to start learning this module?");
    if (confirmed) {
       setTimeout(() => {
          complete(id);
          confetti();
          alert("Module Completed! You're smarter now! 🧠");
       }, 1000);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="text-center py-8">
         <DinoMascot className="w-32 h-32 mx-auto mb-4" mood="thinking" />
         <h1 className="text-4xl font-display text-slate-800">Dino Academy</h1>
         <p className="text-slate-500 text-lg">Learn cool stuff about money and safety!</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
         {MODULES_DATA.map((module, index) => {
            const completed = isCompleted(module.id);
            // Lock subsequent modules until previous is done (simple gamification)
            // const locked = index > 0 && !isCompleted(MODULES_DATA[index - 1].id);
            const locked = false; // Unlocked for demo

            return (
               <Card key={module.id} className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all group">
                  <div className={`h-32 ${module.color} flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-500`}>
                     {module.icon}
                  </div>
                  <div className="p-6">
                     <h3 className="text-xl font-bold mb-2">{module.title}</h3>
                     <p className="text-slate-500 text-sm mb-6">{module.description}</p>
                     
                     {completed ? (
                        <div className="flex items-center text-green-600 font-bold bg-green-50 p-3 rounded-lg justify-center">
                           <CheckCircle className="w-5 h-5 mr-2" />
                           Completed
                        </div>
                     ) : locked ? (
                        <Button disabled className="w-full bg-slate-100 text-slate-400">
                           <Lock className="w-4 h-4 mr-2" />
                           Locked
                        </Button>
                     ) : (
                        <Button onClick={() => handleStart(module.id)} className="w-full bg-slate-900 text-white hover:bg-slate-800">
                           <PlayCircle className="w-4 h-4 mr-2" />
                           Start Learning
                        </Button>
                     )}
                  </div>
               </Card>
            )
         })}
      </div>
    </div>
  )
}
