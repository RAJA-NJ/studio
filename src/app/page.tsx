"use client";

import { useState } from "react";
import { useAppStore, Role } from "@/app/lib/store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, ShieldCheck, Stethoscope, UserCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const { login } = useAppStore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [activeRole, setActiveRole] = useState<Role>("patient");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password, activeRole);
    if (success) {
      toast({ title: "Success", description: `Welcome back, ${username}!` });
      router.push(`/dashboard/${activeRole}`);
    } else {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Invalid credentials. Please try again." 
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Activity className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">IHSS</h1>
          <p className="text-muted-foreground">Comprehensive Medical Portal for Everyone</p>
        </div>

        <Card className="border-none shadow-2xl bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Select your role and enter credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="patient" className="w-full" onValueChange={(v) => setActiveRole(v as Role)}>
              <TabsList className="grid grid-cols-3 mb-8 bg-muted/50 p-1">
                <TabsTrigger value="patient" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">
                  <UserCircle className="h-4 w-4 mr-2" />
                  Patient
                </TabsTrigger>
                <TabsTrigger value="doctor" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">
                  <Stethoscope className="h-4 w-4 mr-2" />
                  Doctor
                </TabsTrigger>
                <TabsTrigger value="admin" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Admin
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    placeholder="Enter your ID" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    required 
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required
                    className="bg-background"
                  />
                </div>
                <Button type="submit" className="w-full h-11 text-lg font-medium bg-primary hover:bg-primary/90">
                  Login to Portal
                </Button>
              </form>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 text-center">
            <p className="text-xs text-muted-foreground px-4">
              Demo Credentials:<br/>
              Patient: pat_jane / patient | Doctor: dr_smith / doctor | Admin: admin / admin
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
