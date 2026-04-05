# **GPMS**



### **Overview**

GPMS (Graduation Project Management System) is a full-stack web application designed to help graduation students manage their projects, organize tasks, collaborate with team members, and allow supervisors to monitor project progress.

The system includes task management using a Kanban board, supervisor feedback, progress tracking, meeting booking, and a project history repository for future students.



The goal of this system is to provide universities with a centralized platform for managing graduation projects efficiently.



### **Objectives**

Help students organize graduation project tasks

Improve communication between students and supervisors

Track project progress and detect delays

Provide a repository of previous graduation projects

Build a platform that can be used by universities as an open-source system



### **👥 System Roles**



##### The system contains three main roles:



* Student
* Supervisor
* Admin





### **✨ Features**

* ##### Student Features
* *Register and login*
* *Create or join a team*
* *Select supervisor*
* *Kanban board (To Do, Doing, Done)*
* *Add / edit / delete tasks*
* *Drag and drop tasks between statuses*
* *Upload task links*
* *View supervisor comments*
* *View project progress*
* *AI progress analysis and warnings*
* *View previous graduation projects*



* ##### Supervisor Features
* *View assigned teams*
* *View team Kanban board (read-only)*
* *Add comments on tasks*
* *View progress reports*
* *Detect delayed teams*
* *Receive alerts for delays*
* *Manage sections*



* ##### Admin Features
* *Manage students*
* *Manage supervisors*
* *Manage system data*





### **System Architecture**



##### The system follows:

* *REST API Architecture*
* *Layered Architecture*
* *Backend Layers*
* *Controllers*
* *Services*
* *Repositories*
* *Models*
* *Database*





### **Technologies Used**



#### Backend

* ASP.NET Core
* Entity Framework Core
* SQL Server
* REST API



#### Frontend

* HTML
* CSS
* JavaScript
* React 



#### Tools



* Git \& GitHub
* Swagger
* Railway (Deployment)

# 🎓 Graduation Project Management System (GPMS) API

A comprehensive backend API for managing graduation projects, built with ASP.NET Core.

---

## 🔗 Base URL
[https://gpms.up.railway.app](https://gpms.up.railway.app/swagger/index.html)

---

##  Authentication
All endpoints except `request-access` and `login` require a Bearer token in the Authorization header.
Authorization: Bearer <your_token>

---

##  API Endpoints

###  Auth
| Method | Endpoint |
|--------|----------|
| `POST` | `/api/auth/request-access` |
| `POST` | `/api/auth/login` |

---

###  Admin
| Method | Endpoint |
|--------|----------|
| `GET` | `/api/admin/pending-requests` |
| `GET` | `/api/admin/all-requests` |
| `GET` | `/api/admin/users` |
| `POST` | `/api/admin/review-request` |
| `POST` | `/api/admin/add-university-record` |
| `DELETE` | `/api/admin/delete-university-record/{email}` |
| `DELETE` | `/api/admin/delete-request/{id}` |
| `DELETE` | `/api/admin/cleanup-orphaned-users` |
| `DELETE` | `/api/admin/clear-all-data` |

---

###  Student
| Method | Endpoint |
|--------|----------|
| `GET` | `/api/student/available-students` |
| `GET` | `/api/student/all-students` |
| `GET` | `/api/student/supervisors` |
| `GET` | `/api/student/available-teams` |
| `GET` | `/api/student/my-team` |
| `GET` | `/api/student/my-invitations` |
| `GET` | `/api/student/my-join-requests` |
| `GET` | `/api/student/team-join-requests` |
| `GET` | `/api/student/current-version` |
| `POST` | `/api/student/create-team` |
| `POST` | `/api/student/send-invitation` |
| `POST` | `/api/student/request-to-join` |
| `POST` | `/api/student/respond-to-invitation` |
| `POST` | `/api/student/respond-to-join-request` |
| `POST` | `/api/student/reject-join-request/{requestId}` |
| `POST` | `/api/student/request-leave` |
| `POST` | `/api/student/switch-version` |
| `PUT` | `/api/student/update-project-info` |
| `DELETE` | `/api/student/delete-join-request/{requestId}` |

---

###  Supervisor
| Method | Endpoint |
|--------|----------|
| `GET` | `/api/supervisor/pending-team-requests` |
| `GET` | `/api/supervisor/my-teams` |
| `GET` | `/api/supervisor/team/{teamId}` |
| `GET` | `/api/supervisor/total-teams` |
| `GET` | `/api/supervisor/leave-requests` |
| `POST` | `/api/supervisor/respond-to-team-request` |
| `POST` | `/api/supervisor/respond-to-leave-request` |
| `PUT` | `/api/supervisor/set-max-teams` |

---

###  Kanban
| Method | Endpoint |
|--------|----------|
| `GET` | `/api/kanban/board` |
| `GET` | `/api/kanban/team-members` |
| `POST` | `/api/kanban/create-task` |
| `PUT` | `/api/kanban/update-task/{taskId}` |
| `PUT` | `/api/kanban/update-status` |
| `DELETE` | `/api/kanban/delete-task/{taskId}` |

---

###  Feedback
| Method | Endpoint |
|--------|----------|
| `GET` | `/api/feedback/team/{teamId}` |
| `POST` | `/api/feedback/create` |
| `POST` | `/api/feedback/reply` |
| `PUT` | `/api/feedback/edit/{feedbackId}` |
| `PUT` | `/api/feedback/edit-reply/{replyId}` |
| `DELETE` | `/api/feedback/delete/{feedbackId}` |
| `DELETE` | `/api/feedback/delete-reply/{replyId}` |

---

###  File System
| Method | Endpoint |
|--------|----------|
| `GET` | `/api/filesystem/task/{taskItemId}` |
| `POST` | `/api/filesystem/add` |
| `PUT` | `/api/filesystem/edit/{attachmentId}` |
| `DELETE` | `/api/filesystem/delete/{attachmentId}` |

---

###  Notification
| Method | Endpoint |
|--------|----------|
| `GET` | `/api/notification/my-notifications` |
| `GET` | `/api/notification/unread-count` |
| `PUT` | `/api/notification/mark-as-read/{id}` |
| `PUT` | `/api/notification/mark-all-as-read` |

---

###  User Profile
| Method | Endpoint |
|--------|----------|
| `GET` | `/api/userprofile` |
| `GET` | `/api/userprofile/{userId}` |
| `POST` | `/api/userprofile` |
| `PUT` | `/api/userprofile` |

