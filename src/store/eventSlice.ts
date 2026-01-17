import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import { eventApi } from "@/services/api";

/* ---------------- HELPERS (moved from component) ---------------- */

const formatTime = (isoString?: string) => {
  if (!isoString) return "-";
  return new Date(isoString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDate = (isoString?: string) => {
  if (!isoString) return "-";
  return new Date(isoString).toLocaleDateString("en-GB");
};

/* ---------------- SLICE STATE ---------------- */

type EventState = {
  data: any[];
  loading: boolean;
  error: string | null;
  clinicId: number | null;
};

const initialState: EventState = {
  data: [],
  loading: false,
  error: null,
  clinicId: null,
};

/* ---------------- THUNK ---------------- */

export const fetchEventsByClinic = createAsyncThunk(
  "events/fetchByClinic",
  async (clinicId: number) => {
    const res = await eventApi.listByClinic(clinicId);
    const raw = res.data.results ?? res.data ?? [];
    return { clinicId, events: raw };
  }
);

/* ---------------- SLICE ---------------- */

const eventSlice = createSlice({
  name: "events",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEventsByClinic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventsByClinic.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.events;
        state.clinicId = action.payload.clinicId;
      })
      .addCase(fetchEventsByClinic.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to load events";
      });
  },
});

export default eventSlice.reducer;
export const selectUIEvents = (state: RootState) =>
    state.events.data.map((e: any) => ({
      id: e.id,
      name: e.event_name,
      description: e.description,
      createdBy: e.assignment ?? "-",
      createdDate: formatDate(e.created_at),
  
      scheduleType:
        e.schedule?.type === 2
          ? "Weekly"
          : e.schedule?.type === 1
          ? "One Time"
          : "Monthly",
  
      fromTime: formatTime(e.schedule?.from_time),
      toTime: formatTime(e.schedule?.to_time),
  
      startDate: formatDate(
        e.schedule?.start_date || e.schedule?.one_time_date
      ),
      endDate: formatDate(
        e.schedule?.end_date || e.schedule?.one_time_date
      ),
  
      days: e.schedule?.days ? e.schedule.days.join(", ") : "-",
      recurDuration: e.schedule?.recurring_duration,
  
      equipmentCount: e.equipments?.length || 0,
      parameterCount: e.parameters?.length || 0,
  
      equipmentsDetails: (e.equipments || []).map((eq: any) => ({
        equipment_name: eq.equipment__equipment_name,
        parameters: (e.parameters || []).map((p: any) => ({
          name: p.parameter__parameter_name,
        })),
      })),
    }));
  