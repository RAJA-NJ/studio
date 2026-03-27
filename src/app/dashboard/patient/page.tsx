"use client";

import { useAppStore, User } from "@/app/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  AlertCircle
} from "lucide-react";
import { ChatModule } from "@/components/dashboard/ChatModule";
import { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function PatientDashboard() {
  const { 
    currentUser, 
    users, 
    appointments, 
    reports, 
    bookAppointment, 
    reportIssueToAdmin, 
    updateProfile 
  } = useAppStore();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [issue, setIssue] = useState("");
  const [apptDate, setApptDate] = useState("");

  const assignedDoctor = users.find(u => u.id === currentUser?.doctorId);
  const myAppointments = appointments.filter(a => a.patientId === currentUser?.id);
  const myReports = reports.filter(r => r.patientId === currentUser?.id);
  
  const filteredDoctors = users.filter(u => 
    u.role === "doctor" && 
    (u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     u.specialization?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  <p className="text-xs text-muted-foreground">Files uploaded to your file</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  Report Issue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleReportIssue} className="space-y-2">
                  <Input 
                    placeholder="Briefly describe the issue..." 
                    value={issue} 
                    onChange={(e) => setIssue(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Button type="submit" size="sm" variant="destructive" className="w-full">Submit</Button>
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
                      <h4 className="font-semibold text-primary">{format(new Date(appt.date), "MMMM d, yyyy")}</h4>
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
              <Button size="sm" className="gap-2">
                <Upload className="h-4 w-4" />
                Upload New
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myReports.map(report => (
                  <div key={report.id} className="p-4 border rounded-lg flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm line-clamp-1">{report.title}</p>
                        <p className="text-[10px] text-muted-foreground">{format(new Date(report.date), "PPP")}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="w-fit text-[10px]">{report.type.toUpperCase()}</Badge>
                    <Button variant="outline" size="sm" className="w-full mt-2">View File</Button>
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
    </div>
  );
}
