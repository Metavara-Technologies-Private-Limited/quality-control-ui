import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { parameterValueApi } from "@/services/api";
import type { RootState } from "@/store";

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
  { rejectValue: string; state: RootState }
>("reports/fetchReports", async (paramIds, { dispatch, signal, getState }) => {
  if (!paramIds.length) {
    dispatch(setProgress(100));
    return;
  }

  const existingLogs = getState().reports.logs;
  const knownLogIds = new Set(
    existingLogs.map((log: any) => log?.id).filter((id) => id != null),
  );

  let loaded = 0;
  let lastProgress = -1;
  const allLogs: any[] = [];
  const queue = [...paramIds];
  const concurrency = Math.min(8, queue.length);

  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (queue.length > 0) {
        if (signal.aborted) return;

        const p = queue.shift();
        if (p == null) return;

        try {
          const res = await parameterValueApi.listByParameter(p, signal);
          if (!signal.aborted && res.data?.length) {
            res.data.forEach((row: any) => {
              const rowId = row?.id;
              if (rowId == null || knownLogIds.has(rowId)) return;
              knownLogIds.add(rowId);
              allLogs.push(row);
            });
          }
        } catch {
          // ignore
        } finally {
          loaded++;
          if (!signal.aborted) {
            const nextProgress = Math.round((loaded / paramIds.length) * 100);
            if (nextProgress !== lastProgress) {
              lastProgress = nextProgress;
              dispatch(setProgress(nextProgress));
            }
          }
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
          existingIds.add(log.id);
        }
      });
    },
    setProgress: (state, action: PayloadAction<number>) => {
      state.progress = action.payload;
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.progress = 0;
      })
      .addCase(fetchReports.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchReports.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { addLogs, setProgress, markFetchedParams, resetReports } =
  reportsSlice.actions;

export default reportsSlice.reducer;
