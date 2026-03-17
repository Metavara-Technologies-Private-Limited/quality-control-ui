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

// Parallel fetch; abort signal prevents stale dispatches. All logs
// are batched into a single dispatch to minimise Redux re-renders.
export const fetchReports = createAsyncThunk<
  void,
  number[],
  { rejectValue: string }
>("reports/fetchReports", async (paramIds, { dispatch, signal }) => {
  let loaded = 0;
  const allLogs: any[] = [];

  await Promise.all(
    paramIds.map(async (p) => {
      if (signal.aborted) return;
      try {
        const res = await parameterValueApi.listByParameter(p);
        if (!signal.aborted && res.data?.length) {
          allLogs.push(...res.data);
        }
      } catch {
        // ignore
      } finally {
        loaded++;
        if (!signal.aborted) {
          dispatch(setProgress(Math.round((loaded / paramIds.length) * 100)));
        }
      }
    }),
  );

  // Single Redux dispatch → single component re-render per poll
  if (!signal.aborted && allLogs.length > 0) {
    dispatch(addLogs(allLogs));
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
