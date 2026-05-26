import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { AuthProvider } from "./contexts/AuthContext";
import { AppDialogProvider } from "./components/AppDialogProvider";
import "./styles/global.scss";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <AppDialogProvider>
        <AppRoutes />
      </AppDialogProvider>
    </AuthProvider>
  </BrowserRouter>
);



