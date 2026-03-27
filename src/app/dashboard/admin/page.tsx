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
  AlertTriangle,
  Lock,
  User as UserIcon,
  Upload,
  ShieldCheck
} from "lucide-react";
import { useState, useRef } from "react";
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
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { 
    currentUser,
    users, 
    adminIssues, 
    createDoctor, 
    deleteDoctor, 
    resetDoctorPassword,
    updateProfile 
  } = useAppStore();
  const { toast } = useToast();

  const [docName, setDocName] = useState("");
  const [docUser, setDocUser] = useState("");
  const [docPass, setDocPass] = useState("");
  const [docSpec, setDocSpec] = useState("");

  // Management state
  const [resettingDoc, setResettingDoc] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [docToDelete, setDocToDelete] = useState<User | null>(null);

  // Admin Profile State
  const [currentPassword, setCurrentPassword] = useState("");
  const [adminNewPassword, setAdminNewPassword] = useState("");
  const profilePicInputRef = useRef<HTMLInputElement>(null);

  const doctors = users.filter(u => u.role === "doctor");
  const patientsCount = users.filter(u => u.role === "patient").length;

  const handleCreateDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    createDoctor({ name: docName, username: docUser, password: docPass, specialization: docSpec });
    setDocName(""); setDocUser(""); setDocPass(""); setDocSpec("");
    toast({ title: "Doctor Created", description: "Account is active immediately." });
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (resettingDoc && newPassword) {
      resetDoctorPassword(resettingDoc.id, newPassword);
      toast({ 
        title: "Password Updated", 
        description: `Credentials for ${resettingDoc.name} have been updated.` 
      });
      setResettingDoc(null);
      setNewPassword("");
    }
  };

  const confirmDeleteDoctor = () => {
    if (docToDelete) {
      deleteDoctor(docToDelete.id);
      toast({ 
        title: "Doctor Removed", 
        description: `${docToDelete.name}'s access has been revoked.` 
      });
      setDocToDelete(null);
    }
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfile({ photo: reader.result as string });
        toast({ title: "Profile Picture Updated" });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdminPasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (currentPassword !== currentUser.password) {
      toast({ 
        variant: "destructive", 
        title: "Update Failed", 
        description: "The current password you entered is incorrect." 
      });
      return;
    }

    updateProfile({ password: adminNewPassword });
    setCurrentPassword("");
    setAdminNewPassword("");
    toast({ title: "Security Updated", description: "Your admin password has been changed successfully." });
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
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="doctors">Doctor Management</TabsTrigger>
          <TabsTrigger value="issues">Issue Reports ({adminIssues.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="profile">Admin Profile</TabsTrigger>
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
                          <Button variant="outline" size="sm" onClick={() => setResettingDoc(doc)}>
                            <Key className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:bg-destructive/10" 
                            onClick={() => setDocToDelete(doc)}
                          >
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

        <TabsContent value="profile">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="md:col-span-1 h-fit">
              <CardHeader>
                <CardTitle className="text-lg">Identity</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-6">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center overflow-hidden border-4 border-card shadow-xl">
                    {currentUser?.photo ? (
                      <img src={currentUser.photo} className="w-full h-full object-cover" />
                    ) : (
                      <ShieldCheck className="h-16 w-16 text-primary/40" />
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={profilePicInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleProfilePicChange}
                  />
                  <button 
                    onClick={() => profilePicInputRef.current?.click()}
                    className="absolute bottom-1 right-1 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all scale-90 group-hover:scale-100"
                  >
                    <Upload className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-xl font-bold">{currentUser?.name}</h3>
                  <Badge variant="secondary" className="uppercase tracking-tighter">System Administrator</Badge>
                  <p className="text-xs text-muted-foreground pt-2">Admin ID: {currentUser?.username}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  Account Security
                </CardTitle>
                <CardDescription>Update your personal administrator credentials.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdminPasswordChange} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-pass">Current Password</Label>
                      <Input 
                        id="current-pass" 
                        type="password" 
                        placeholder="Confirm identity to change password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-new-pass">New Secure Password / Unique ID</Label>
                      <Input 
                        id="admin-new-pass" 
                        type="password" 
                        placeholder="Enter your new security code"
                        value={adminNewPassword}
                        onChange={(e) => setAdminNewPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full gap-2">
                    Update Security Credentials
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="border-t bg-muted/20 text-[10px] text-muted-foreground p-4">
                <AlertTriangle className="h-3 w-3 mr-2 inline" />
                Changing the admin password will affect all future logins for this session ID.
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Reset Doctor Password Dialog */}
      <Dialog open={!!resettingDoc} onOpenChange={(open) => !open && setResettingDoc(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Reset Doctor Password
            </DialogTitle>
            <DialogDescription>
              Assign a new temporary password for <strong>{resettingDoc?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Secure Password</Label>
              <Input 
                id="new-password" 
                type="password" 
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setResettingDoc(null)}>Cancel</Button>
              <Button type="submit">Update Credentials</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Doctor Confirmation Alert */}
      <AlertDialog open={!!docToDelete} onOpenChange={(open) => !open && setDocToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Doctor Access?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the account for <strong>{docToDelete?.name}</strong>. The doctor will no longer be able to access the portal. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteDoctor} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
