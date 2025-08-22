# Ghana Audit Service – Correspondence Management System (Frontend)

**Project:** DCIT 208 – Software Engineering


**Course Year:** 2025

---

## **Table of Contents**

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [System Architecture](#system-architecture)
5. [Folder Structure](#folder-structure)
6. [Installation & Setup](#installation--setup)
7. [Running the Application](#running-the-application)
8. [Usage](#usage)
9. [Contribution Guidelines](#contribution-guidelines)
10. [License](#license)
11. [Contact](#contact)

---

## **Project Overview**

The **GAS CMS frontend** is a **Next.js + TypeScript web application** designed for the Ghana Audit Service to manage correspondence efficiently. The system centralizes tracking, enforces role-based access, and provides a secure interface for creating, viewing, and auditing correspondence records.

**Objectives:**

* Centralize correspondence workflows.
* Enable role-based access control (Admin, User, Department).
* Support secure file uploads and downloads.
* Generate audit-ready reports (PDF/Excel).

---

## **Features**

* **Dashboard:** Real-time overview of correspondence and user tasks.
* **Create Correspondence:** Add new records with attachments.
* **View & Update:** Track and update correspondence details.
* **Search & Filter:** Filter by department, status, date, or sender.
* **Export:** Generate PDF/Excel reports.
* **Authentication:** Supabase Auth with role-based permissions.

---

## **Tech Stack**

* **Framework:** Next.js (TypeScript)
* **Styling:** CSS / PostCSS
* **API & Backend:** Supabase (Auth, PostgreSQL, Storage)
* **Package Manager:** pnpm
* **Version Control:** Git/GitHub

---

## **System Architecture**

The frontend communicates with the **Supabase backend** through API requests:

* **Authentication:** Handled by Supabase Auth.
* **Data:** Correspondence, users, and logs stored in PostgreSQL.
* **File Storage:** Uploaded documents securely stored in Supabase Storage.


---

## **Folder Structure**

```
GAS-Frontend-V3/
│
├── app/             # Next.js app routes and pages
├── components/      # Reusable UI components
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and API helpers
├── public/          # Static assets (images, favicon)
├── styles/          # Global CSS and component-specific styles
├── .gitignore
├── README.md
├── components.json  # Component metadata
├── next.config.mjs  # Next.js configuration
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
└── tsconfig.json    # TypeScript configuration
```

---

## **Installation & Setup**

**Prerequisites:**

* Node.js >= 18
* pnpm package manager
* Git

**Steps:**

1. Clone the repository:

```bash
git clone https://github.com/sedegah/GAS-Frontend.git
```

2. Navigate into the project folder:

```bash
cd GAS-Frontend
```

3. Install dependencies:

```bash
pnpm install
```

4. Create a `.env` file at the root with your Supabase configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## **Running the Application**

```bash
pnpm dev
```

* Runs the Next.js development server on `http://localhost:3000`.
* Use registered Supabase credentials to login and access CMS features.

**Build for Production:**

```bash
pnpm build
pnpm start
```

---

## **Usage**

1. Open the application in a supported browser.
2. Login using your credentials.
3. Navigate the dashboard, create or view correspondence, and manage files.
4. Export reports as needed.

---

## **Contribution Guidelines**

* Fork the repository and create a feature branch.
* Follow consistent coding conventions and comment code for clarity.
* Submit pull requests for review before merging.

---

## **License**

This project is for academic purposes under the DCIT 208 Software Engineering course.

---

## **Contact**

**Team:** Group 53 – Tech People
**Email:** [sedegahkim@gmail.com](mailto:sedegahkim@gmail.com)
**GitHub:** [https://github.com/sedegah/GAS-Frontend](https://github.com/sedegah/GAS-Frontend)

---

