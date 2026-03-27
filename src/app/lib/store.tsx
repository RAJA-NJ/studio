"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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

const INITIAL_USERS: User[] = [
  { id: "u-1", username: "admin", name: "System Admin", role: "admin", password: "admin" },
  { id: "u-2", username: "dr_smith", name: "Dr. Smith", role: "doctor", specialization: "Cardiology", password: "doctor" },
  { id: "u-3", username: "pat_jane", name: "Jane Doe", role: "patient", doctorId: "u-2", password: "patient" },
];

interface AppStoreContextType {
  isLoaded: boolean;
  users: User[];
  appointments: Appointment[];
  reports: Report[];
  adminIssues: AdminIssue[];
  messages: Message[];
  currentUser: User | null;
  login: (username: string, password: string, role: Role) => boolean;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  createDoctor: (doc: Omit<User, "id" | "role">) => void;
  deleteDoctor: (id: string) => void;
  resetDoctorPassword: (id: string, newPass: string) => void;
  createPatient: (pat: Omit<User, "id" | "role" | "doctorId">) => void;
  deletePatient: (id: string) => void;
  updatePatientPassword: (id: string, newPass: string) => void;
  approveAppointment: (id: string) => void;
  markVisited: (id: string, notes: string) => void;
  uploadFileForPatient: (patientId: string, title: string, fileUrl: string, type: "scan" | "prescription") => void;
  deleteReport: (id: string) => void;
  updateReport: (id: string, data: Partial<Report>) => void;
  bookAppointment: (doctorId: string, date: string) => void;
  reportIssueToAdmin: (description: string) => void;
  sendMessage: (toId: string, text: string) => void;
}

const AppStoreContext = createContext<AppStoreContextType | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
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

    if (savedUsers) setUsers(JSON.parse(savedUsers));
    if (savedAppointments) setAppointments(JSON.parse(savedAppointments));
    if (savedReports) setReports(JSON.parse(savedReports));
    if (savedIssues) setAdminIssues(JSON.parse(savedIssues));
    if (savedMessages) setMessages(JSON.parse(savedMessages));
    if (savedSession) setCurrentUser(JSON.parse(savedSession));
    
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
  };

  const updateProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...data } : u));
    setCurrentUser(prev => prev ? { ...prev, ...data } : null);
  };

  const createDoctor = (doc: Omit<User, "id" | "role">) => {
    const newUser: User = { ...doc, id: `u-${Date.now()}`, role: "doctor" };
    setUsers(prev => [...prev, newUser]);
  };

  const deleteDoctor = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const resetDoctorPassword = (id: string, newPass: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, password: newPass } : u));
  };

  const createPatient = (pat: Omit<User, "id" | "role" | "doctorId">) => {
    if (!currentUser || currentUser.role !== "doctor") return;
    const newUser: User = { ...pat, id: `u-${Date.now()}`, role: "patient", doctorId: currentUser.id };
    setUsers(prev => [...prev, newUser]);
  };

  const deletePatient = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const updatePatientPassword = (id: string, newPass: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, password: newPass } : u));
  };

  const approveAppointment = (id: string) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "approved" } : a));
  };

  const markVisited = (id: string, notes: string) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "visited", notes } : a));
  };

  const uploadFileForPatient = (patientId: string, title: string, fileUrl: string, type: "scan" | "prescription") => {
    if (!currentUser) return;
    
    let doctorId = '';
    if (currentUser.role === 'doctor') {
      doctorId = currentUser.id;
    } else if (currentUser.role === 'patient') {
      doctorId = currentUser.doctorId || '';
    }

    const newReport: Report = {
      id: `r-${Date.now()}`,
      patientId,
      doctorId,
      title,
      fileUrl,
      date: new Date().toISOString(),
      type
    };
    setReports(prev => [...prev, newReport]);
  };

  const deleteReport = (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
  };

  const updateReport = (id: string, data: Partial<Report>) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
  };

  const bookAppointment = (doctorId: string, date: string) => {
    if (!currentUser) return;
    const newAppt: Appointment = {
      id: `a-${Date.now()}`,
      patientId: currentUser.id,
      doctorId,
      date,
      status: "pending"
    };
    setAppointments(prev => [...prev, newAppt]);
  };

  const reportIssueToAdmin = (description: string) => {
    if (!currentUser) return;
    const newIssue: AdminIssue = {
      id: `i-${Date.now()}`,
      patientId: currentUser.id,
      description,
      date: new Date().toISOString()
    };
    setAdminIssues(prev => [...prev, newIssue]);
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
    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <AppStoreContext.Provider value={{
      isLoaded, users, appointments, reports, adminIssues, messages, currentUser,
      login, logout, updateProfile, createDoctor, deleteDoctor, resetDoctorPassword,
      createPatient, deletePatient, updatePatientPassword, approveAppointment,
      markVisited, uploadFileForPatient, deleteReport, updateReport, bookAppointment, reportIssueToAdmin, sendMessage
    }}>
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error("useAppStore must be used within AppStoreProvider");
  }
  return context;
}
