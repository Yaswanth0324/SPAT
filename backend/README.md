# SAPT — Student Activity Point Tracker
### Backend Service | Spring Boot + MySQL + MongoDB + JWT

---

## 📌 Project Overview

SAPT is an enterprise-grade web application for tracking student activity points in educational institutions. Students submit proof of extracurricular activities (sports, technical, cultural, etc.) and mentors/HODs review and award points.

**Role Hierarchy:**
```
System Admin → College Admin → HOD → Mentor → Student
```

**Tech Stack:**
| Layer | Technology |
|---|---|
| Backend Framework | Spring Boot 3.2.x |
| Build Tool | Maven |
| Primary Database | MySQL (relational data) |
| Secondary Database | MongoDB (logs, audit trail) |
| Authentication | JWT (stateless) |
| Email / OTP | Spring Mail + SMTP |
| Environment Config | dotenv-java |

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Java 17+
- Maven 3.8+
- MySQL 8.0+
- MongoDB 6.0+

### Step 1 — Clone and open the backend folder
```bash
cd c:/SPAT/backend
```

### Step 2 — Create your local `.env` file
```bash
cp .env.example .env
```
Now edit `.env` and fill in your local credentials:
```properties
MYSQL_URL=jdbc:mysql://localhost:3306/sapt_db?useSSL=false&serverTimezone=UTC
MYSQL_USERNAME=root
MYSQL_PASSWORD=your_password

MONGO_URI=mongodb://localhost:27017
MONGO_DATABASE=sapt_logs

JWT_SECRET=your_very_long_random_secret_key_here
JWT_EXPIRATION=86400000

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_gmail_app_password
```

> ⚠️ **Never commit `.env` to Git.** It is in `.gitignore`.

### Step 3 — Create the MySQL database
```sql
CREATE DATABASE sapt_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 4 — Run the backend
```bash
mvn spring-boot:run
```
or in your IDE, run `SaptApplication.java`.

The API will start at: `http://localhost:8080/api`

---

## 📁 Project Structure

```
backend/
├── src/main/java/com/sapt/
│
│   ├── SaptApplication.java          ← Main entry point (DO NOT MODIFY)
│
│   ├── auth/                         ← Centralized Authentication (JWT + OTP)
│   │    ├── controller/AuthController.java
│   │    ├── service/AuthService.java + AuthServiceImpl.java
│   │    ├── repository/AuthUserRepository.java + OtpTokenRepository.java
│   │    ├── dto/ (LoginRequest, LoginResponse, RegisterRequest, AuthDtos)
│   │    ├── entity/ (AuthUser, OtpToken)
│   │    ├── config/PasswordEncoderConfig.java
│   │    └── util/AuthUtil.java
│
│   ├── student/                      ← Student module
│   ├── mentor/                       ← Mentor module
│   ├── hod/                          ← Head of Department module
│   ├── collegeadmin/                 ← College Admin module
│   ├── systemadmin/                  ← System Admin module
│   ├── submission/                   ← Activity Submission module
│
│   ├── notification/                 ← Email & OTP Notification system
│   │    ├── mail/MailService.java
│   │    ├── otp/OtpMailService.java
│   │    ├── templates/MailTemplates.java
│   │    └── NotificationService.java
│
│   ├── security/                     ← Spring Security + JWT
│   │    ├── jwt/JwtUtil.java
│   │    ├── config/SecurityConfig.java
│   │    ├── filter/JwtAuthFilter.java
│   │    └── CustomUserDetailsService.java
│
│   ├── common/                       ← Shared across all modules
│   │    ├── response/ApiResponse.java
│   │    ├── exception/ (GlobalExceptionHandler, SaptException)
│   │    ├── constants/AppConstants.java
│   │    ├── enums/ (UserRole, SubmissionStatus, ActivityCategory)
│   │    └── utils/CommonUtils.java
│
│   └── config/                       ← App-level configs
│        ├── DotenvConfig.java
│        ├── CorsConfig.java
│        ├── MongoConfig.java
│        └── AsyncConfig.java
│
├── src/main/resources/
│   ├── application.properties        ← Main config (reads from .env)
│   ├── application-dev.properties    ← Dev overrides
│   └── application-prod.properties   ← Prod overrides
│
├── .env                              ← Local secrets (NOT committed)
├── .env.example                      ← Template for teammates
├── .gitignore
├── pom.xml
└── README.md
```

---

## 🔐 Authentication Architecture

Authentication is **centralized** in the `auth/` module. **Do NOT** create separate login systems in other modules.

### Flow
```
Client → POST /api/auth/login → AuthController
                              → AuthServiceImpl (validate credentials)
                              → JwtUtil (generate token)
                              ← LoginResponse { token, role, email }

Subsequent requests → JwtAuthFilter (extract & validate token)
                    → SecurityContextHolder (set authentication)
                    → Controller (@PreAuthorize checks role)
```

### Securing Endpoints
Use `@PreAuthorize` on controllers:
```java
@PreAuthorize("hasRole('STUDENT')")       // Only students
@PreAuthorize("hasRole('MENTOR')")         // Only mentors
@PreAuthorize("hasRole('HOD')")            // Only HODs
@PreAuthorize("hasRole('COLLEGE_ADMIN')")  // Only college admins
@PreAuthorize("hasRole('SYSTEM_ADMIN')")   // Only system admins
```

---

## 📡 API Conventions

All responses follow the `ApiResponse<T>` wrapper:
```json
{
  "success": true,
  "message": "Login successful",
  "data": { "token": "...", "role": "STUDENT" },
  "timestamp": "2026-05-27T19:00:00"
}
```

**Base URL:** `http://localhost:8080/api`

| Module | Base Path |
|---|---|
| Auth | `/api/auth/**` |
| Student | `/api/student/**` |
| Mentor | `/api/mentor/**` |
| HOD | `/api/hod/**` |
| College Admin | `/api/college-admin/**` |
| System Admin | `/api/system-admin/**` |
| Submission | `/api/submission/**` |

---

## 👥 Team — Module Ownership

> Each team member is responsible for their assigned module(s).
> Implement the `ServiceImpl` class and add endpoints to the `Controller`.

| Module | Files to Implement |
|---|---|
| **Auth** | `AuthServiceImpl.java`, `JwtUtil.java`, `JwtAuthFilter.java`, `CustomUserDetailsService.java` |
| **Student** | `StudentServiceImpl.java`, `StudentController.java` |
| **Mentor** | `MentorServiceImpl.java`, `MentorController.java` |
| **HOD** | `HodServiceImpl.java`, `HodController.java` |
| **CollegeAdmin** | `CollegeAdminServiceImpl.java`, `CollegeAdminController.java` |
| **SystemAdmin** | `SystemAdminServiceImpl.java`, `SystemAdminController.java` |
| **Submission** | `SubmissionServiceImpl.java`, `SubmissionController.java` |
| **Notification** | `MailService.java`, `OtpMailService.java`, `MailTemplates.java` |

---

## 🌿 Branch Strategy

```
main            ← Protected. Only merge via PR after review.
dev             ← Integration branch. Merge feature branches here.
feature/<name>  ← Individual feature branches.
fix/<name>      ← Bug fix branches.
```

**Workflow:**
```bash
# Start a new feature
git checkout dev
git pull origin dev
git checkout -b feature/auth-login

# Work, commit, push
git add .
git commit -m "feat(auth): implement login endpoint"
git push origin feature/auth-login

# Create PR → dev branch
```

**Commit Convention:**
```
feat(module): short description      ← New feature
fix(module): short description       ← Bug fix
refactor(module): short description  ← Code improvement
docs: update README                  ← Documentation
```

---

## ✅ Implementation Checklist

### Phase 1 — Auth (Priority: HIGHEST)
- [ ] Implement `JwtUtil` — token generation & validation
- [ ] Implement `JwtAuthFilter` — request interception
- [ ] Implement `CustomUserDetailsService` — load user from DB
- [ ] Implement `AuthServiceImpl.login()` — credential check + JWT
- [ ] Implement `AuthServiceImpl.register()` — save user + send OTP
- [ ] Implement `AuthServiceImpl.sendOtp()` — generate & email OTP
- [ ] Implement `AuthServiceImpl.verifyOtp()` — validate OTP
- [ ] Update `SecurityConfig` — define public/protected routes

### Phase 2 — Notification
- [ ] Implement `MailService.sendHtmlMail()`
- [ ] Implement `OtpMailService.sendEmailVerificationOtp()`
- [ ] Improve `MailTemplates` with branded HTML

### Phase 3 — Role Modules
- [ ] Student: profile, submissions, points
- [ ] Mentor: assigned students, submission review
- [ ] HOD: department overview, escalated approvals
- [ ] CollegeAdmin: user management, college stats
- [ ] SystemAdmin: college management, system overview

### Phase 4 — Submission Workflow
- [ ] Create submission (Student)
- [ ] Review submission (Mentor)
- [ ] Escalate / final approve (HOD)
- [ ] Points calculation

---

## 🔧 Common Developer Notes

1. **Error Handling** — Always use `SaptException` for business errors. Never throw raw exceptions.
2. **Validation** — Use `@Valid` + DTO annotations, not manual if-checks.
3. **Logging** — Use `@Slf4j` and `log.info()` / `log.error()`. No `System.out.println()`.
4. **Transactions** — Add `@Transactional` on service methods that write to DB.
5. **Async** — Notification methods are `@Async`. Do NOT call them synchronously in the main flow.
6. **No hardcoded values** — All config values come from `.env` → `application.properties`.

---

## 📞 Support

For architecture questions, refer to:
- `SecurityConfig.java` — security rules
- `GlobalExceptionHandler.java` — error handling
- `ApiResponse.java` — response format
- `AppConstants.java` — all constants
