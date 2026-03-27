"use client";

import { useAppStore, User } from "@/app/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ShieldAlert, 
  UserPlus, 
  Users, 
  Key, 
  Trash2, 
  BarChart3, 
  Activity, 
  Search,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { 
    users, 
    adminIssues, 
    createDoctor, 
    deleteDoctor, 
    resetDoctorPassword 
  } = useAppStore();
  const { toast } = useToast();

  const [docName, setDocName] = useState("");
  const [docUser, setDocUser] = useState("");
  const [docPass, setDocPass] = useState("");
  const [docSpec, setDocSpec] = useState("");

  const doctors = users.filter(u => u.role === "doctor");
  const patientsCount = users.filter(u => u.role === "patient").length;

  const handleCreateDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    createDoctor({ name: docName, username: docUser, password: docPass, specialization: docSpec });
    setDocName(""); setDocUser(""); setDocPass(""); setDocSpec("");
    toast({ title: "Doctor Created", description: "Account is active immediately." });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Administrative Control</h1>
        <p className="text-muted-foreground">Manage system health, users, and reports.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{doctors.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patientsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminIssues.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="bg-green-500">OPERATIONAL</Badge>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="doctors" className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="doctors">Doctor Management</TabsTrigger>
          <TabsTrigger value="issues">Issue Reports ({adminIssues.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="doctors" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Registered Doctors</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add New Doctor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Register Professional</DialogTitle>
                  <DialogDescription>Create a secure account for a new medical doctor.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateDoctor} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input value={docName} onChange={(e) => setDocName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Specialization</Label>
                      <Input value={docSpec} onChange={(e) => setDocSpec(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Username (Doctor ID)</Label>
                    <Input value={docUser} onChange={(e) => setDocUser(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Secure Password</Label>
                    <Input type="password" value={docPass} onChange={(e) => setDocPass(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full">Provision Account</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-medium">Doctor Name</th>
                      <th className="text-left p-4 font-medium">Specialization</th>
                      <th className="text-left p-4 font-medium">Username</th>
                      <th className="text-right p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {doctors.map(doc => (
                      <tr key={doc.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-4 font-medium">{doc.name}</td>
                        <td className="p-4">{doc.specialization}</td>
                        <td className="p-4 text-muted-foreground">{doc.username}</td>
                        <td className="p-4 text-right space-x-2">
                          <Button variant="outline" size="sm" onClick={() => {
                            const newPass = prompt("Enter new password for doctor:");
                            if (newPass) resetDoctorPassword(doc.id, newPass);
                          }}>
                            <Key className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => deleteDoctor(doc.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues">
          <div className="space-y-4">
            {adminIssues.map(issue => {
              const patient = users.find(u => u.id === issue.patientId);
              return (
                <Card key={issue.id} className="border-l-4 border-l-destructive">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">NEW ISSUE</Badge>
                        <span className="text-xs text-muted-foreground">{format(new Date(issue.date), "PPP p")}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-green-600 hover:text-green-700">
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Resolved
                      </Button>
                    </div>
                    <CardTitle className="text-lg mt-2">From: {patient?.name} (ID: {patient?.username})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm bg-muted/30 p-4 rounded-lg italic">"{issue.description}"</p>
                  </CardContent>
                </Card>
              );
            })}
            {adminIssues.length === 0 && (
              <div className="text-center py-20 text-muted-foreground bg-card border rounded-xl">
                <ShieldAlert className="h-12 w-12 mx-auto mb-4 opacity-10" />
                <p>No reported issues at this time.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  System Usage (Weekly)
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] flex items-end gap-4 p-8">
                {[45, 60, 40, 80, 55, 70, 90].map((h, i) => (
                  <div key={i} className="flex-1 bg-primary/20 rounded-t-md hover:bg-primary/40 transition-all cursor-pointer relative group" style={{ height: `${h}%` }}>
                    <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-white text-[10px] px-2 py-1 rounded">
                      {h}%
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="justify-center border-t text-xs text-muted-foreground pt-4">
                Active logins per day
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-secondary" />
                  Real-time Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { user: "Dr. Smith", action: "Approved Appointment", time: "2m ago" },
                  { user: "Jane Doe", action: "Uploaded Scan Report", time: "5m ago" },
                  { user: "Admin", action: "Reset Doctor Password", time: "15m ago" },
                  { user: "Mark Lee", action: "New Account Created", time: "1h ago" }
                ].map((act, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                    <div className="flex flex-col">
                      <span className="font-semibold">{act.user}</span>
                      <span className="text-xs text-muted-foreground">{act.action}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{act.time}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
