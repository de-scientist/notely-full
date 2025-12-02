# 🚀 Notely: Your Secure, Feature-Rich Note-Taking Companion

Notely is a modern, user-friendly application designed to streamline personal note management.  
Built with smooth interactions and a focus on essential features, it offers a reliable and efficient digital space for capturing, organizing, and revisiting your ideas, thoughts, and information.

**Note:** The terms *"Note"* and *"Entry"* refer to the same written record throughout the application.

---

## ✨ Key Features

---

### 🔐 User & Security

- **Complete Authentication Flow:**  
  Secure sign-up and login using either email or username along with a hashed password.

- **Protected Routes:**  
  Essential pages (New Entry, Profile, Trash) redirect unauthenticated users to the login page.

- **Password Management:**  
  Update password securely with validation of the current password and hashing of the new one.

- **Logout Functionality:**  
  Proper session termination for secure logouts.

---

### 📝 Notes Management System

- **Core Data Fields:**  
  Each note includes a **Title**, **Synopsis**, and rich **Markdown Content**.

- **Markdown Rendering:**  
  Content is converted to formatted HTML using Markdown-to-HTML tools.

- **Soft Deletion:**  
  Instead of permanent removal, entries are marked with `isDeleted` and moved to Trash.

- **Dedicated Trash View:**  
  A page to:
  - View soft-deleted entries  
  - Restore them  
  - Permanently delete them  
  Includes an informational message such as:  
  *“Items in trash will be permanently deleted after 30 days.”*

- **Restoration:**  
  Soft-deleted entries can be restored easily from the Trash.

---

### 🖼️ User Interface & Experience

- **Dashboard View:**  
  All active notes appear in clean, visually appealing cards with actions like:
  - Read More  
  - Edit  
  - Delete  

- **CRUD Interface:**  
  Seamless pages for creating new entries, editing existing ones, and viewing full details.

- **Dynamic Header:**  
  Changes based on authentication state:

  - **Logged Out:**  
    Shows Login and Sign Up.

  - **Logged In:**  
    Shows My Notes, New Entry, Profile, Trash, a welcome message, and the user avatar.

---

### 👤 Profile & Customization

- **User Details Update:**  
  Edit First Name, Last Name, Username, and Email via pre-filled forms.

- **Avatar Management (Required):**  
  Upload profile pictures using a cloud service (e.g., Cloudinary).  
  The uploaded image URL is saved for use across the app.

- **Fallback Avatar:**  
  If no custom image exists, the app displays initials as a fallback avatar.

---

## 🛠️ Technology Stack

| Area        | Component                 | Notes                                       |
|-------------|----------------------------|---------------------------------------------|
| Frontend    | React, TypeScript, React Query | Component-based, smooth state management |
| Backend     | Node.js, Express, TypeScript | RESTful API server                        |
| Database    | SQL Server (via Prisma)   | Reliable, transactional store               |
| ORM         | Prisma                    | Type-safe queries & migrations              |
| Security    | bcrypt / argon2           | Secure password hashing                     |
| File Storage| Cloudinary (or similar)   | For user profile image uploads              |

---

## 🏗️ Data Models

The app uses two primary models: **User** and **Entry**, with a one-to-many relationship (a user can have multiple entries).

---

### **1. User Model**

| Field                  | Type       | Constraint / Default   | Purpose                                   |
|------------------------|-----------|-------------------------|-------------------------------------------|
| id                     | UUID      | Primary Key, `uuid()`   | Unique user identifier                    |
| username               | String    | Required, Unique        | Login identifier                          |
| email                  | String    | Required, Unique        | Login identifier                          |
| password               | String    | Required                | Hashed password                           |
| firstName              | String    | Required                | User’s first name                         |
| lastName               | String    | Required                | User’s last name                          |
| avatar                 | String    | Optional (URL)          | Profile picture URL                       |
| dateJoined             | DateTime  | `now()`                 | Account creation date                     |
| lastProfileUpdate      | DateTime  | `@updatedAt`            | Auto-updated timestamp                    |
| isDeleted              | Boolean   | `false`                 | Soft delete flag                          |

---

### **2. Entry Model**

| Field         | Type      | Constraint / Relationship       | Purpose                                |
|---------------|-----------|----------------------------------|----------------------------------------|
| id            | UUID      | Primary Key, `uuid()`            | Unique entry identifier                |
| title         | String    | Required                         | Short heading                          |
| synopsis      | String    | Required                         | Brief summary                          |
| content       | String    | Required (Markdown)              | Full body of note                      |
| isDeleted     | Boolean   | `false`                          | Soft delete flag                       |
| dateCreated   | DateTime  | `now()`                          | Creation timestamp                     |
| lastUpdated   | DateTime  | `@updatedAt`                     | Auto-updated timestamp                 |
| userId        | UUID      | Foreign Key → User.id            | Owner of the entry                     |
| categoryId    | UUID      | Foreign Key → Category.id        | Category linkage                       |

---

## 🧭 API Endpoints

### **Authentication**
- `POST /api/auth/register` — Register a new user  
- `POST /api/auth/login` — Authenticate via email or username  
- `POST /api/auth/logout` — End user session  
- `POST /api/auth/password` — Update password for authenticated user  

---

### **User**
- `PATCH /api/user/` — Update user details and avatar URL  

---

### **Entries (Notes)**
- `GET /api/entries` — Get all active entries  
- `POST /api/entries` — Create a new entry  
- `GET /api/entries/trash` — Get soft-deleted entries  
- `GET /api/entries/:id` — Get specific entry  
- `PATCH /api/entries/:id` — Update entry  
- `PATCH /api/entries/restore/:id` — Restore a soft-deleted entry  
- `DELETE /api/entries/:id` — Soft-delete an entry  

---

### **Categories**
- `GET /api/categories` — Get all categories for the user  

---

## 💡 Bonus Features (Future Enhancements)

- **Private/Public Toggle:**  
  Add an `isPublic` flag for optional sharing.

- **Saved/Bookmarked Entries:**  
  New table for saving important notes for fast access.

- **Pinned Entries:**  
  Allow pinning notes so they stay at the top of the dashboard.

