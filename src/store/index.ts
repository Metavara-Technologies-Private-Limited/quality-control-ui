import { configureStore } from "@reduxjs/toolkit";
import clinicReducer from "./clinicSlice";
import assigneeReducer from "./assigneeSlice";

export const store = configureStore({
  reducer: {
    clinic: clinicReducer,
    assignees: assigneeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
