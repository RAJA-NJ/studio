"use client";

import { useAppStore } from "@/app/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  PlusCircle, 
  ClipboardList, 
  MessageCircle, 
  Trash2, 
  ChevronRight, 
  FileText, 
  Sparkles,
  Search,
  CheckCircle,
  MoreVertical,
  Key,
  AlertCircle,
  Upload
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { ChatModule } from "@/components/dashboard/ChatModule";
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
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { doctorAidSuggestions } from "@/ai/flows/doctor-aid-suggestions";
import { cn } from "@/lib/utils";

export default function DoctorDashboard() {
  const { 
    currentUser, 
    users, 
    appointments, 
    reports,
    createPatient, 
    deletePatient, 
    approveAppointment, 
    markVisited,
    updatePatientPassword,
    updateProfile,
    uploadFileForPatient
  } = useAppStore();
  const { toast } = useToast();

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("patients");
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);
  
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientUser, setNewPatientUser] = useState("");
  const [newPatientPass, setNewPatientPass] = useState("");
  
  const [visitNotes, setVisitNotes] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{ suggestions: string, disclaimer: string } | null>(null);

  const myPatients = users.filter(u => u.role === "patient" && u.doctorId === currentUser?.id);
  const pendingAppointments = appointments.filter(a => a.doctorId === currentUser?.id && a.status === "pending");
  const selectedPatient = myPatients.find(p => p.id === selectedPatientId);
  const patientReports = reports.filter(r => r.patientId === selectedPatientId);
  
  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    createPatient({ 
      name: newPatientName, 
      username: newPatientUser, 
      password: newPatientPass 
    });
    setNewPatientName("");
    setNewPatientUser("");
    setNewPatientPass("");
    toast({ title: "Patient Created", description: "Login credentials generated successfully." });
  };

  const handleRecordUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const type = formData.get('type') as 'scan' | 'prescription';
    
    if (title && type && selectedPatientId) {
      uploadFileForPatient(selectedPatientId, title, 'https://example.com/report.pdf', type);
      setIsRecordDialogOpen(false);
      toast({ title: "Report Added", description: "Record has been successfully added to patient file." });
    }
  };

  const runAiAssistant = async (symptoms: string) => {
    if (!symptoms) return;
    setIsAiLoading(true);
    try {
      const res = await doctorAidSuggestions({ patientSymptoms: symptoms });
      setAiResult({ suggestions: res.preliminarySuggestions, disclaimer: res.disclaimer });
    } catch (err) {
      toast({ variant: "destructive", title: "AI Error", description: "Could not generate suggestions." });
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Doctor's Portal</h1>
          <p className="text-muted-foreground">{currentUser?.name} | {currentUser?.specialization}</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20 px-3 py-1">Online</Badge>
          <Badge variant="outline" className="px-3 py-1">{myPatients.length} Patients</Badge>
        </div>
      </div>

      <Tabs defaultValue="patients" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8">
          <TabsTrigger value="patients">Patient List</TabsTrigger>
          <TabsTrigger value="appointments">Appointments ({pendingAppointments.length})</TabsTrigger>
          <TabsTrigger value="ai-assistant" className="gap-2">
            <Sparkles className="h-4 w-4" /> AI Tool
          </TabsTrigger>
          <TabsTrigger value="chat">Messaging</TabsTrigger>
          <TabsTrigger value="profile">My Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="patients" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">My Patients</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  New Patient
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Patient Account</DialogTitle>
                  <DialogDescription>The patient will be automatically assigned to you.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreatePatient} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={newPatientName} onChange={(e) => setNewPatientName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Patient ID (Username)</Label>
                    <Input value={newPatientUser} onChange={(e) => setNewPatientUser(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Initial Password</Label>
                    <Input type="password" value={newPatientPass} onChange={(e) => setNewPatientPass(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full">Create and Secure</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-4">
              {myPatients.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-xl">
                  <p className="text-muted-foreground">No patients assigned yet.</p>
                </div>
              ) : (
                myPatients.map(p => (
                  <button 
                    key={p.id}
                    onClick={() => setSelectedPatientId(p.id)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group",
                      selectedPatientId === p.id ? "bg-primary/5 border-primary shadow-sm" : "bg-card hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{p.name}</p>
                        <p className="text-xs text-muted-foreground">ID: {p.username}</p>
                      </div>
                    </div>
                    <ChevronRight className={cn("h-4 w-4 transition-transform", selectedPatientId === p.id ? "rotate-90" : "group-hover:translate-x-1")} />
                  </button>
                ))
              )}
            </div>

            <div className="lg:col-span-2">
              {selectedPatient ? (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <Card className="border-none shadow-md overflow-hidden">
                    <CardHeader className="bg-primary/5 pb-6">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-2xl font-bold text-primary shadow-sm">
                            {selectedPatient.name.charAt(0)}
                          </div>
                          <div>
                            <CardTitle className="text-2xl">{selectedPatient.name}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              Patient ID: {selectedPatient.username}
                              <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground" />
                              <span className="text-green-600 flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Online Now</span>
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="gap-2" onClick={() => {
                            const newPass = prompt("Enter new password for patient:");
                            if (newPass) updatePatientPassword(selectedPatient.id, newPass);
                          }}>
                            <Key className="h-4 w-4" /> Reset Pwd
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => {
                            if (confirm("Are you sure you want to delete this patient?")) {
                              deletePatient(selectedPatient.id);
                              setSelectedPatientId(null);
                            }
                          }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <h3 className="font-semibold flex items-center gap-2">
                            <ClipboardList className="h-4 w-4 text-primary" />
                            Clinical Notes
                          </h3>
                          <Textarea 
                            placeholder="Add consultation notes, diagnosis, or instructions..." 
                            className="min-h-[150px]"
                            value={visitNotes}
                            onChange={(e) => setVisitNotes(e.target.value)}
                          />
                          <Button 
                            className="w-full" 
                            disabled={!visitNotes.trim()}
                            onClick={() => {
                              const lastAppt = appointments.find(a => a.patientId === selectedPatient.id && a.status === "approved");
                              if (lastAppt) {
                                markVisited(lastAppt.id, visitNotes);
                                setVisitNotes("");
                                toast({ title: "Visit Logged", description: "Checkup history updated." });
                              } else {
                                toast({ variant: "destructive", title: "Error", description: "No approved appointment found to log visit." });
                              }
                            }}
                          >
                            Mark as Visited & Log Note
                          </Button>
                        </div>
                        <div className="space-y-4">
                          <h3 className="font-semibold flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            Recent Reports
                          </h3>
                          <div className="space-y-2 max-h-[250px] overflow-y-auto">
                            {patientReports.map(report => (
                              <div key={report.id} className="p-3 bg-muted/30 rounded-lg text-sm flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <div className="flex flex-col">
                                    <span className="font-medium">{report.title}</span>
                                    <span className="text-[10px] text-muted-foreground">{format(new Date(report.date), "MMM d, yyyy")}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-[8px] h-4">{report.type}</Badge>
                                  <Button variant="ghost" size="sm">View</Button>
                                </div>
                              </div>
                            ))}
                            {patientReports.length === 0 && (
                              <p className="text-xs text-center text-muted-foreground py-8 italic">No records uploaded yet.</p>
                            )}
                          </div>
                          
                          <Dialog open={isRecordDialogOpen} onOpenChange={setIsRecordDialogOpen}>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="w-full gap-2 border-dashed">
                                <PlusCircle className="h-4 w-4" /> Upload New Record
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add Record for {selectedPatient.name}</DialogTitle>
                                <DialogDescription>Attach a diagnostic scan or a new prescription to the patient profile.</DialogDescription>
                              </DialogHeader>
                              <form onSubmit={handleRecordUpload} className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="title">Record Title</Label>
                                  <Input id="title" name="title" placeholder="e.g. Chest X-Ray" required />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="type">Type</Label>
                                  <Select name="type" defaultValue="scan" required>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="scan">Scan / Imaging</SelectItem>
                                      <SelectItem value="prescription">Prescription</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button type="submit" className="w-full">Save to Patient Profile</Button>
                              </form>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-12 bg-muted/20 border-2 border-dashed rounded-xl">
                  <Users className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-xl font-medium text-muted-foreground">Select a patient to view details</h3>
                  <p className="text-sm text-muted-foreground">Click on a patient from the list on the left.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Requests</CardTitle>
              <CardDescription>Review and approve pending patient consultations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingAppointments.map(appt => {
                  const patient = users.find(u => u.id === appt.patientId);
                  return (
                    <div key={appt.id} className="flex items-center justify-between p-4 border rounded-xl bg-card shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {patient?.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold">{patient?.name}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(appt.date), "MMMM d, yyyy 'at' h:mm a")}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => approveAppointment(appt.id)}>
                          Approve
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                          Deny
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {pendingAppointments.length === 0 && (
                  <div className="text-center py-20 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No pending requests.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-assistant">
          <Card className="border-primary/20 shadow-xl shadow-primary/5">
            <CardHeader className="bg-primary/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary rounded-lg text-primary-foreground">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>Doctor AI Assistant</CardTitle>
                  <CardDescription>Get preliminary suggestions based on patient symptoms</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="space-y-4">
                <Label className="text-lg">Enter Patient Symptoms / History</Label>
                <Textarea 
                  placeholder="e.g. Patient reports sharp pain in lower abdomen, nausea for 48 hours..."
                  className="min-h-[150px] text-lg"
                  id="symptom-input"
                />
                <Button 
                  className="w-full h-12 text-lg gap-2 shadow-lg hover:shadow-primary/20 transition-all"
                  onClick={() => {
                    const val = (document.getElementById('symptom-input') as HTMLTextAreaElement).value;
                    runAiAssistant(val);
                  }}
                  disabled={isAiLoading}
                >
                  {isAiLoading ? "Consulting AI Intelligence..." : "Generate AI Suggestions"}
                  {!isAiLoading && <Sparkles className="h-4 w-4" />}
                </Button>
              </div>

              {aiResult && (
                <div className="mt-8 space-y-4 animate-in slide-in-from-bottom-4">
                  <div className="p-6 bg-muted/50 rounded-2xl border border-primary/20">
                    <h3 className="text-xl font-bold mb-4 text-primary">Preliminary AI Analysis</h3>
                    <div className="prose prose-sm max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
                      {aiResult.suggestions}
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex gap-3 text-yellow-700 dark:text-yellow-500 text-xs italic">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <p>{aiResult.disclaimer}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="md:col-span-1 border rounded-xl overflow-hidden bg-card">
                <div className="p-4 border-b bg-muted/20">
                  <h3 className="font-semibold">Recent Conversations</h3>
                </div>
                <div className="divide-y max-h-[600px] overflow-y-auto">
                   {myPatients.map(p => (
                     <button 
                        key={p.id}
                        onClick={() => setSelectedPatientId(p.id)}
                        className={cn(
                          "w-full p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors",
                          selectedPatientId === p.id && "bg-primary/5"
                        )}
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {p.name.charAt(0)}
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-sm">{p.name}</p>
                          <p className="text-xs text-muted-foreground truncate w-40">Click to chat...</p>
                        </div>
                      </button>
                   ))}
                </div>
             </div>
             <div className="md:col-span-2">
                {selectedPatient ? (
                  <ChatModule otherUser={selectedPatient} />
                ) : (
                  <div className="h-[500px] flex items-center justify-center bg-muted/10 border-2 border-dashed rounded-xl">
                    <p className="text-muted-foreground">Select a patient to start chatting</p>
                  </div>
                )}
             </div>
          </div>
        </TabsContent>

        <TabsContent value="profile">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Professional Profile</CardTitle>
              <CardDescription>Manage your practice details and account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input defaultValue={currentUser?.name} onBlur={(e) => updateProfile({ name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Specialization</Label>
                    <Input defaultValue={currentUser?.specialization} onBlur={(e) => updateProfile({ specialization: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Doctor ID (Username)</Label>
                    <Input defaultValue={currentUser?.username} disabled />
                  </div>
               </div>
               <Button onClick={() => toast({ title: "Profile Saved" })}>Update Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
