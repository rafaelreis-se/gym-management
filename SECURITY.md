# 🔐 Security Architecture

## Authentication & Authorization Strategy

### Overview

This system implements a **multi-layered security approach** following industry best practices used by large companies.

---

## 🔑 Authentication Methods

### 1. **Local Authentication (Email/Password)**

#### Password Security (Bcrypt)
```typescript
// Like big companies (GitHub, Netflix, etc.)
- Algorithm: bcrypt
- Configurable rounds: 10 (default, can increase for more security)
- Automatic salt generation
- One-way hashing (cannot be decrypted)
```

**Why bcrypt?**
- ✅ Industry standard (used by AWS, GitHub, Google Cloud)
- ✅ Adaptive - can increase cost factor over time
- ✅ Built-in salt - prevents rainbow table attacks
- ✅ Slow by design - prevents brute force

#### First Access Flow
```
1. Admin creates student/guardian
2. User receives email with temporary link
3. User sets password on first access (strong password required)
4. isFirstAccess flag set to false
```

### 2. **OAuth2 Social Login**

Supported providers:
- ✅ **Google** (OAuth 2.0)
- ✅ **Facebook** (OAuth 2.0)
- 🔜 **Apple** Sign In (ready to add)

**Benefits:**
- No password storage for social logins
- Leverages provider's security
- Better UX
- Automatic email verification

---

## 🛡️ Authorization (Access Control)

### Role-Based Access Control (RBAC)

#### Roles Hierarchy

```typescript
ADMIN > INSTRUCTOR > GUARDIAN > STUDENT
```

#### Role Permissions

| Resource | ADMIN | INSTRUCTOR | GUARDIAN | STUDENT |
|----------|-------|------------|----------|---------|
| **Students** |
| Create | ✅ | ❌ | ❌ | ❌ |
| View All | ✅ | ✅ (read-only) | ❌ | ❌ |
| View Own | ✅ | ✅ | ✅ (children) | ✅ (self) |
| Update | ✅ | ❌ | ❌ | ❌ |
| Delete | ✅ | ❌ | ❌ | ❌ |
| **Enrollments** |
| Create | ✅ | ❌ | ❌ | ❌ |
| View All | ✅ | ✅ | ❌ | ❌ |
| View Own | ✅ | ✅ | ✅ (children) | ✅ (self) |
| **Graduations** |
| Grant | ✅ | ✅ | ❌ | ❌ |
| View All | ✅ | ✅ | ❌ | ❌ |
| View Own | ✅ | ✅ | ✅ (children) | ✅ (self) |
| **Financial** |
| Create Payment | ✅ | ❌ | ❌ | ❌ |
| View All | ✅ | ❌ | ❌ | ❌ |
| View Own | ✅ | ❌ | ✅ (children) | ✅ (self) |
| Mark as Paid | ✅ | ❌ | ❌ | ❌ |
| Create Plan | ✅ | ❌ | ❌ | ❌ |
| View Plans | 👥 All (public) | 👥 All (public) | 👥 All (public) | 👥 All (public) |
| **Products** |
| Create | ✅ | ❌ | ❌ | ❌ |
| Update Stock | ✅ | ❌ | ❌ | ❌ |
| Create Sale | ✅ | ✅ | ❌ | ❌ |
| View Products | 👥 All | 👥 All | 👥 All | 👥 All |

### Guards Implementation

#### 1. JwtAuthGuard (Global)
```typescript
// Applied globally, protects ALL routes by default
// Use @Public() decorator to bypass
```

#### 2. RolesGuard
```typescript
// Checks user role against required roles
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
```

#### 3. ResourceOwnerGuard
```typescript
// Ensures users only access their own data
// Admins bypass this check
// Students can only access their studentId
// Guardians can only access their children's data
```

---

## 🔐 Token Management

### JWT Access Tokens
```
- Short-lived: 7 days (configurable)
- Contains: userId, email, role
- Stateless validation
- Bearer token in Authorization header
```

### Refresh Tokens
```
- Long-lived: 30 days (configurable)
- Stored in database
- Can be revoked
- Rotation on use (future enhancement)
- Tracks: user agent, IP address
```

### Token Flow

```
1. Login → Access Token + Refresh Token
2. Use Access Token for API calls
3. Access Token expires → Use Refresh Token
4. Get new Access Token
5. Logout → Revoke Refresh Token
```

---

## 🔒 Security Best Practices Implemented

### 1. Password Security
- ✅ Bcrypt with configurable rounds
- ✅ Minimum 8 characters
- ✅ Complexity requirements (uppercase, lowercase, number/special)
- ✅ One-way hashing (cannot be decrypted)
- ✅ Automatic salt per password

### 2. Token Security
- ✅ JWT with strong secret (change in production!)
- ✅ Short-lived access tokens
- ✅ Refresh token rotation capability
- ✅ Token revocation on logout
- ✅ Expired token cleanup

### 3. API Security
- ✅ Global authentication (JWT) by default
- ✅ Role-based access control
- ✅ Resource ownership validation
- ✅ Request ID for tracing
- ✅ CORS configuration
- ✅ Input validation (class-validator)

### 4. Database Security
- ✅ No plain text passwords EVER
- ✅ Refresh tokens stored securely
- ✅ User activity tracking (last login)
- ✅ Soft delete capability (isActive flag)

---

## 🚀 Usage Examples

### Register User
```bash
POST /api/auth/register
{
  "email": "student@example.com",
  "password": "SecurePass123!",  # Optional - if empty, requires first access
  "role": "STUDENT",
  "studentId": "uuid-here"
}
```

### Login
```bash
POST /api/auth/login
{
  "email": "student@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "random-hex-string",
  "user": { ... }
}
```

### First Access (Set Password)
```bash
POST /api/auth/set-password
{
  "userId": "uuid-here",
  "password": "NewSecurePass123!"
}
```

### Use Protected Endpoint
```bash
GET /api/students
Headers:
  Authorization: Bearer eyJhbGc...
```

### Google OAuth
```bash
# Redirect user to:
GET /api/auth/google

# Callback automatically handled:
GET /api/auth/google/callback
```

### Refresh Token
```bash
POST /api/auth/refresh
{
  "refreshToken": "your-refresh-token"
}
```

### Logout
```bash
POST /api/auth/logout
{
  "refreshToken": "your-refresh-token"
}
```

---

## 📋 Security Checklist for Production

- [ ] Change JWT_SECRET to strong random value
- [ ] Change JWT_REFRESH_SECRET to different strong value
- [ ] Set NODE_ENV=production
- [ ] Disable DB_SYNCHRONIZE
- [ ] Configure proper CORS origins
- [ ] Set up OAuth2 credentials (Google, Facebook)
- [ ] Enable HTTPS only
- [ ] Set up rate limiting
- [ ] Configure Helmet.js
- [ ] Set up monitoring and alerts
- [ ] Regular security audits
- [ ] Implement account lockout after failed attempts
- [ ] Add 2FA (future enhancement)

---

## 🏢 How Big Companies Do It

### Password Storage
- **Google**: Uses Argon2 and bcrypt
- **Facebook**: Uses bcrypt with high rounds
- **GitHub**: Uses bcrypt
- **Netflix**: Uses bcrypt

### Our Implementation
```typescript
// Same approach as industry leaders
await bcrypt.hash(password, rounds); // 10 rounds default
// Can increase to 12-14 for sensitive apps
```

### Token Management
- **JWT**: Stateless for scalability (like Auth0, AWS Cognito)
- **Refresh Tokens**: Stored in DB with rotation (like Spotify, Netflix)
- **Revocation**: Immediate logout capability

### OAuth2
- Follows OAuth 2.0 spec (RFC 6749)
- Same flow as Google Sign-In, Facebook Login
- Provider handles authentication, we handle authorization

---

## 🔄 Future Enhancements

1. **Rate Limiting** - Prevent brute force
2. **2FA/MFA** - Two-factor authentication
3. **Email Verification** - Verify email on signup
4. **Password Reset** - Forgot password flow
5. **Account Lockout** - After N failed attempts
6. **Session Management** - Track active sessions
7. **Audit Logging** - Log all authentication events
8. **IP Whitelisting** - For admin accounts
9. **Device Management** - See logged-in devices
10. **SSO** - Single Sign-On for enterprise

---

**Security is layered and follows OWASP guidelines and industry standards.**

