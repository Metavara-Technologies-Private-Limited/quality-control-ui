# Backend Integration Guide

## Quick Start

1. **Set Environment Variable**
   ```env
   VITE_API_BASE_URL=https://qcb.xyz.in/api
   ```

2. **Database Setup** - Create PostgreSQL tables (see schema below)

3. **Implement APIs** - Match endpoints in `src/services/api.ts`

4. **Authentication** - JWT tokens, store in `localStorage` as `auth_token`

---

## API Endpoints

**Base URL:** `https://qcb.xyz.in/api`

### Authentication
- `POST /auth/login/` - Returns `{token, user: {id, username, email, role}}`
- `POST /auth/logout/`
- `POST /auth/refresh/`

### CRUD Endpoints
- `GET/POST/PUT/DELETE /clinics/`
- `GET/POST/PUT/DELETE /departments/?clinic_id={id}`
- `GET/POST/PUT/DELETE /equipments/?dep_id={id}`
- `GET/POST/PUT/DELETE /parameters/?equipment_id={id}`
- `GET/POST/PUT/DELETE /equipment-details/?equipment_id={id}`
- `GET/POST/PUT/DELETE /test-types/`

### Dashboard
- `GET /dashboard/data/` - All dashboard data
- `GET /dashboard/parameter-chart/?equipment_ids=1,2&parameter_id=1`
- `GET /dashboard/recent-activities/?limit=10`
- `GET /dashboard/incidents/`
- `GET /dashboard/averages/?equipment_ids=1,2&parameter_id=1`
- `GET /dashboard/assignees/?equipment_id=1`
- `POST /dashboard/assignees/` - Assign personnel
- `DELETE /dashboard/assignees/?equipment_id=1&assignee_id=2`

**All requests need:** `Authorization: Bearer <token>`

---

## Database Schema

```sql
-- Clinic
CREATE TABLE clinic (id SERIAL PRIMARY KEY, name VARCHAR(255));

-- Department
CREATE TABLE department (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    clinic_id INTEGER REFERENCES clinic(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Equipments
CREATE TABLE equipments (
    id SERIAL PRIMARY KEY,
    equipment_name VARCHAR(255),
    equipment_type VARCHAR(100),
    manufacturer VARCHAR(255),
    model VARCHAR(255),
    serial_number VARCHAR(100),
    last_calibrated DATE,
    next_calibration_due DATE,
    status VARCHAR(50) DEFAULT 'active',
    dep_id INTEGER REFERENCES department(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Equipment_Details
CREATE TABLE equipment_details (
    id SERIAL PRIMARY KEY,
    equipment_num VARCHAR(100),
    make VARCHAR(255),
    model VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    equipment_id INTEGER REFERENCES equipments(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Parameters (Content as JSONB)
CREATE TABLE parameters (
    id SERIAL PRIMARY KEY,
    parameter_name VARCHAR(255),
    equipment_id INTEGER REFERENCES equipments(id),
    is_active BOOLEAN DEFAULT TRUE,
    Content JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users (for Auth)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(150) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,  -- 'technician', 'admin', 'user'
    name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Parameters.Content JSONB Format:**
```json
{
  "min_value": 36.5,
  "max_value": 37.5,
  "default_value": 37.0,
  "unit": "°C",
  "control_limits": {
    "warning_min": 36.0,
    "warning_max": 38.0,
    "critical_min": 35.0,
    "critical_max": 39.0
  }
}
```

---

## Response Formats

**Success:**
```json
{
  "id": 1,
  "equipment_name": "Incubator A",
  "dep_id": 1,
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Error:**
```json
{
  "error": "Error message",
  "status": "error"
}
```

---

## Migration Steps

1. Replace mock data imports with API calls
2. Update `loadEquipments()` → `equipmentApi.getAll()`
3. Update `loadParameters()` → `parameterApi.getAll()`
4. Add error handling and loading states
5. Test each component

**Files to update:**
- `src/pages/Dashboard.tsx`
- `src/components/Configuration/*.tsx`
- `src/components/Dashboard/*.tsx`

---

## Authentication Setup

**Frontend expects:**
- Login endpoint returns: `{token: "jwt_token", user: {role: "admin"|"technician"|"user"}}`
- Token stored in `localStorage` as `auth_token`
- Token sent in header: `Authorization: Bearer <token>`
- 401 errors redirect to `/login`

**To implement:**
1. Create `src/pages/Login.tsx`
2. Add protected routes in `src/AppRoute.tsx`
3. Add `authApi` to `src/services/api.ts`

---

## CORS Configuration

Allow frontend origin:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3006",
    "https://qc.xyz.in",
]
```

---

## Key Files

- `src/services/api.ts` - All API endpoints defined
- `src/types/index.ts` - TypeScript types (match these!)
- `src/utils/mockData.ts` - Mock data structure (reference)

---

**For detailed examples, see code comments in `src/services/api.ts`**

