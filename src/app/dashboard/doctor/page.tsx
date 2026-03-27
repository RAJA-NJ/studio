"use client";

import { useAppStore, Report } from "@/app/lib/store";
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
  ChevronDown, 
  FileText, 
  Sparkles,
  Search,
  CheckCircle,
  MoreVertical,
  Key,
  AlertCircle,
  Upload,
  Eye,
  Edit,
  File as FileIcon,
  AlertTriangle,
  User as UserIcon,
  X
} from "lucide-react";
import { useState, useRef, useMemo } from "react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
    uploadFileForPatient,
    deleteReport,
    updateReport
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

  // Management State for Reports
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const profilePicInputRef = useRef<HTMLInputElement>(null);

  const [viewingReport, setViewingReport] = useState<Report | null>(null);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);

  const myPatients = useMemo(() => users.filter(u => u.role === "patient" && u.doctorId === currentUser?.id), [users, currentUser]);
  
  const emergencyAppointments = useMemo(() => appointments.filter(a => 
    a.doctorId === currentUser?.id && a.status === "pending" && a.isEmergency
  ), [appointments, currentUser]);

  const regularAppointments = useMemo(() => appointments.filter(a => 
    a.doctorId === currentUser?.id && a.status === "pending" && !a.isEmergency
  ), [appointments, currentUser]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEditSelectedFile(e.target.files[0]);
    }
  };

  const handleRecordUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const type = formData.get('type') as 'scan' | 'prescription';
    
    if (title && type && selectedPatientId && selectedFile) {
      // In a real app we'd upload the file to a storage bucket
      // Here we simulate with a themed placeholder
      const simulatedUrl = `https://picsum.photos/seed/${selectedFile.name}-${Date.now()}/800/1000`;
      uploadFileForPatient(selectedPatientId, title, simulatedUrl, type);
      setIsRecordDialogOpen(false);
      setSelectedFile(null);
      toast({ title: "Report Added", description: "Record has been successfully added to patient file." });
    }
  };

  const handleEditReport = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingReport) return;
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const type = formData.get('type') as 'scan' | 'prescription';
    
    const newFileUrl = editSelectedFile 
      ? `https://picsum.photos/seed/edit-doc-${editSelectedFile.name}-${Date.now()}/800/1000` 
      : editingReport.fileUrl;

    updateReport(editingReport.id, { title, type, fileUrl: newFileUrl });
    setEditingReport(null);
    setEditSelectedFile(null);
    toast({ title: "Record Updated", description: "The record has been updated." });
  };

  const confirmDeleteReport = () => {
    if (reportToDelete) {
      deleteReport(reportToDelete);
      setReportToDelete(null);
      setViewingReport(null);
      toast({ title: "Record Deleted", description: "Removed from patient history." });
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
          {emergencyAppointments.length > 0 && (
            <Badge variant="destructive" className="animate-pulse gap-1">
              <AlertTriangle className="h-3 w-3" /> {emergencyAppointments.length} Emergency
            </Badge>
          )}
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20 px-3 py-1">Online</Badge>
          <Badge variant="outline" className="px-3 py-1">{myPatients.length} Patients</Badge>
        </div>
      </div>

      <Tabs defaultValue="patients" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8">
          <TabsTrigger value="patients">Patient List</TabsTrigger>
          <TabsTrigger value="appointments" className="relative">
            Appointments
            {(emergencyAppointments.length + regularAppointments.length) > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                {emergencyAppointments.length + regularAppointments.length}
              </span>
            )}
          </TabsTrigger>
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

          <div className="space-y-4">
            {myPatients.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed rounded-xl">
                <p className="text-muted-foreground">No patients assigned yet.</p>
              </div>
            ) : (
              myPatients.map(p => {
                const isExpanded = selectedPatientId === p.id;
                const patientReports = reports.filter(r => r.patientId === p.id);

                return (
                  <div key={p.id} className="space-y-2">
                    <button 
                      onClick={() => setSelectedPatientId(isExpanded ? null : p.id)}
                      className={cn(
                        "w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group",
                        isExpanded ? "bg-primary/5 border-primary shadow-sm" : "bg-card hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{p.name}</p>
                          <p className="text-xs text-muted-foreground">ID: {p.username}</p>
                        </div>
                      </div>
                      <ChevronDown className={cn("h-5 w-5 transition-transform duration-300", isExpanded ? "rotate-180" : "")} />
                    </button>

                    {isExpanded && (
                      <div className="animate-in slide-in-from-top-2 duration-300">
                        <Card className="border-none shadow-md overflow-hidden">
                          <CardHeader className="bg-primary/5 pb-6">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-2xl font-bold text-primary shadow-sm">
                                  {p.name.charAt(0)}
                                </div>
                                <div>
                                  <CardTitle className="text-2xl">{p.name}</CardTitle>
                                  <CardDescription className="flex items-center gap-2">
                                    Patient ID: {p.username}
                                    <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground" />
                                    <span className="text-green-600 flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Online</span>
                                  </CardDescription>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="gap-2" onClick={() => {
                                  const newPass = prompt("Enter new password for patient:");
                                  if (newPass) updatePatientPassword(p.id, newPass);
                                }}>
                                  <Key className="h-4 w-4" /> Reset Pwd
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => {
                                  if (confirm("Are you sure you want to delete this patient?")) {
                                    deletePatient(p.id);
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
                                    const lastAppt = appointments.find(a => a.patientId === p.id && a.status === "approved");
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
                                  Patient File
                                </h3>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                  {patientReports.map(report => (
                                    <div key={report.id} className="p-3 bg-muted/30 rounded-xl text-sm flex items-center justify-between group/report border border-transparent hover:border-primary/20 hover:bg-white transition-all">
                                      <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-white rounded shadow-sm">
                                          <FileText className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="font-medium line-clamp-1">{report.title}</span>
                                          <span className="text-[10px] text-muted-foreground">{format(new Date(report.date), "MMM d, yyyy")}</span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1 opacity-0 group-hover/report:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewingReport(report)}>
                                          <Eye className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingReport(report)}>
                                          <Edit className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => setReportToDelete(report.id)}>
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                  {patientReports.length === 0 && (
                                    <p className="text-xs text-center text-muted-foreground py-8 italic">No records in file.</p>
                                  )}
                                </div>
                                
                                <Dialog open={isRecordDialogOpen} onOpenChange={setIsRecordDialogOpen}>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" className="w-full gap-2 border-dashed">
                                      <PlusCircle className="h-4 w-4" /> Add Record to File
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Add Record for {p.name}</DialogTitle>
                                      <DialogDescription>Attach a diagnostic scan or a new prescription.</DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleRecordUpload} className="space-y-4 py-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="title">Record Title</Label>
                                        <Input id="title" name="title" placeholder="e.g. Lab Results 04/24" required />
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

                                      <div 
                                        className={cn(
                                          "p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors",
                                          selectedFile ? "bg-primary/5 border-primary/50" : "bg-muted/20 hover:bg-muted/30 border-muted-foreground/20"
                                        )}
                                        onClick={() => fileInputRef.current?.click()}
                                      >
                                        <input 
                                          type="file" 
                                          ref={fileInputRef} 
                                          className="hidden" 
                                          onChange={handleFileChange}
                                          accept=".pdf,.jpg,.jpeg,.png"
                                        />
                                        {selectedFile ? (
                                          <div className="flex flex-col items-center gap-2">
                                            <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border">
                                              <FileIcon className="h-4 w-4 text-primary" />
                                              <span className="text-xs font-medium truncate max-w-[200px]">{selectedFile.name}</span>
                                              <button 
                                                type="button" 
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setSelectedFile(null);
                                                }}
                                                className="text-muted-foreground hover:text-destructive"
                                              >
                                                <X className="h-3 w-3" />
                                              </button>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground">Click to change file</p>
                                          </div>
                                        ) : (
                                          <>
                                            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                            <p className="text-xs text-muted-foreground">Click to browse or upload file</p>
                                            <p className="text-[10px] text-muted-foreground mt-1">PDF, JPG, PNG (Max 10MB)</p>
                                          </>
                                        )}
                                      </div>

                                      <Button type="submit" className="w-full" disabled={!selectedFile}>Save to Patient Profile</Button>
                                    </form>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="appointments">
          <div className="space-y-8">
            {emergencyAppointments.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  <h3 className="text-lg font-bold tracking-tight">HIGH PRIORITY EMERGENCY REQUESTS</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {emergencyAppointments.map(appt => {
                    const patient = users.find(u => u.id === appt.patientId);
                    return (
                      <div key={appt.id} className="flex items-center justify-between p-4 border-2 border-destructive bg-destructive/5 rounded-xl shadow-md animate-pulse">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center font-bold text-destructive">
                            {patient?.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-destructive">{patient?.name}</p>
                            <p className="text-xs font-medium text-destructive/70">REQUESTED: {format(new Date(appt.date), "h:mm a")}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="destructive" onClick={() => approveAppointment(appt.id)}>
                            Prioritize
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Appointment Requests</CardTitle>
                <CardDescription>Review and approve pending patient consultations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {regularAppointments.map(appt => {
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
                  {regularAppointments.length === 0 && emergencyAppointments.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>No pending requests.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
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
                {selectedPatientId ? (
                  <ChatModule otherUser={users.find(u => u.id === selectedPatientId)} />
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
               <div className="flex items-center gap-6 mb-4">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-4 border-card shadow-lg">
                      {currentUser?.photo ? (
                        <img src={currentUser.photo} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="h-12 w-12 text-muted-foreground" />
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
                      className="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full shadow-md hover:bg-primary/90 transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold">{currentUser?.name}</h3>
                    <p className="text-sm text-muted-foreground">{currentUser?.specialization}</p>
                  </div>
               </div>

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

      {/* View Record Dialog */}
      <Dialog open={!!viewingReport} onOpenChange={(open) => !open && setViewingReport(null)}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <div className="flex items-center justify-between pr-8">
              <div>
                <DialogTitle>{viewingReport?.title}</DialogTitle>
                <DialogDescription>
                  Record Date: {viewingReport && format(new Date(viewingReport.date), "PPP")}
                </DialogDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-destructive hover:bg-destructive/10"
                onClick={() => setReportToDelete(viewingReport?.id || null)}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete Record
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 bg-muted/10 flex items-center justify-center overflow-auto p-4">
             {viewingReport && (
               <img 
                 src={viewingReport.fileUrl} 
                 alt="Report File" 
                 className="max-h-full max-w-full object-contain rounded-lg shadow-2xl bg-white border" 
               />
             )}
          </div>
          <DialogFooter className="p-4 bg-background border-t">
            <Button variant="outline" onClick={() => setViewingReport(null)}>Close Preview</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Record Dialog */}
      <Dialog open={!!editingReport} onOpenChange={(open) => {
        if (!open) {
          setEditingReport(null);
          setEditSelectedFile(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Patient Record</DialogTitle>
            <DialogDescription>Update metadata or change the diagnostic file for this record.</DialogDescription>
          </DialogHeader>
          {editingReport && (
            <form onSubmit={handleEditReport} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Record Title</Label>
                <Input name="title" defaultValue={editingReport.title} required />
              </div>
              <div className="space-y-2">
                <Label>Classification</Label>
                <Select name="type" defaultValue={editingReport.type} required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scan">Scan / Imaging</SelectItem>
                    <SelectItem value="prescription">Prescription</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Replace Document Image</Label>
                <div 
                  className="p-4 border-2 border-dashed rounded-lg text-center cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => editFileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={editFileInputRef} 
                    className="hidden" 
                    onChange={handleEditFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  {editSelectedFile ? (
                    <div className="flex items-center justify-center gap-2 text-primary text-xs font-medium">
                      <FileIcon className="h-4 w-4" />
                      {editSelectedFile.name}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                      <p className="text-[10px] text-muted-foreground">Click to upload new scan/document</p>
                    </div>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full">Update Record</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!reportToDelete} onOpenChange={(open) => !open && setReportToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this medical record? This action cannot be undone and the record will be removed from the patient's history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteReport} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
