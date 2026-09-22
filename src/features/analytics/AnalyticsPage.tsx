import { Card, Col, Empty, Row, Statistic, Tag, Typography } from "antd";
import {
  ContactsOutlined,
  FieldTimeOutlined,
  RiseOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { useAppSelector } from "../../app/hooks";
import { useGetContactsQuery } from "../contacts/contactsApi";

const statuses = ["lead", "active", "inactive"] as const;

const formatMonthLabel = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short" });

function buildMonthlyTrend(contacts: { created_at: string }[]) {
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: formatMonthLabel(date),
      total: 0,
    };
  });

  contacts.forEach((contact) => {
    const created = new Date(contact.created_at);
    const key = `${created.getFullYear()}-${created.getMonth()}`;
    const entry = months.find((month) => month.key === key);
    if (entry) entry.total += 1;
  });

  return months;
}

export function AnalyticsPage() {
  const isDemo = useAppSelector((state) => state.auth.isDemo);
  const { data: contacts = [], isLoading } = useGetContactsQuery({
    search: "",
    status: "all",
    source: "all",
    sort: "newest",
    createdFrom: "",
    createdTo: "",
    demo: isDemo,
  });

  const sourceCounts = contacts.reduce<Record<string, number>>((counts, contact) => {
    counts[contact.source] = (counts[contact.source] ?? 0) + 1;
    return counts;
  }, {});
  const sourceEntries = Object.entries(sourceCounts).sort(([, left], [, right]) => right - left);
  const maxSourceCount = Math.max(...sourceEntries.map(([, count]) => count), 1);

  const monthlyTrend = buildMonthlyTrend(contacts);
  const maxMonthlyCount = Math.max(...monthlyTrend.map((month) => month.total), 1);

  const trendLine = monthlyTrend
    .map((month, index) => {
      const x = 24 + index * 52;
      const y = 126 - (month.total / maxMonthlyCount) * 90;
      return `${index === 0 ? "M" : "L"}${x} ${y}`;
    })
    .join(" ");

  const trendArea = `${trendLine} L ${24 + (monthlyTrend.length - 1) * 52} 126 L ${24} 126 Z`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Typography.Text className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Workspace intelligence
          </Typography.Text>
          <Typography.Title className="!mb-1 !mt-2 !text-3xl !leading-tight !text-slate-900 md:!text-4xl">
            Analytics
          </Typography.Title>
          <Typography.Paragraph type="secondary" className="!mb-0">
            A clear read on the shape and momentum of your relationship graph.
          </Typography.Paragraph>
        </div>

        <Tag color="blue" className="!rounded-full !px-3 !py-1 !text-sm !font-medium">
          All contacts
        </Tag>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <Card bordered={false} className="!h-full !rounded-2xl !border-0 !bg-white/90 !shadow-[0_15px_35px_rgba(15,23,42,0.06)]">
            <Statistic
              title={<span className="text-slate-500">Total contacts</span>}
              value={contacts.length}
              prefix={<ContactsOutlined className="text-sky-600" />}
              loading={isLoading}
              valueStyle={{ color: "#0f172a", fontSize: 28, fontWeight: 700 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card bordered={false} className="!h-full !rounded-2xl !border-0 !bg-gradient-to-br from-cyan-50 to-sky-100 !shadow-[0_15px_35px_rgba(14,165,233,0.08)]">
            <Statistic
              title={<span className="text-slate-500">Active rate</span>}
              value={contacts.length ? Math.round((contacts.filter((contact) => contact.status === "active").length / contacts.length) * 100) : 0}
              suffix="%"
              prefix={<RiseOutlined className="text-cyan-600" />}
              loading={isLoading}
              valueStyle={{ color: "#0f172a", fontSize: 28, fontWeight: 700 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card bordered={false} className="!h-full !rounded-2xl !border-0 !bg-white/90 !shadow-[0_15px_35px_rgba(15,23,42,0.06)]">
            <Statistic
              title={<span className="text-slate-500">Leads</span>}
              value={contacts.filter((contact) => contact.status === "lead").length}
              prefix={<UserAddOutlined className="text-violet-600" />}
              loading={isLoading}
              valueStyle={{ color: "#0f172a", fontSize: 28, fontWeight: 700 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card bordered={false} className="!h-full !rounded-2xl !border-0 !bg-white/90 !shadow-[0_15px_35px_rgba(15,23,42,0.06)]">
            <Statistic
              title={<span className="text-slate-500">Needs attention</span>}
              value={contacts.filter((contact) => contact.status === "inactive").length}
              prefix={<FieldTimeOutlined className="text-amber-600" />}
              loading={isLoading}
              valueStyle={{ color: "#0f172a", fontSize: 28, fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <Card
          bordered={false}
          title={<span className="text-lg font-semibold text-slate-800">New contacts by month</span>}
          extra={<Typography.Text type="secondary">6 month histogram</Typography.Text>}
          className="!rounded-2xl !border-0 !bg-white/90 !shadow-[0_15px_35px_rgba(15,23,42,0.06)]"
        >
          <div className="mt-3 rounded-2xl bg-slate-50 p-4">
            <svg viewBox="0 0 360 180" className="h-52 w-full" role="img" aria-label="Monthly contact trend">
              <defs>
                <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.38" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              {[0, 1, 2, 3].map((line) => (
                <line
                  key={line}
                  x1="20"
                  x2="336"
                  y1={20 + line * 34}
                  y2={20 + line * 34}
                  stroke="#dbeafe"
                  strokeDasharray="4 8"
                />
              ))}
              <path d={trendArea} fill="url(#trendFill)" />
              <path d={trendLine} fill="none" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" />
              {monthlyTrend.map((month, index) => {
                const x = 24 + index * 52;
                const y = 126 - (month.total / maxMonthlyCount) * 90;
                return (
                  <g key={month.key}>
                    <circle cx={x} cy={y} r="5" fill="#0ea5e9" />
                    <text x={x} y="170" textAnchor="middle" fontSize="10" fill="#64748b">
                      {month.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </Card>

        <Card
          bordered={false}
          title={<span className="text-lg font-semibold text-slate-800">Pipeline mix</span>}
          className="!rounded-2xl !border-0 !bg-white/90 !shadow-[0_15px_35px_rgba(15,23,42,0.06)]"
        >
          <div className="space-y-4 pt-2">
            {statuses.map((status) => {
              const count = contacts.filter((contact) => contact.status === status).length;
              return (
                <div key={status} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Tag
                      color={status === "active" ? "green" : status === "lead" ? "gold" : "default"}
                      className="!rounded-full !px-2.5 !py-0.5 !font-medium"
                    >
                      {status}
                    </Tag>
                    <strong className="text-slate-800">{count}</strong>
                  </div>
                  <span className="text-sm text-slate-500">
                    {contacts.length ? Math.round((count / contacts.length) * 100) : 0}%
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card
          bordered={false}
          title={<span className="text-lg font-semibold text-slate-800">Contacts by source</span>}
          extra={<Typography.Text type="secondary">Distribution</Typography.Text>}
          className="!rounded-2xl !border-0 !bg-white/90 !shadow-[0_15px_35px_rgba(15,23,42,0.06)]"
        >
          {sourceEntries.length ? (
            <div className="space-y-4 pt-2">
              {sourceEntries.map(([source, count]) => (
                <div key={source}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{source}</span>
                    <span className="text-slate-500">{count}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400"
                      style={{ width: `${(count / maxSourceCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty description="No contact data yet" />
          )}
        </Card>

        <Card
          bordered={false}
          title={<span className="text-lg font-semibold text-slate-800">Status velocity</span>}
          className="!rounded-2xl !border-0 !bg-white/90 !shadow-[0_15px_35px_rgba(15,23,42,0.06)]"
        >
          <div className="space-y-4 pt-2">
            {statuses.map((status) => {
              const count = contacts.filter((contact) => contact.status === status).length;
              return (
                <div key={status}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium capitalize text-slate-700">{status}</span>
                    <span className="text-slate-500">{count}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${
                        status === "active"
                          ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                          : status === "lead"
                            ? "bg-gradient-to-r from-amber-400 to-orange-400"
                            : "bg-gradient-to-r from-slate-400 to-slate-300"
                      }`}
                      style={{ width: `${contacts.length ? (count / contacts.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
