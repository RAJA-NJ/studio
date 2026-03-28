# an Intelligent Health Support System (IHSS)

A comprehensive web application designed to streamline medical practice management with role-based access for patients, doctors, and administrators. The platform facilitates appointment booking, secure messaging, medical record sharing, and patient management with strict doctor-patient assignment.

## Features

### 🔐 Authentication & Role-Based Access
- Single login page with role selection (Patient, Doctor, Admin)
- Secure password hashing and session management
- Hierarchical account creation:
  - Admin creates Doctor accounts
  - Doctor creates Patient accounts
- Password management:
  - Admin can reset Doctor passwords
  - Doctor can change Patient passwords

### 👨‍⚕️ Patient Dashboard
- **Search Doctors:** Find doctors by specialization and request connection
- **Book Appointments:** Schedule appointments with assigned doctor
- **Secure Chat:** Real-time messaging with assigned doctor
- **Upload Medical Records:** Upload scan reports and images for doctor review
- **Checkup History:** View complete medical history with past visit dates and doctor notes
- **Report Issues:** Submit complaints or issues to admin
- **Profile Management:** Edit profile picture and name

### 👩‍⚕️ Doctor Dashboard
- **Patient Management:**
  - View list of assigned patients with online status
  - Expandable patient cards showing detailed info and checkup history
  - Create new patient accounts
  - Delete patients from list
- **Consultation Tools:**
  - View patient-uploaded scan reports and images
  - Upload medical files to patient records (prescriptions, reports, etc.)
  - Real-time chat with patients
  - Send medical suggestions and checkup notes
- **Appointment Management:**
  - Approve or decline patient appointment requests
  - Mark patients as "Visited" to track completed consultations
- **Profile Management:** Edit profile picture, name, and specialization

### 🛡️ Admin Dashboard
- **Doctor Management:**
  - Create new doctor accounts with specialization
  - Delete doctor accounts
  - Reset doctor passwords
- **Report Moderation:**
  - View and manage patient-submitted issue reports
- **Platform Oversight:** Additional admin capabilities as needed

### 🔒 Core Security Constraints
- **Strict One-to-One Assignment:** Each patient is permanently assigned to one doctor (the one who created their account)
- **Data Isolation:** Doctors can only access their own patients' data
- **Cross-Doctor Restrictions:** Different doctors cannot view, chat with, or manage patients assigned to other doctors

## Tech Stack

### Frontend
- HTML5, CSS3, JavaScript
- Responsive design for mobile and desktop

### Backend
- Node.js with Express.js (or alternative as implemented)
- RESTful API architecture

### Database
- MySQL / PostgreSQL / MongoDB (as per implementation)
- Structured for strict doctor-patient relationships

### Authentication
- JWT (JSON Web Tokens) or session-based authentication
- bcrypt for password hashing

### File Storage
- Local storage or cloud storage (AWS S3 / Cloudinary) for medical records, profile pictures, and uploaded files

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Database server (MySQL/PostgreSQL/MongoDB)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/medconnect.git
   cd medconnect
