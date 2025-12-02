# 🚀 Notely  
### *Your Secure, Feature-Rich Note-Taking Companion*

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![Maintained](https://img.shields.io/badge/Maintained-Yes-blue)
![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)
![Platform](https://img.shields.io/badge/Platform-Web-lightgrey)
![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-orange)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20TS%20%7C%20Express%20%7C%20Prisma-purple)
![Security](https://img.shields.io/badge/Security-High-red)
![Markdown Supported](https://img.shields.io/badge/Markdown-Supported-important)
![Database](https://img.shields.io/badge/Database-SQL%20Server-informational)
![Cloud Storage](https://img.shields.io/badge/Cloudinary-Enabled-blueviolet)

Notely is a modern, user-centered note management app built to keep your thoughts sharp, safe, and always within reach.  
With clean interactions and a commitment to reliability, it delivers a smooth digital notebook for ideas, journaling, planning, and documentation.

> **Note:** The words *"Note"* and *"Entry"* refer to the same concept in this application.

---

## ✨ Features

---

### 🔐 **User & Security**

- **Secure Authentication:** Email/username login with hashed passwords.  
- **Protected Routes:** Sensitive pages like Profile, Trash, and New Entry require authentication.  
- **Password Update Flow:** Includes current password verification and new-hash storage.  
- **Secure Logout:** Proper session termination.

---

### 📝 **Notes Management System**

- **Core Fields:** Title, Synopsis, and Markdown-supported Content.  
- **Markdown Rendering:** Stored as Markdown, displayed as full HTML.  
- **Soft Deletion:** Notes moved to Trash using an `isDeleted` flag.  
- **Trash View:** Restore or permanently delete entries.  
- **Auto-Cleanup Notice:** e.g., *“Items in trash will be permanently deleted after 30 days.”*  
- **Instant Restore:** Bring notes back with one click.

---

### 🖼️ **User Interface & Experience**

- **Modern Dashboard:** Card-based layout for all active notes.  
- **Complete CRUD:** Create, edit, and view entries smoothly.  
- **Adaptive Header:**
  - Logged Out → Login, Sign Up  
  - Logged In → My Notes, New Entry, Profile, Trash, avatar + greeting  

---

### 👤 **Profile & Customization**

- **Editable User Profile:** Name, email, username—all pre-filled for convenience.  
- **Avatar Upload:** Cloudinary upload required for personalization.  
- **Fallback Avatar:** Automatically generated initials when no photo exists.

---

## 🛠️ Technology Stack

| Area        | Component                      | Notes                                      |
|-------------|--------------------------------|--------------------------------------------|
| Frontend    | React, TypeScript, React Query | Modern, fast UI with smooth state handling |
| Backend     | Node.js, Express, TypeScript   | RESTful API backend                        |
| Database    | SQL Server (via Prisma)        | Reliable relational data handling          |
| ORM         | Prisma                         | Type-safe queries and schema migrations    |
| Security    | bcrypt / argon2                | Secure password hashing                    |
| File Storage| Cloudinary (or similar)        | For avatar image uploads                   |

---

## 🏗️ Data Models

Two primary models: **User** → **Entry** (*One-to-Many*)

---

### **1. User Model**

| Field                  | Type       | Default / Constraint | Description                    |
|------------------------|-----------|-----------------------|--------------------------------|
| id                     | UUID      | `uuid()`              | Primary identifier             |
| username               | String    | Unique, Required      | Login handle                   |
| email                  | String    | Unique, Required      | Login identifier               |
| password               | String    | Required              | Hashed password                |
| firstName              | String    | Required              | User’s first name              |
| lastName               | String    | Required              | User’s last name               |
| avatar                 | String    | Optional (URL)        | Cloudinary profile picture     |
| dateJoined             | DateTime  | `now()`               | Account creation timestamp     |
| lastProfileUpdate      | DateTime  | `@updatedAt`          | Auto-updated profile changes   |
| isDeleted              | Boolean   | `false`               | Soft delete flag               |

---

### **2. Entry Model**

| Field         | Type      | Constraint / Relation      | Description                        |
|---------------|-----------|----------------------------|------------------------------------|
| id            | UUID      | `uuid()`                   | Entry identifier                   |
| title         | String    | Required                   | Note title                         |
| synopsis      | String    | Required                   | Short summary                      |
| content       | String    | Markdown                   | Body content                       |
| isDeleted     | Boolean   | `false`                    | Soft delete flag                   |
| dateCreated   | DateTime  | `now()`                    | Creation timestamp                 |
| lastUpdated   | DateTime  | `@updatedAt`               | Auto-update timestamp              |
| userId        | UUID      | FK → User.id               | Entry owner                        |
| categoryId    | UUID      | FK → Category.id           | Category link                      |

---

## 🧭 API Endpoints

### **Authentication**
- `POST /api/auth/register`  
- `POST /api/auth/login`  
- `POST /api/auth/logout`  
- `POST /api/auth/password`  

### **User**
- `PATCH /api/user/` — Update profile info & avatar  

### **Entries**
- `GET /api/entries`  
- `POST /api/entries`  
- `GET /api/entries/trash`  
- `GET /api/entries/:id`  
- `PATCH /api/entries/:id`  
- `PATCH /api/entries/restore/:id`  
- `DELETE /api/entries/:id`  

### **Categories**
- `GET /api/categories`  

---

## 💡 Future Enhancements

- **Public/Private Toggle** for shareable notes  
- **Saved / Bookmarked Entries**  
- **Pinned Notes** to keep essentials at the top  

---

## ⭐ Contributing

Pull requests are welcome.  
For major changes, please open an issue first to discuss what you’d like to improve.

---

## 🛡️ License

This project is licensed under the **MIT License**.

