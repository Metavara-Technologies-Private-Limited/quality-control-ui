# VIDAI Quality Control UI

React-based Quality Control dashboard for fertility care management.

## Quick Start

```bash
npm install
npm run dev
```

Set `.env` file:
```env
VITE_API_BASE_URL=https://qcb.xyz.in/api
```

## Tech Stack

- React 18 + TypeScript
- Material-UI (MUI)
- Vite
- Axios
- React Router

## User Roles

- **Technician** - Full access
- **Admin** - Full access + admin dashboard
- **User** - Read-only access

## Project Structure

```
src/
├── components/     # UI components
├── pages/          # Page components
├── services/       # API services (api.ts)
├── types/          # TypeScript types
└── utils/          # Utilities (mockData.ts)
```

## Backend Integration

**See:** `BACKEND_GUIDE.md` for:
- API endpoints
- Database schema
- Authentication setup
- Migration steps

## Current Status

- ✅ Frontend UI: 100% complete
- ⏳ API Integration: Pending (using mock data)
- ⏳ Authentication: Pending

## Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview build

---

## Packages needs to Install
- npm install papaparse
- npm install --save-dev @types/papaparse
- npm install xlsx
- npm install react-redux @reduxjs/toolkit lucide-react @mui/x-date-pickers dayjs

**Version:** 1.0.0
