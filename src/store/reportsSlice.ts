import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { parameterValueApi } from "@/services/api";

type ReportsState = {
  logs: any[];
  loading: boolean;
  progress: number;
  fetchedParams: number[]; // <- array instead of Set
};

const initialState: ReportsState = {
  logs: [],
  loading: false,
  progress: 0,
  fetchedParams: [],
};

// Progressive fetch: add logs as they arrive
export const fetchReports = createAsyncThunk<
  void, // no bulk return
  number[], // paramIds
  { rejectValue: string }
>("reports/fetchReports", async (paramIds, { dispatch }) => {
  let loaded = 0;

  for (const p of paramIds) {
    try {
      const res = await parameterValueApi.listByParameter(p);
      const logs = res.data ?? [];
      if (logs.length) {
        dispatch(addLogs(logs)); // add immediately
      }
    } catch {
      // ignore errors
    } finally {
      loaded++;
      dispatch(setProgress(Math.round((loaded / paramIds.length) * 100)));
    }
  }
});


const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    addLogs: (state, action: PayloadAction<any[]>) => {
      const existingIds = new Set(state.logs.map((l) => l.id));
      action.payload.forEach((log) => {
        if (!existingIds.has(log.id)) {
          state.logs.push(log);
        }
      });
    },
    setProgress: (state, action: PayloadAction<number>) => {
      state.progress = action.payload;
      state.loading = action.payload < 100;
    },
    markFetchedParams: (state, action: PayloadAction<number[]>) => {
      const merged = new Set([...state.fetchedParams, ...action.payload]);
      state.fetchedParams = Array.from(merged);
    },
    resetReports: (state) => {
      state.logs = [];
      state.progress = 0;
      state.loading = false;
      state.fetchedParams = [];
    },
  },
});

export const { addLogs, setProgress, markFetchedParams, resetReports } =
  reportsSlice.actions;

export default reportsSlice.reducer;
