import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { taskApi } from "@/services/api";
import { TASK_STATUS_MAP, type Task } from "@/types";
import { RootState } from ".";

type TaskState = {
  data: Task[];
  loading: boolean;
  error: string | null;
  clinicId: number | null;
};

const initialState: TaskState = {
  data: [],
  loading: false,
  error: null,
  clinicId: null,
};

// ============================
// FETCH ALL TASKS BY CLINIC
// ============================
export const fetchTasksByClinic = createAsyncThunk(
  "tasks/fetchByClinic",
  async (clinicId: number) => {
    const res = await taskApi.listByClinic(clinicId);
    return { clinicId, tasks: res.data };
  }
);

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasksByClinic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasksByClinic.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.tasks;
        state.clinicId = action.payload.clinicId;
      })
      .addCase(fetchTasksByClinic.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to load tasks";
      });
  },
});

export default taskSlice.reducer;
export const selectUITasks = (state: RootState) =>
  state.tasks.data.map((t) => ({
    ...t,
    status_label: TASK_STATUS_MAP[t.status] ?? "To - Do",
    due: t.due_date,
  }));
