import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { clinicApi } from "@/services/api";
import type { Clinic } from "@/types";

type ClinicState = {
  data: Clinic | null;       // Lab departments only (type === "lab")
  rawData: Clinic | null;    // All departments unfiltered
  clinicData: Clinic | null; // Clinical departments only (type === "clinical")
  labData: Clinic | null;    // Lab departments only (type === "lab")
  loading: boolean;
  error: string | null;
};

const initialState: ClinicState = {
  data: null,
  rawData: null,
  clinicData: null,
  labData: null,
  loading: false,
  error: null,
};

const filterActiveByType = (
  clinic: Clinic | null,
  type: "lab" | "clinical" | null, // null = all departments
): Clinic | null => {
  if (!clinic) return null;

  return {
    ...clinic,
    department: clinic.department
      .filter((d) => d.is_active)
      .filter((d) => (type ? (d as any).type === type : true))
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

        // Lab departments (type === "lab") — used by QC Lab pages
        state.data      = filterActiveByType(action.payload, "lab");
        state.labData   = filterActiveByType(action.payload, "lab");

        // Clinical departments (type === "clinical") — used by Clinical pages
        state.clinicData = filterActiveByType(action.payload, "clinical");
      })
      .addCase(fetchClinic.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to load clinic";
      });
  },
});

export default clinicSlice.reducer;