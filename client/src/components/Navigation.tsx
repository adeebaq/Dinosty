import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useUser } from "@/hooks/use-app-users";
import { Button } from "@/components/ui/button";
import { LogOut, Home, ListTodo, Target, GraduationCap, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [location] = useLocation();
  const { logout } = useAuth();
  const { data: user } = useUser();
  
  if (!user) return null;

  const isParent = user.isParent;
  
  const kidLinks = [
    { href: "/kid/chores", label: "Chores", icon: ListTodo },
    { href: "/kid/goals", label: "Goals", icon: Target },
    { href: "/kid/learn", label: "Learn", icon: GraduationCap },
  ];

  const parentLinks = [
    { href: "/parent/dashboard", label: "Dashboard", icon: Home },
    { href: "/parent/chores", label: "Manage Chores", icon: ListTodo },
    { href: "/parent/approvals", label: "Approvals", icon: Users },
  ];

  const links = isParent ? parentLinks : kidLinks;

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="font-display font-bold text-2xl text-green-600 tracking-tight">DinoFinance</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4 items-center">
              {links.map((link) => (
                <Link key={link.href} href={link.href} className={cn(
                  "px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2",
                  location === link.href 
                    ? "bg-green-100 text-green-700" 
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                )}>
                    <link.icon className="w-4 h-4" />
                    {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-sm font-bold text-gray-800">{user.displayName}</span>
                <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">{isParent ? "Parent" : "Explorer"}</span>
             </div>
             <Button variant="ghost" size="sm" onClick={() => logout()} className="text-red-500 hover:bg-red-50 hover:text-red-600">
               <LogOut className="w-4 h-4 mr-2" />
               Sign Out
             </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Nav */}
      <div className="sm:hidden border-t flex justify-around p-2 bg-gray-50">
         {links.map((link) => (
            <Link key={link.href} href={link.href} className={cn(
              "p-2 rounded-lg flex flex-col items-center justify-center text-xs font-medium",
               location === link.href ? "text-green-600 bg-white shadow-sm" : "text-gray-400"
            )}>
                <link.icon className="w-5 h-5 mb-1" />
                {link.label}
            </Link>
         ))}
      </div>
    </nav>
  );
}
