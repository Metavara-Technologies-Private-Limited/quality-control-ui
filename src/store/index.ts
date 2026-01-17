import { configureStore } from "@reduxjs/toolkit";
import clinicReducer from "./clinicSlice";
import assigneeReducer from "./assigneeSlice";
import taskReducer from "./taskSlice";
import eventReducer from "./eventSlice";

export const store = configureStore({
  reducer: {
    clinic: clinicReducer,
    assignees: assigneeReducer,
    tasks: taskReducer,
    events: eventReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
