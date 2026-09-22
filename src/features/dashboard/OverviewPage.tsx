import { useState } from "react";
import { Card, Col, Row, Statistic, Tag, Typography } from "antd";
import {
  ArrowUpOutlined,
  ContactsOutlined,
  FieldTimeOutlined,
  RiseOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { useAppSelector } from "../../app/hooks";
import { useGetContactsQuery } from "../contacts/contactsApi";

function buildMonthlyTrend(contacts: { created_at: string }[]) {
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleDateString("en-US", { month: "short" }),
      total: 0,
    };
  });

  contacts.forEach((contact) => {
    const created = new Date(contact.created_at);
    const match = months.find((month) => month.key === `${created.getFullYear()}-${created.getMonth()}`);
    if (match) match.total += 1;
  });

  return months;
}

export function OverviewPage() {
  const isDemo = useAppSelector((state) => state.auth.isDemo);
  const [now] = useState(() => Date.now());

  const { data: contacts = [], isLoading } = useGetContactsQuery({
    search: "",
    status: "all",
    source: "all",
    sort: "newest",
    createdFrom: "",
    createdTo: "",
    demo: isDemo,
  });

  const active = contacts.filter((contact) => contact.status === "active").length;
  const leads = contacts.filter((contact) => contact.status === "lead").length;
  const inactive = contacts.filter((contact) => contact.status === "inactive").length;
  const sourceCounts = contacts.reduce<Record<string, number>>((counts, contact) => {
    counts[contact.source] = (counts[contact.source] ?? 0) + 1;
    return counts;
  }, {});
  const recentContacts = contacts.slice(0, 4);
  const recentCount = contacts.filter(
    (contact) => now - new Date(contact.created_at).getTime() <= 30 * 24 * 60 * 60 * 1000,
  ).length;
  const maxSourceCount = Math.max(...Object.values(sourceCounts), 1);
  const sourceEntries = Object.entries(sourceCounts).sort(([, a], [, b]) => b - a);
  const monthlyTrend = buildMonthlyTrend(contacts);
  const maxMonthlyCount = Math.max(...monthlyTrend.map((month) => month.total), 1);
  const trendLine = monthlyTrend
    .map((month, index) => {
      const x = 24 + index * 52;
      const y = 126 - (month.total / maxMonthlyCount) * 90;
      return `${index === 0 ? "M" : "L"}${x} ${y}`;
    })
    .join(" ");
  const trendArea = `${trendLine} L ${24 + (monthlyTrend.length - 1) * 52} 126 L 24 126 Z`;

  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).toUpperCase();
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Typography.Text className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            {todayLabel}
          </Typography.Text>
          <Typography.Title className="!mb-1 !mt-2 !text-3xl !leading-tight !text-slate-900 md:!text-4xl">
            Good morning, operator.
          </Typography.Title>
          <Typography.Paragraph type="secondary" className="!mb-0">
            Here is the signal from your relationship graph.
          </Typography.Paragraph>
        </div>

        <Tag color="green" className="!rounded-full !px-3 !py-1 !text-sm !font-medium">
          ● Workspace live
        </Tag>
      </div>

      <section className="grid gap-4 rounded-[28px] border border-sky-100 bg-gradient-to-r from-sky-50 via-white to-emerald-50 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)] md:grid-cols-[auto_1fr_auto] md:items-center md:p-6">
        <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-[#102a43] to-[#0ea5e9] text-xl text-white shadow-lg shadow-sky-900/20">
          <RiseOutlined />
        </div>

        <div>
          <Typography.Text className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Why Northstar exists
          </Typography.Text>
          <Typography.Title level={3} className="!mt-2 !mb-1 !text-xl !text-slate-900 md:!text-2xl">
            Turn scattered customer details into clear next steps.
          </Typography.Title>
          <Typography.Paragraph className="!mb-0 !text-sm !leading-6 !text-slate-600">
            Northstar gives your team one calm place to understand every relationship,
            spot what needs attention, and move conversations forward with intent.
          </Typography.Paragraph>
        </div>

        <div className="flex flex-col gap-2 text-sm text-slate-600 md:items-end">
          <span className="font-medium text-slate-700">Centralize context</span>
          <span className="font-medium text-slate-700">Prioritize follow-ups</span>
          <span className="font-medium text-slate-700">Grow relationships</span>
        </div>
      </section>

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
            <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600">
              <ArrowUpOutlined />
              <span>{recentCount}</span>
              <span className="text-slate-500">added in the last 30 days</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card bordered={false} className="!h-full !rounded-2xl !border-0 !bg-gradient-to-br from-sky-100 to-cyan-50 !shadow-[0_15px_35px_rgba(14,165,233,0.08)]">
            <Statistic
              title={<span className="text-slate-500">Active relationships</span>}
              value={active}
              prefix={<RiseOutlined className="text-cyan-600" />}
              loading={isLoading}
              valueStyle={{ color: "#0f172a", fontSize: 28, fontWeight: 700 }}
            />
            <div className="mt-4 text-sm text-slate-600">
              <span className="font-semibold text-slate-800">
                {contacts.length ? Math.round((active / contacts.length) * 100) : 0}%
              </span>
              <span className="ml-1 text-slate-500">of all contacts</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card bordered={false} className="!h-full !rounded-2xl !border-0 !bg-white/90 !shadow-[0_15px_35px_rgba(15,23,42,0.06)]">
            <Statistic
              title={<span className="text-slate-500">New leads</span>}
              value={leads}
              prefix={<UserAddOutlined className="text-violet-600" />}
              loading={isLoading}
              valueStyle={{ color: "#0f172a", fontSize: 28, fontWeight: 700 }}
            />
            <div className="mt-4 text-sm text-slate-500">Across all sources</div>
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card bordered={false} className="!h-full !rounded-2xl !border-0 !bg-white/90 !shadow-[0_15px_35px_rgba(15,23,42,0.06)]">
            <Statistic
              title={<span className="text-slate-500">Inactive contacts</span>}
              value={inactive}
              prefix={<FieldTimeOutlined className="text-amber-600" />}
              loading={isLoading}
              valueStyle={{ color: "#0f172a", fontSize: 28, fontWeight: 700 }}
            />
            <div className="mt-4 text-sm text-slate-500">Needs re-engagement</div>
          </Card>
        </Col>
      </Row>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <Card
          bordered={false}
          title={<span className="text-lg font-semibold text-slate-800">Relationship signal</span>}
          extra={<Typography.Text type="secondary">Actual source mix</Typography.Text>}
          className="!rounded-2xl !border-0 !bg-white/90 !shadow-[0_15px_35px_rgba(15,23,42,0.06)]"
        >
          <div className="mt-4 flex items-end gap-4">
            <div className="flex h-56 w-8 flex-col justify-between text-[11px] text-slate-400">
              {[maxSourceCount, Math.round(maxSourceCount * 0.66), Math.round(maxSourceCount * 0.33), 0].map((value) => (
                <span key={value}>{value}</span>
              ))}
            </div>

            <div className="flex-1">
              <div className="flex h-56 items-end gap-4 rounded-2xl bg-slate-50 px-3 pb-3 pt-5">
                {sourceEntries.map(([source, count]) => (
                  <div key={source} className="flex flex-1 flex-col items-center gap-3">
                    <div
                      className="w-full rounded-t-xl bg-gradient-to-t from-sky-500 to-cyan-300 shadow-[0_10px_25px_rgba(14,165,233,0.25)]"
                      style={{ height: `${Math.max((count / maxSourceCount) * 100, 12)}%` }}
                      title={`${source}: ${count}`}
                    />
                    <span className="text-[10px] uppercase tracking-[0.1em] text-slate-400">{source}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card
          bordered={false}
          title={<span className="text-lg font-semibold text-slate-800">Today&apos;s focus</span>}
          className="!rounded-2xl !border-0 !bg-white/90 !shadow-[0_15px_35px_rgba(15,23,42,0.06)]"
        >
          <div className="mt-2 space-y-3">
            {[
              ["Lead follow-up", `${leads} contacts are currently leads`],
              ["Active relationships", `${active} contacts are marked active`],
              ["Re-engagement", `${inactive} contacts are currently inactive`],
            ].map(([title, detail], index) => (
              <div
                key={title}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 font-semibold text-sky-700">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-800">{title}</div>
                  <div className="text-sm text-slate-500">{detail}</div>
                </div>
                <ArrowUpOutlined className="text-slate-400" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card
          bordered={false}
          title={<span className="text-lg font-semibold text-slate-800">Monthly growth</span>}
          className="!rounded-2xl !border-0 !bg-white/90 !shadow-[0_15px_35px_rgba(15,23,42,0.06)]"
        >
          <div className="mt-3 rounded-2xl bg-slate-50 p-4">
            <svg viewBox="0 0 360 180" className="h-52 w-full" role="img" aria-label="Monthly contact growth chart">
              <defs>
                <linearGradient id="overviewTrendFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              {[0, 1, 2, 3].map((line) => (
                <line
                  key={line}
                  x1="20"
                  x2="336"
                  y1={20 + line * 34}
                  y2={20 + line * 34}
                  stroke="#dcfce7"
                  strokeDasharray="4 8"
                />
              ))}
              <path d={`${trendLine} L ${24 + (monthlyTrend.length - 1) * 52} 126 L 24 126 Z`} fill="url(#overviewTrendFill)" />
              <path d={trendLine} fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
              {monthlyTrend.map((month, index) => {
                const x = 24 + index * 52;
                const y = 126 - (month.total / maxMonthlyCount) * 90;
                return (
                  <g key={month.key}>
                    <circle cx={x} cy={y} r="4.5" fill="#22c55e" />
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
          title={<span className="text-lg font-semibold text-slate-800">Pipeline momentum</span>}
          className="!rounded-2xl !border-0 !bg-white/90 !shadow-[0_15px_35px_rgba(15,23,42,0.06)]"
        >
          <div className="space-y-4 pt-2">
            {["lead", "active", "inactive"].map((status) => {
              const count = contacts.filter((contact) => contact.status === status).length;
              return (
                <div key={status}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium capitalize text-slate-700">{status}</span>
                    <span className="text-slate-500">{count} contacts</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400"
                      style={{ width: `${contacts.length ? (count / contacts.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card
          bordered={false}
          title={<span className="text-lg font-semibold text-slate-800">Recent activity</span>}
          className="!rounded-2xl !border-0 !bg-white/90 !shadow-[0_15px_35px_rgba(15,23,42,0.06)]"
        >
          <div className="space-y-3">
            {recentContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3"
              >
                <span
                  className={`inline-block size-2.5 rounded-full ${
                    contact.status === "active"
                      ? "bg-emerald-500"
                      : contact.status === "lead"
                        ? "bg-sky-500"
                        : "bg-amber-500"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-slate-800">
                    {contact.full_name} added from {contact.source}
                  </div>
                  <div className="text-sm text-slate-500">
                    {contact.company} · {formatDate(contact.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card
          bordered={false}
          title={<span className="text-lg font-semibold text-slate-800">Lead quality</span>}
          className="!rounded-2xl !border-0 !bg-white/90 !shadow-[0_15px_35px_rgba(15,23,42,0.06)]"
        >
          <div className="space-y-4 pt-2">
            {sourceEntries.map(([source, count]) => (
              <div key={source}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{source}</span>
                  <span className="text-slate-500">{count}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-sky-400"
                    style={{ width: `${(count / maxSourceCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}