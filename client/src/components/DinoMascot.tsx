import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// A SVG representation of a cute dino
export function DinoMascot({ 
  className, 
  mood = "happy",
  animate = true
}: { 
  className?: string;
  mood?: "happy" | "excited" | "thinking";
  animate?: boolean;
}) {
  return (
    <motion.div 
      className={cn("relative w-32 h-32", className)}
      animate={animate ? { y: [0, -5, 0] } : {}}
      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
    >
      {/* Simple SVG Dino */}
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl">
        <path d="M75 35C75 25 65 15 50 15C35 15 25 25 25 35C25 45 25 55 35 65L30 85H45L40 65H60L55 85H70L65 65C75 55 75 45 75 35Z" fill="#16a34a" />
        <circle cx="40" cy="35" r="3" fill="white" />
        <circle cx="60" cy="35" r="3" fill="white" />
        <circle cx="40" cy="35" r="1.5" fill="black" />
        <circle cx="60" cy="35" r="1.5" fill="black" />
        {mood === "happy" && <path d="M40 45Q50 55 60 45" stroke="white" strokeWidth="3" strokeLinecap="round" />}
        {mood === "excited" && <path d="M40 45Q50 60 60 45" stroke="white" strokeWidth="3" strokeLinecap="round" />}
        {mood === "thinking" && <path d="M40 48H60" stroke="white" strokeWidth="3" strokeLinecap="round" />}
        {/* Belly */}
        <path d="M40 65H60C60 65 62 50 50 50C38 50 40 65 40 65Z" fill="#4ade80" opacity="0.5" />
      </svg>
    </motion.div>
  );
}
