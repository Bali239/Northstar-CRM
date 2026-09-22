import { useState } from "react";
import {
  App as AntdApp,
  Avatar,
  Button,
  Drawer,
  Layout,
  Menu,
  Popconfirm,
  Typography,
} from "antd";
import {
  CompassOutlined,
  ContactsOutlined,
  DashboardOutlined,
  LineChartOutlined,
  LogoutOutlined,
  MenuOutlined,
  OrderedListOutlined,
} from "@ant-design/icons";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../config/supabase";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { clearSession } from "../auth/authSlice";

const navItems = [
  { key: "/", icon: <DashboardOutlined />, label: "Overview" },
  { key: "/contacts", icon: <ContactsOutlined />, label: "Contacts" },
  { key: "/analytics", icon: <LineChartOutlined />, label: "Analytics" },
  { key: "/activity", icon: <OrderedListOutlined />, label: "Activity" },
];

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isDemo } = useAppSelector((state) => state.auth);
  const { message } = AntdApp.useApp();
  const name =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "Operator";

  const signOut = async () => {
    if (!isDemo) await supabase.auth.signOut();
    dispatch(clearSession());
    message.success("You have been signed out.");
    navigate("/login", { replace: true });
  };

  const navigation = (
    <div className="flex h-full flex-col bg-[#061c31] px-4 py-6 text-sky-50">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-sky-500 text-lg font-bold text-[#061c31] shadow-lg shadow-cyan-900/40 animate-pulse-glow">
          <CompassOutlined />
        </div>
        <div>
          <span className="block text-sm font-extrabold tracking-[0.22em]">NORTHSTAR</span>
          <span className="block text-[10px] uppercase tracking-[0.25em] text-sky-200/80">
            Relationship OS
          </span>
        </div>
      </div>

      <Typography.Text className="px-2 pb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-sky-300/80">
        Workspace
      </Typography.Text>

      <Menu
        mode="inline"
        theme="dark"
        selectedKeys={[location.pathname === "/" ? "/" : location.pathname]}
        className="!border-0 !bg-transparent"
        items={navItems.map((item) => ({
          key: item.key,
          icon: item.icon,
          label: (
            <NavLink
              to={item.key}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block rounded-xl px-2 py-1.5 transition ${
                  isActive
                    ? "text-cyan-300"
                    : "text-sky-100/75 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ),
        }))}
      />

      <div className="mt-auto rounded-2xl border border-sky-700/60 bg-sky-950/40 p-4 shadow-inner shadow-sky-950/30">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-300/80">
          Workspace status
        </span>
        <div className="mt-3 flex items-center gap-2 text-sm font-medium text-emerald-300">
          <span className="size-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.8)]" />
          Live
        </div>
      </div>
    </div>
  );

  return (
    <Layout className="min-h-screen !bg-slate-100">
      <Layout.Sider
        width={268}
        className="!hidden !bg-[#061c31] shadow-[0_20px_50px_rgba(15,23,42,0.18)] lg:!fixed lg:!left-0 lg:!top-0 lg:!bottom-0 lg:!block lg:!h-screen lg:!overflow-y-auto"
      >
        {navigation}
      </Layout.Sider>

      <Drawer
        placement="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        closable={false}
        size={268}
        className="lg:hidden [&_.ant-drawer-body]:!p-0"
      >
        {navigation}
      </Drawer>

      <Layout className="min-w-0 !bg-slate-100 lg:!ml-[268px]">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-xl md:px-8">
          <Button
            className="!flex lg:!hidden"
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setMobileOpen(true)}
          />

          <div className="hidden items-center text-sm text-slate-500 sm:flex">
            <span>Workspace</span>
            <span className="mx-2 text-slate-300">/</span>
            <span className="font-medium text-slate-800">
              {location.pathname === "/contacts"
                ? "Contacts"
                : location.pathname === "/analytics"
                  ? "Analytics"
                  : location.pathname === "/activity"
                    ? "Activity"
                    : "Overview"}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <Typography.Text className="hidden text-xs text-slate-500 sm:block">
              {user?.email}
            </Typography.Text>
            <Avatar className="!bg-sky-100 !text-sky-700 !font-semibold">
              {name.slice(0, 1).toUpperCase()}
            </Avatar>
            <Popconfirm
              title="Sign out of Northstar?"
              onConfirm={() => void signOut()}
              okText="Sign out"
            >
              <Button type="text" aria-label="Sign out" icon={<LogoutOutlined />} />
            </Popconfirm>
          </div>
        </header>

        <Layout.Content className="min-h-[calc(100vh-72px)] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
