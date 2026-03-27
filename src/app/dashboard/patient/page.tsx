"use client";

import { useAppStore, Report } from "@/app/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Stethoscope, 
  MessageSquare, 
  FileText, 
  History, 
  User as UserIcon, 
  Upload, 
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  File as FileIcon,
  X,
  Edit,
  Trash2,
  Eye,
  AlertTriangle
} from "lucide-react";
import { ChatModule } from "@/components/dashboard/ChatModule";
import { useState, useRef, useMemo } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
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
import { cn } from "@/lib/utils";

export default function PatientDashboard() {
  const { 
    currentUser, 
    users, 
    appointments, 
    reports, 
    bookAppointment, 
    reportIssueToAdmin, 
    updateProfile,
    uploadFileForPatient,
    deleteReport,
    updateReport
  } = useAppStore();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [issue, setIssue] = useState("");
  const [apptDate, setApptDate] = useState("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Management State
  const [viewingReport, setViewingReport] = useState<Report | null>(null);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);

  const assignedDoctor = useMemo(() => users.find(u => u.id === currentUser?.doctorId), [users, currentUser]);
  const myAppointments = useMemo(() => appointments.filter(a => a.patientId === currentUser?.id), [appointments, currentUser]);
  const myReports = useMemo(() => reports.filter(r => r.patientId === currentUser?.id), [reports, currentUser]);
  
  const filteredDoctors = useMemo(() => users.filter(u => 
    u.role === "doctor" && 
    (u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     u.specialization?.toLowerCase().includes(searchQuery.toLowerCase()))
  ), [users, searchQuery]);

  const handleReportIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (issue.trim()) {
      reportIssueToAdmin(issue);
      setIssue("");
      toast({ title: "Report Sent", description: "The admin has received your report." });
    }
  };

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (assignedDoctor && apptDate) {
      bookAppointment(assignedDoctor.id, apptDate);
      setApptDate("");
      toast({ title: "Appointment Requested", description: "Waiting for doctor approval." });
    }
  };

  const handleEmergencyRequest = () => {
    if (assignedDoctor) {
      bookAppointment(assignedDoctor.id, new Date().toISOString(), true);
      toast({ 
        variant: "destructive",
        title: "Emergency Requested", 
        description: "Your doctor has been notified of this high-priority request." 
      });
    } else {
      toast({
        variant: "destructive",
        title: "No Doctor Connected",
        description: "Please connect with a doctor before requesting emergency attention."
      });
    }
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

  const handleUploadSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const type = formData.get('type') as 'scan' | 'prescription';
    
    if (title && type && currentUser) {
      uploadFileForPatient(currentUser.id, title, `https://picsum.photos/seed/${Date.now()}/800/1000`, type);
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      toast({ title: "Record Uploaded", description: "Your doctor can now view this record." });
    }
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingReport) return;
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const type = formData.get('type') as 'scan' | 'prescription';
    
    const newFileUrl = editSelectedFile ? `https://picsum.photos/seed/edit-${Date.now()}/800/1000` : editingReport.fileUrl;

    updateReport(editingReport.id, { title, type, fileUrl: newFileUrl });
    setEditingReport(null);
    setEditSelectedFile(null);
    toast({ title: "Record Updated", description: "The medical record has been updated." });
  };

  const confirmDeleteReport = () => {
    if (reportToDelete) {
      deleteReport(reportToDelete);
      setReportToDelete(null);
      setViewingReport(null);
      toast({ title: "Record Deleted", description: "The record has been permanently removed." });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {currentUser?.name}</h1>
          <p className="text-muted-foreground">Manage your health and connect with your doctor.</p>
        </div>
        {assignedDoctor && (
          <Badge variant="secondary" className="px-4 py-2 text-sm bg-primary/10 text-primary border-primary/20 flex items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            Connected to: {assignedDoctor.name} ({assignedDoctor.specialization})
          </Badge>
        )}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-6 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="appointment">Appointment</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="records">Records</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Next Appointment
                </CardTitle>
              </CardHeader>
              <CardContent>
                {myAppointments.length > 0 ? (
                  <div className="space-y-2">
                    <p className="font-semibold text-xl">{format(new Date(myAppointments[0].date), "MMM d, h:mm a")}</p>
                    <Badge className={myAppointments[0].status === "approved" ? "bg-green-500" : "bg-yellow-500"}>
                      {myAppointments[0].status.toUpperCase()}
                      {myAppointments[0].isEmergency && " (EMERGENCY)"}
                    </Badge>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No upcoming appointments</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-secondary" />
                  Recent Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{myReports.length}</p>
                  <p className="text-xs text-muted-foreground">Files in your medical history</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/20 bg-destructive/5 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Emergency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[10px] text-muted-foreground mb-3">Request immediate attention from your doctor.</p>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="w-full gap-2 font-bold"
                  onClick={handleEmergencyRequest}
                >
                  Priority Visit
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-5 w-5" />
                  Report Issue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleReportIssue} className="space-y-2">
                  <Input 
                    placeholder="Briefly describe..." 
                    value={issue} 
                    onChange={(e) => setIssue(e.target.value)}
                    className="h-8 text-[10px]"
                  />
                  <Button type="submit" size="sm" variant="outline" className="w-full text-[10px] h-7">Submit to Admin</Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {!assignedDoctor && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Find a Doctor
                </CardTitle>
                <CardDescription>Search for specialists to start your consultation journey</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input 
                  placeholder="Search by name or specialization..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredDoctors.map(doc => (
                    <div key={doc.id} className="p-4 bg-card rounded-lg border flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.specialization}</p>
                      </div>
                      <Button size="sm" onClick={() => {
                        updateProfile({ doctorId: doc.id });
                        toast({ title: "Connected", description: `You are now assigned to ${doc.name}` });
                      }}>
                        Connect
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="chat">
          <div className="max-w-2xl mx-auto">
            {assignedDoctor ? (
              <ChatModule otherUser={assignedDoctor} />
            ) : (
              <div className="text-center p-12 bg-muted/30 rounded-xl border-2 border-dashed">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No Doctor Connected</h3>
                <p className="text-muted-foreground">You must connect to a doctor before you can chat.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="appointment">
          <div className="max-w-xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Schedule Consultation</CardTitle>
                <CardDescription>Request a time slot with {assignedDoctor?.name || 'your doctor'}</CardDescription>
              </CardHeader>
              <CardContent>
                {assignedDoctor ? (
                  <form onSubmit={handleBook} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Preferred Date & Time</Label>
                      <Input 
                        id="date" 
                        type="datetime-local" 
                        value={apptDate}
                        onChange={(e) => setApptDate(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">Send Request</Button>
                  </form>
                ) : (
                  <p className="text-center text-muted-foreground py-8">Please connect to a doctor first.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Checkup History</CardTitle>
              <CardDescription>Past visits and medical notes from your doctor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myAppointments.filter(a => a.status === "visited").map(appt => (
                  <div key={appt.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-primary">{format(new Date(appt.date), "MMMM d, yyyy")}</h4>
                        {appt.isEmergency && <Badge variant="destructive" className="text-[8px] h-4">EMERGENCY</Badge>}
                      </div>
                      <Badge variant="outline">VISITED</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Consultation with {assignedDoctor?.name}</p>
                    {appt.notes && (
                      <div className="bg-muted p-3 rounded text-sm">
                        <p className="font-medium mb-1">Doctor's Notes:</p>
                        {appt.notes}
                      </div>
                    )}
                  </div>
                ))}
                {myAppointments.filter(a => a.status === "visited").length === 0 && (
                  <p className="text-center text-muted-foreground py-10 italic">No checkup history found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Medical Records</CardTitle>
                <CardDescription>View reports, scans, and prescriptions</CardDescription>
              </div>
              <Dialog open={isUploadDialogOpen} onOpenChange={(open) => {
                setIsUploadDialogOpen(open);
                if (!open) setSelectedFile(null);
              }}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Upload New
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Medical Record</DialogTitle>
                    <DialogDescription>Add a new scan report or prescription to your secure file.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleUploadSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Record Title</Label>
                      <Input id="title" name="title" placeholder="e.g. Chest X-Ray, Blood Test" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Record Type</Label>
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
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
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
                          <p className="text-[10px] text-muted-foreground">Click or drag to change file</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-xs text-muted-foreground">Click to browse or drag and drop file here</p>
                          <p className="text-[10px] text-muted-foreground mt-1">PDF, JPG, PNG (Max 10MB)</p>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground justify-center">
                      <AlertCircle className="h-3 w-3" />
                      Files are encrypted and stored securely.
                    </div>

                    <Button type="submit" className="w-full" disabled={!selectedFile}>
                      Upload to File
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myReports.map(report => (
                  <div key={report.id} className="p-4 border rounded-xl flex flex-col gap-3 group bg-card hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm line-clamp-1">{report.title}</p>
                        <p className="text-[10px] text-muted-foreground">{format(new Date(report.date), "MMMM do, yyyy")}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingReport(report)}>
                          <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 hover:text-destructive" 
                          onClick={() => setReportToDelete(report.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <Badge variant="secondary" className="w-fit text-[10px] uppercase tracking-wider">{report.type}</Badge>
                    <Button variant="outline" size="sm" className="w-full mt-2 gap-2" onClick={() => setViewingReport(report)}>
                      <Eye className="h-4 w-4" /> View File
                    </Button>
                  </div>
                ))}
                {myReports.length === 0 && (
                  <div className="col-span-full text-center py-20 text-muted-foreground border-2 border-dashed rounded-xl">
                    <p>No medical records uploaded yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>My Profile</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-4 border-card shadow-lg">
                    {currentUser?.photo ? (
                      <img src={currentUser.photo} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 p-1 bg-primary text-white rounded-full shadow-md">
                    <Upload className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold">{currentUser?.name}</h3>
                  <p className="text-sm text-muted-foreground">ID: {currentUser?.username}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input 
                    defaultValue={currentUser?.name} 
                    onBlur={(e) => updateProfile({ name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Username (Read-only)</Label>
                  <Input defaultValue={currentUser?.username} disabled />
                </div>
              </div>

              <Button onClick={() => toast({ title: "Profile Updated" })}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Report Dialog */}
      <Dialog open={!!viewingReport} onOpenChange={(open) => !open && setViewingReport(null)}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <div className="flex items-center justify-between pr-8">
              <div>
                <DialogTitle>{viewingReport?.title}</DialogTitle>
                <DialogDescription>
                  Record ID: {viewingReport?.id} | Date: {viewingReport && format(new Date(viewingReport.date), "PPP")}
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
          <div className="flex-1 bg-muted/5 p-4 flex items-center justify-center overflow-auto">
            {viewingReport && (
              <img 
                src={viewingReport.fileUrl} 
                alt="Medical Record Preview" 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border bg-white" 
              />
            )}
          </div>
          <DialogFooter className="p-4 bg-background border-t">
            <Button variant="outline" onClick={() => setViewingReport(null)}>Close Preview</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Report Dialog */}
      <Dialog open={!!editingReport} onOpenChange={(open) => {
        if (!open) {
          setEditingReport(null);
          setEditSelectedFile(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Medical Record</DialogTitle>
            <DialogDescription>Modify the details or change the attached file.</DialogDescription>
          </DialogHeader>
          {editingReport && (
            <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Record Title</Label>
                <Input id="edit-title" name="title" defaultValue={editingReport.title} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Record Type</Label>
                <Select name="type" defaultValue={editingReport.type} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scan">Scan / Imaging</SelectItem>
                    <SelectItem value="prescription">Prescription</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Medical Document</Label>
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
                      {editSelectedFile.name} (Replace)
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                      <p className="text-[10px] text-muted-foreground">Click to replace the current file</p>
                    </div>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full">Save Changes</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!reportToDelete} onOpenChange={(open) => !open && setReportToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the medical record from your secure health history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteReport} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Permanently Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
