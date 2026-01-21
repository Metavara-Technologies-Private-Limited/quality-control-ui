import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import { taskEventApi } from "@/services/api";

/* ---------------- STATE ---------------- */

type TaskEventState = {
  data: any[];
  loading: boolean;
  error: string | null;
  departmentId: number | null;
};

const initialState: TaskEventState = {
  data: [],
  loading: false,
  error: null,
  departmentId: null,
};

/* ---------------- THUNK ---------------- */

export const fetchTaskEventsByDepartment = createAsyncThunk(
  "taskEvents/fetchByDepartment",
  async (departmentId: number) => {
    const res = await taskEventApi.listByDepartment(departmentId);
    return { departmentId, events: res.data };
  },
);

/* ---------------- SLICE ---------------- */

const taskEventSlice = createSlice({
  name: "taskEvents",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTaskEventsByDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskEventsByDepartment.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.events;
        state.departmentId = action.payload.departmentId;
      })
      .addCase(fetchTaskEventsByDepartment.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to load task events";
      });
  },
});

export default taskEventSlice.reducer;

/* ---------------- UI SELECTOR ---------------- */

export const selectUITaskEvents = (state: RootState) =>
  state.taskEvents.data.map((e: any) => ({
    id: e.id,
    name: e.name,
    eventId: e.event,
    departmentId: e.dep,
    createdAt: e.created_at,
  }));
