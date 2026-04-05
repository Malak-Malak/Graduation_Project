# GPMS — Graduation Project Management System

## Overview

GPMS is a full-stack web application built to streamline the management of graduation projects at universities. The platform connects students, supervisors, and administrators in one centralized system, enabling teams to organize tasks, communicate effectively, track progress, and submit work — all in one place.

The system is designed with two working versions per student, allowing them to manage both the introductory phase and the final graduation project phase independently within the same platform.

---

## Objectives

- Provide students with a structured environment to manage graduation project tasks
- Improve communication between student teams and their supervisors
- Enable supervisors to monitor team progress and provide structured feedback
- Give administrators full control over user access and system data
- Offer a repository of previous graduation projects for future reference
- Build a reusable, open-source platform that universities can adopt

---

## System Roles

The system supports three roles, each with its own set of permissions and features:

**Student**
A registered graduate student who can create or join a team, manage tasks on a shared Kanban board, communicate with their supervisor through the feedback system, upload file links, and switch between two project versions.

**Supervisor**
A university faculty member who oversees assigned teams, reviews their Kanban boards, provides structured feedback, approves or rejects team requests and leave requests, and sets their availability for supervision.

**Admin**
The system administrator who controls user registration by verifying requests against the university database, manages all users and university records, and maintains overall system data.

---

## Features

### Student
- Request access and login using university portal credentials
- Create a team or join an existing one
- Select a supervisor from the available list
- Invite students to the team or send a join request to an existing team
- Switch between two independent project versions
- Kanban board with To Do, In Progress, and Done columns
- Create, edit, delete, and drag-and-drop tasks between statuses
- Assign tasks to one or more team members
- Upload and manage file links on tasks
- View supervisor feedback and add replies
- Request to leave a team (requires supervisor approval)

### Supervisor
- View all assigned teams with full member and project details
- View team Kanban board in read-only mode
- Approve or reject team creation requests
- Approve or reject student leave requests
- Add feedback on teams or specific tasks
- Edit and delete own feedback
- Set and update maximum number of supervised teams

### Admin
- Review and approve or reject student and supervisor registration requests
- Manage university records (add and delete)
- View all registered users
- Clean up orphaned or duplicate data
- Full system data reset capability

---

## Two-Version System

Each student has access to two independent versions of the platform. Version 0 is used for the graduation project introduction (first semester), and Version 1 is used for the actual graduation project (second semester). All task and feedback data is stored separately per version. Students can switch between versions at any time without affecting their teammates. Supervisors can view each version's data per team independently.

---

## System Architecture

The backend follows a layered REST API architecture:

- Controllers — handle HTTP requests and responses
- Services — contain business logic
- Models — define database entities
- DbContext — manages database access via Entity Framework Core

---

## Technologies

**Backend**
- ASP.NET Core 9
- Entity Framework Core
- PostgreSQL (production via Railway)
- SQL Server (local development)
- JWT Authentication
- BCrypt password hashing

**Frontend**
- React
- HTML / CSS / JavaScript

**Tools**
- Git and GitHub
- Swagger (API documentation and testing)
- Railway (cloud deployment)

---



Swagger UI:
https://gpms.up.railway.app/swagger/index.html

---

## Authentication

All endpoints except `request-access` and `login` require a Bearer token in the Authorization header:
Authorization: Bearer <your_token>

Tokens are issued on login and expire after 1 day. To switch versions, call the switch-version endpoint — the version is stored server-side and applied automatically to all subsequent requests.

---

## API Endpoints

### Auth
| Method | Endpoint |
|--------|----------|
| POST | /api/auth/request-access |
| POST | /api/auth/login |

---

### Admin
| Method | Endpoint |
|--------|----------|
| GET | /api/admin/pending-requests |
| GET | /api/admin/all-requests |
| GET | /api/admin/users |
| POST | /api/admin/review-request |
| POST | /api/admin/add-university-record |
| DELETE | /api/admin/delete-university-record/{email} |
| DELETE | /api/admin/delete-request/{id} |
| DELETE | /api/admin/cleanup-orphaned-users |
| DELETE | /api/admin/clear-all-data |

---

### Student
| Method | Endpoint |
|--------|----------|
| GET | /api/student/available-students |
| GET | /api/student/all-students |
| GET | /api/student/supervisors |
| GET | /api/student/available-teams |
| GET | /api/student/my-team |
| GET | /api/student/my-invitations |
| GET | /api/student/my-join-requests |
| GET | /api/student/team-join-requests |
| GET | /api/student/current-version |
| POST | /api/student/create-team |
| POST | /api/student/send-invitation |
| POST | /api/student/request-to-join |
| POST | /api/student/respond-to-invitation |
| POST | /api/student/respond-to-join-request |
| POST | /api/student/reject-join-request/{requestId} |
| POST | /api/student/request-leave |
| POST | /api/student/switch-version |
| PUT | /api/student/update-project-info |
| DELETE | /api/student/delete-join-request/{requestId} |

---

### Supervisor
| Method | Endpoint |
|--------|----------|
| GET | /api/supervisor/pending-team-requests |
| GET | /api/supervisor/my-teams |
| GET | /api/supervisor/team/{teamId} |
| GET | /api/supervisor/total-teams |
| GET | /api/supervisor/leave-requests |
| POST | /api/supervisor/respond-to-team-request |
| POST | /api/supervisor/respond-to-leave-request |
| PUT | /api/supervisor/set-max-teams |

---

### Kanban
| Method | Endpoint |
|--------|----------|
| GET | /api/kanban/board |
| GET | /api/kanban/team-members |
| POST | /api/kanban/create-task |
| PUT | /api/kanban/update-task/{taskId} |
| PUT | /api/kanban/update-status |
| DELETE | /api/kanban/delete-task/{taskId} |

---

### Feedback
| Method | Endpoint |
|--------|----------|
| GET | /api/feedback/team/{teamId} |
| POST | /api/feedback/create |
| POST | /api/feedback/reply |
| PUT | /api/feedback/edit/{feedbackId} |
| PUT | /api/feedback/edit-reply/{replyId} |
| DELETE | /api/feedback/delete/{feedbackId} |
| DELETE | /api/feedback/delete-reply/{replyId} |

---

### File System
| Method | Endpoint |
|--------|----------|
| GET | /api/filesystem/task/{taskItemId} |
| POST | /api/filesystem/add |
| PUT | /api/filesystem/edit/{attachmentId} |
| DELETE | /api/filesystem/delete/{attachmentId} |

---

### Notification
| Method | Endpoint |
|--------|----------|
| GET | /api/notification/my-notifications |
| GET | /api/notification/unread-count |
| PUT | /api/notification/mark-as-read/{id} |
| PUT | /api/notification/mark-all-as-read |

---

### User Profile
| Method | Endpoint |
|--------|----------|
| GET | /api/userprofile |
| GET | /api/userprofile/{userId} |
| POST | /api/userprofile |
| PUT | /api/userprofile |

## Screenshots

### Entry & Authentication
| | |
|---|---|
| ![Entry](screenshots/entry.png) | ![Login](screenshots/login.png) |
| ![Register](screenshots/register.png) | ![Moving To Phases](screenshots/movingToPhases.png) |

### Admin
| | |
|---|---|
| ![Admin Dashboard](screenshots/AdminDashboard.png) | ![Admin Users Management](screenshots/adminUsersManagement.png) |

### Student
| | |
|---|---|
| ![Student Dashboard](screenshots/studentDashboard.png) | ![My Team](screenshots/myTeam.png) |
| ![Kanban Board](screenshots/kanbanboard.png) | ![Files Page](screenshots/filesPage.png) |
| ![Meetings Page](screenshots/meetingsPage.png) | ![Analytics](screenshots/analytics.png) |
| ![Discovery Hub Students](screenshots/discoveryhub-students.png) | ![Discovery Hub Teams](screenshots/discoveryhub-teams.png) |
| ![User Profile](screenshots/userProfile.png) | |

### Supervisor
| | |
|---|---|
| ![Supervisor Dashboard](screenshots/supervisorDashboard.png) | ![Supervisor Pending Requests](screenshots/supervisor-pending-requests.png) |
| ![Supervisor Groups](screenshots/supervisor-groups.png) | ![Supervisor Files](screenshots/supervisor-files.png) |
| ![Supervisor AI Reports](screenshots/supervisorAiReports.png) | |