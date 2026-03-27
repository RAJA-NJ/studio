"use client";

import { useState, useEffect } from "react";

export type Role = "admin" | "doctor" | "patient";

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
  photo?: string;
  specialization?: string;
  doctorId?: string; // For patients
  password?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  status: "pending" | "approved" | "visited";
  notes?: string;
}

export interface Report {
  id: string;
  patientId: string;
  doctorId: string;
  title: string;
  fileUrl: string;
  date: string;
  type: "scan" | "prescription";
}

export interface AdminIssue {
  id: string;
  patientId: string;
  description: string;
  date: string;
}

export interface Message {
  id: string;
  fromId: string;
  toId: string;
  text: string;
  timestamp: string;
}

// Mock initial data
const INITIAL_USERS: User[] = [
  { id: "u-1", username: "admin", name: "System Admin", role: "admin", password: "admin" },
  { id: "u-2", username: "dr_smith", name: "Dr. Smith", role: "doctor", specialization: "Cardiology", password: "doctor" },
  { id: "u-3", username: "pat_jane", name: "Jane Doe", role: "patient", doctorId: "u-2", password: "patient" },
];

export function useAppStore() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [adminIssues, setAdminIssues] = useState<AdminIssue[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUsers = localStorage.getItem("hlink_users");
    const savedAppointments = localStorage.getItem("hlink_appointments");
    const savedReports = localStorage.getItem("hlink_reports");
    const savedIssues = localStorage.getItem("hlink_issues");
    const savedMessages = localStorage.getItem("hlink_messages");
    const savedSession = localStorage.getItem("hlink_session");

    setUsers(savedUsers ? JSON.parse(savedUsers) : INITIAL_USERS);
    setAppointments(savedAppointments ? JSON.parse(savedAppointments) : []);
    setReports(savedReports ? JSON.parse(savedReports) : []);
    setAdminIssues(savedIssues ? JSON.parse(savedIssues) : []);
    setMessages(savedMessages ? JSON.parse(savedMessages) : []);
    setCurrentUser(savedSession ? JSON.parse(savedSession) : null);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("hlink_users", JSON.stringify(users));
    localStorage.setItem("hlink_appointments", JSON.stringify(appointments));
    localStorage.setItem("hlink_reports", JSON.stringify(reports));
    localStorage.setItem("hlink_issues", JSON.stringify(adminIssues));
    localStorage.setItem("hlink_messages", JSON.stringify(messages));
    if (currentUser) {
      localStorage.setItem("hlink_session", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("hlink_session");
    }
  }, [users, appointments, reports, adminIssues, messages, currentUser, isLoaded]);

  const login = (username: string, password: string, role: Role) => {
    const user = users.find(u => u.username === username && u.password === password && u.role === role);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("hlink_session");
  };

  const updateProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    const updatedUsers = users.map(u => u.id === currentUser.id ? { ...u, ...data } : u);
    setUsers(updatedUsers);
    setCurrentUser({ ...currentUser, ...data });
  };

  // Admin Actions
  const createDoctor = (doc: Omit<User, "id" | "role">) => {
    const newUser: User = { ...doc, id: `u-${Date.now()}`, role: "doctor" };
    setUsers([...users, newUser]);
  };

  const deleteDoctor = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const resetDoctorPassword = (id: string, newPass: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, password: newPass } : u));
  };

  // Doctor Actions
  const createPatient = (pat: Omit<User, "id" | "role" | "doctorId">) => {
    if (!currentUser || currentUser.role !== "doctor") return;
    const newUser: User = { ...pat, id: `u-${Date.now()}`, role: "patient", doctorId: currentUser.id };
    setUsers([...users, newUser]);
  };

  const deletePatient = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const updatePatientPassword = (id: string, newPass: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, password: newPass } : u));
  };

  const approveAppointment = (id: string) => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, status: "approved" } : a));
  };

  const markVisited = (id: string, notes: string) => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, status: "visited", notes } : a));
  };

  const uploadFileForPatient = (patientId: string, title: string, fileUrl: string, type: "scan" | "prescription") => {
    if (!currentUser) return;
    const newReport: Report = {
      id: `r-${Date.now()}`,
      patientId,
      doctorId: currentUser.id,
      title,
      fileUrl,
      date: new Date().toISOString(),
      type
    };
    setReports([...reports, newReport]);
  };

  // Patient Actions
  const bookAppointment = (doctorId: string, date: string) => {
    if (!currentUser) return;
    const newAppt: Appointment = {
      id: `a-${Date.now()}`,
      patientId: currentUser.id,
      doctorId,
      date,
      status: "pending"
    };
    setAppointments([...appointments, newAppt]);
  };

  const reportIssueToAdmin = (description: string) => {
    if (!currentUser) return;
    const newIssue: AdminIssue = {
      id: `i-${Date.now()}`,
      patientId: currentUser.id,
      description,
      date: new Date().toISOString()
    };
    setAdminIssues([...adminIssues, newIssue]);
  };

  const sendMessage = (toId: string, text: string) => {
    if (!currentUser) return;
    const newMessage: Message = {
      id: `m-${Date.now()}`,
      fromId: currentUser.id,
      toId,
      text,
      timestamp: new Date().toISOString()
    };
    setMessages([...messages, newMessage]);
  };

  return {
    isLoaded,
    users,
    appointments,
    reports,
    adminIssues,
    messages,
    currentUser,
    login,
    logout,
    updateProfile,
    createDoctor,
    deleteDoctor,
    resetDoctorPassword,
    createPatient,
    deletePatient,
    updatePatientPassword,
    approveAppointment,
    markVisited,
    uploadFileForPatient,
    bookAppointment,
    reportIssueToAdmin,
    sendMessage
  };
}
