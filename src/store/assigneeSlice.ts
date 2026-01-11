import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { employeeApi } from "@/services/api";
import type { Assignee } from "@/types";

type AssigneeState = {
  data: Assignee[];
  loading: boolean;
  error: string | null;
};

const initialState: AssigneeState = {
  data: [],
  loading: false,
  error: null,
};

// Fetch assignees by clinic
export const fetchAssigneesByClinic = createAsyncThunk(
  "assignees/fetchByClinic",
  async (clinicId: number) => {
    const res = await employeeApi.getByClinic(clinicId);
    return res.data;
  }
);

const assigneeSlice = createSlice({
  name: "assignees",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssigneesByClinic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssigneesByClinic.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAssigneesByClinic.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to load assignees";
      });
  },
});

export default assigneeSlice.reducer;
