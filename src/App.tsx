import { App as AntdApp, ConfigProvider } from "antd";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthBootstrap } from "./features/auth/AuthBootstrap";
import { LoginPage } from "./features/auth/LoginPage";
import { ProtectedRoute } from "./features/auth/ProtectedRoute";
import { DashboardLayout } from "./features/layout/DashboardLayout";
import { OverviewPage } from "./features/dashboard/OverviewPage";
import ContactsPage from "./features/contacts/ContactsPage";
import { AnalyticsPage } from "./features/analytics/AnalyticsPage";
import { ActivityPage } from "./features/activity/ActivityPage";

export default function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#0ea5e9",
          colorInfo: "#06b6d4",
          colorSuccess: "#10b981",
          colorWarning: "#f59e0b",
          colorText: "#12304a",
          colorTextSecondary: "#5e7488",
          colorBgLayout: "#f4f8fb",
          colorBorder: "#dbe7ef",
          borderRadius: 10,
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        },
        components: {
          Button: { controlHeight: 42, fontWeight: 600, borderRadius: 8 },
          Input: { activeBorderColor: "#0ea5e9", hoverBorderColor: "#38bdf8" },
          Select: { optionSelectedBg: "#e0f2fe" },
          Card: { paddingLG: 24, borderRadiusLG: 14 },
          Table: { headerBg: "#f0f7fb", headerColor: "#36556d", rowHoverBg: "#f7fcff" },
          Menu: { itemSelectedBg: "#e0f2fe", itemSelectedColor: "#0284c7", itemBorderRadius: 8 },
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
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="activity" element={<ActivityPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
      </AntdApp>
    </ConfigProvider>
  );
}
