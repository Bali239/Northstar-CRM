import { App as AntdApp, ConfigProvider } from "antd";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthBootstrap } from "./features/auth/AuthBootstrap";
import { LoginPage } from "./features/auth/LoginPage";
import { ProtectedRoute } from "./features/auth/ProtectedRoute";
import { DashboardLayout } from "./features/layout/DashboardLayout";
import { OverviewPage } from "./features/dashboard/OverviewPage";
import ContactsPage from "./features/contacts/ContactsPage";

export default function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#e65b42",
          colorInfo: "#e65b42",
          borderRadius: 6,
          fontFamily: "'DM Sans', sans-serif",
        },
        components: {
          Button: { controlHeight: 42, fontWeight: 600 },
          Input: { activeBorderColor: "#e65b42", hoverBorderColor: "#e65b42" },
          Table: { headerBg: "#f7f8f5" },
        },
      }}
    >
      <AntdApp>
        <AuthBootstrap />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route index element={<OverviewPage />} />
              <Route path="contacts" element={<ContactsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
      </AntdApp>
    </ConfigProvider>
  );
}
