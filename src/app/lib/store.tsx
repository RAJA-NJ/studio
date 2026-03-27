"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

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
  isEmergency?: boolean;
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
  bookAppointment: (doctorId: string, date: string, isEmergency?: boolean) => void;
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

  const login = useCallback((username: string, password: string, role: Role) => {
    const user = users.find(u => u.username === username && u.password === password && u.role === role);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const updateProfile = useCallback((data: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...data };
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
  }, [currentUser]);

  const createDoctor = useCallback((doc: Omit<User, "id" | "role">) => {
    const newUser: User = { ...doc, id: `u-${Date.now()}-${Math.floor(Math.random()*1000)}`, role: "doctor" };
    setUsers(prev => [...prev, newUser]);
  }, []);

  const deleteDoctor = useCallback((id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  }, []);

  const resetDoctorPassword = useCallback((id: string, newPass: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, password: newPass } : u));
  }, []);

  const createPatient = useCallback((pat: Omit<User, "id" | "role" | "doctorId">) => {
    if (!currentUser || currentUser.role !== "doctor") return;
    const newUser: User = { ...pat, id: `u-${Date.now()}-${Math.floor(Math.random()*1000)}`, role: "patient", doctorId: currentUser.id };
    setUsers(prev => [...prev, newUser]);
  }, [currentUser]);

  const deletePatient = useCallback((id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  }, []);

  const updatePatientPassword = useCallback((id: string, newPass: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, password: newPass } : u));
  }, []);

  const approveAppointment = useCallback((id: string) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "approved" } : a));
  }, []);

  const markVisited = useCallback((id: string, notes: string) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "visited", notes } : a));
  }, []);

  const uploadFileForPatient = useCallback((patientId: string, title: string, fileUrl: string, type: "scan" | "prescription") => {
    if (!currentUser) return;
    
    let doctorId = '';
    if (currentUser.role === 'doctor') {
      doctorId = currentUser.id;
    } else if (currentUser.role === 'patient') {
      doctorId = currentUser.doctorId || '';
    }

    const newReport: Report = {
      id: `r-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      patientId,
      doctorId,
      title,
      fileUrl,
      date: new Date().toISOString(),
      type
    };
    setReports(prev => [...prev, newReport]);
  }, [currentUser]);

  const deleteReport = useCallback((id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
  }, []);

  const updateReport = useCallback((id: string, data: Partial<Report>) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
  }, []);

  const bookAppointment = useCallback((doctorId: string, date: string, isEmergency: boolean = false) => {
    if (!currentUser) return;
    const newAppt: Appointment = {
      id: `a-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      patientId: currentUser.id,
      doctorId,
      date,
      status: "pending",
      isEmergency
    };
    setAppointments(prev => [...prev, newAppt]);
  }, [currentUser]);

  const reportIssueToAdmin = useCallback((description: string) => {
    if (!currentUser) return;
    const newIssue: AdminIssue = {
      id: `i-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      patientId: currentUser.id,
      description,
      date: new Date().toISOString()
    };
    setAdminIssues(prev => [...prev, newIssue]);
  }, [currentUser]);

  const sendMessage = useCallback((toId: string, text: string) => {
    if (!currentUser) return;
    const newMessage: Message = {
      id: `m-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      fromId: currentUser.id,
      toId,
      text,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMessage]);
  }, [currentUser]);

  const value = useMemo(() => ({
    isLoaded, users, appointments, reports, adminIssues, messages, currentUser,
    login, logout, updateProfile, createDoctor, deleteDoctor, resetDoctorPassword,
    createPatient, deletePatient, updatePatientPassword, approveAppointment,
    markVisited, uploadFileForPatient, deleteReport, updateReport, bookAppointment, reportIssueToAdmin, sendMessage
  }), [
    isLoaded, users, appointments, reports, adminIssues, messages, currentUser,
    login, logout, updateProfile, createDoctor, deleteDoctor, resetDoctorPassword,
    createPatient, deletePatient, updatePatientPassword, approveAppointment,
    markVisited, uploadFileForPatient, deleteReport, updateReport, bookAppointment, reportIssueToAdmin, sendMessage
  ]);

  return (
    <AppStoreContext.Provider value={value}>
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
