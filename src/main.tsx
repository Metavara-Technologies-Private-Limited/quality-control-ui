import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import App from "./App";
import theme from "./theme";
import { ViewProvider } from "./utils/viewContext";
import "./index.css";
import { ToastProvider } from "./components/Common/ToastProvider";
import { Provider } from "react-redux";
import { store } from "./store";
import { TabProvider } from "./utils/tabContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Provider store={store}>
          <ViewProvider>
            <TabProvider>
              <ToastProvider>
                <App />
              </ToastProvider>
            </TabProvider>
          </ViewProvider>
        </Provider>
      </ThemeProvider>
    </BrowserRouter>,
  // </React.StrictMode>,
);
