import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { clinicApi } from "@/services/api";
import type { Clinic } from "@/types";

type ClinicState = {
  data: Clinic | null;
  rawData: Clinic | null;
  loading: boolean;
  error: string | null;
};

const initialState: ClinicState = {
  data: null,
  rawData: null,
  loading: false,
  error: null,
};

const filterActiveClinicData = (clinic: Clinic | null): Clinic | null => {
  if (!clinic) return null;

  return {
    ...clinic,
    department: clinic.department
      .filter((d) => d.is_active)
      .map((d) => ({
        ...d,
        equipments: d.equipments
          .filter((e) => e.is_active)
          .map((e) => ({
            ...e,
            parameters: e.parameters.filter((p) => !p.is_deleted),
          })),
      })),
  };
};

// Fetch clinic once when app loads
export const fetchClinic = createAsyncThunk(
  "clinic/fetchClinic",
  async (clinicId: number) => {
    const res = await clinicApi.getById(clinicId);
    return res.data;
  },
);

const clinicSlice = createSlice({
  name: "clinic",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClinic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClinic.fulfilled, (state, action) => {
        state.loading = false;
        state.rawData = action.payload;
        state.data = filterActiveClinicData(action.payload);
      })
      .addCase(fetchClinic.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to load clinic";
      });
  },
});

export default clinicSlice.reducer;
