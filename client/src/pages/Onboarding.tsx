import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema } from "@shared/schema";
import { useOnboardUser } from "@/hooks/use-app-users";
import { z } from "zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DinoMascot } from "@/components/DinoMascot";

type OnboardValues = z.infer<typeof onboardingSchema>;

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const { mutateAsync: onboard, isPending } = useOnboardUser();
  
  const form = useForm<OnboardValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      username: "",
      displayName: "",
      isParent: false,
      dinosaurColor: "green",
    },
  });

  const onSubmit = async (data: OnboardValues) => {
    try {
      // In a real app, we'd handle parentId linking here.
      // For now, if it's a kid, we'll just ignore the parent link or handle it on backend.
      await onboard(data);
      if (data.isParent) {
        setLocation("/parent/dashboard");
      } else {
        setLocation("/kid/chores");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const isParent = form.watch("isParent");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex flex-col items-center animate-float">
        <DinoMascot className="w-40 h-40 mb-4" mood="excited" />
        <h1 className="text-4xl font-display font-bold text-green-700">Welcome to DinoFinance!</h1>
      </div>

      <Card className="w-full max-w-lg shadow-xl border-t-8 border-t-green-500">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold font-body">Let's set up your profile</CardTitle>
          <CardDescription>Tell us a bit about yourself to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <FormField
                control={form.control}
                name="isParent"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Who are you?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(val) => field.onChange(val === "true")}
                        defaultValue={field.value ? "true" : "false"}
                        className="grid grid-cols-2 gap-4"
                      >
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem value="false" className="peer sr-only" />
                          </FormControl>
                          <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-500 [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                             <span className="text-3xl mb-2">🦖</span>
                             <span className="font-bold">I'm a Kid</span>
                          </FormLabel>
                        </FormItem>
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem value="true" className="peer sr-only" />
                          </FormControl>
                          <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                             <span className="text-3xl mb-2">👓</span>
                             <span className="font-bold">I'm a Parent</span>
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="dino_fan_123" {...field} className="bg-slate-50 border-slate-200 focus:border-green-500 focus:ring-green-200" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isParent ? "Your Name" : "Nickname"}</FormLabel>
                      <FormControl>
                         <Input placeholder={isParent ? "Mom/Dad" : "T-Rex Tyler"} {...field} className="bg-slate-50 border-slate-200 focus:border-green-500 focus:ring-green-200" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {!isParent && (
                <FormField
                  control={form.control}
                  name="dinosaurColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pick your Dino color</FormLabel>
                      <FormControl>
                         <select 
                            {...field} 
                            className="w-full flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                         >
                            <option value="green">Forest Green</option>
                            <option value="blue">Ocean Blue</option>
                            <option value="orange">Volcano Orange</option>
                            <option value="purple">Royal Purple</option>
                         </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-200 hover:shadow-green-300 transition-all"
                disabled={isPending}
              >
                {isPending ? "Creating Profile..." : "Start Adventure!"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
