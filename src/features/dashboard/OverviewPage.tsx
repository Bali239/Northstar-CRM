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
    <div className="page-content">
      <div className="page-heading">
        <div>
          <Typography.Text className="eyebrow">
            {todayLabel}
          </Typography.Text>
          <Typography.Title>Good morning, operator.</Typography.Title>
          <Typography.Paragraph type="secondary">
            Here is the signal from your relationship graph.
          </Typography.Paragraph>
        </div>

        <Tag color="green" className="live-tag">
          ● Workspace live
        </Tag>
      </div>

      <section className="purpose-banner">
        <div className="purpose-mark">
          <RiseOutlined />
        </div>
        <div>
          <Typography.Text className="eyebrow">WHY NORTHSTAR EXISTS</Typography.Text>
          <Typography.Title level={3}>
            Turn scattered customer details into clear next steps.
          </Typography.Title>
          <Typography.Paragraph>
            Northstar gives your team one calm place to understand every relationship,
            spot what needs attention, and move conversations forward with intent.
          </Typography.Paragraph>
        </div>
        <div className="purpose-principles">
          <span>Centralize context</span>
          <span>Prioritize follow-ups</span>
          <span>Grow relationships</span>
        </div>
      </section>

      <Row gutter={[16, 16]} className="metric-row">
        <Col xs={24} sm={12} xl={6}>
          <Card className="metric-card">
            <Statistic
              title="Total contacts"
              value={contacts.length}
              prefix={<ContactsOutlined />}
              loading={isLoading}
            />
            <span className="metric-trend">
              <ArrowUpOutlined /> {recentCount} <em>added in the last 30 days</em>
            </span>
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card className="metric-card accent">
            <Statistic
              title="Active relationships"
              value={active}
              prefix={<RiseOutlined />}
              loading={isLoading}
            />
            <span className="metric-trend">
              {contacts.length ? Math.round((active / contacts.length) * 100) : 0}% <em>of all contacts</em>
            </span>
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card className="metric-card">
            <Statistic
              title="New leads"
              value={leads}
              prefix={<UserAddOutlined />}
              loading={isLoading}
            />
            <span className="metric-trend muted">Across all sources</span>
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card className="metric-card">
            <Statistic
              title="Inactive contacts"
              value={inactive}
              prefix={<FieldTimeOutlined />}
              loading={isLoading}
            />
            <span className="metric-trend muted">Needs re-engagement</span>
          </Card>
        </Col>
      </Row>

      <div className="overview-grid">
        <Card
          className="signal-card"
          title="Relationship signal"
          extra={<Typography.Text type="secondary">Contacts by source</Typography.Text>}
        >
          <div className="signal-chart">
            <div className="chart-y">
              <span>{maxSourceCount}</span>
              <span>{Math.round(maxSourceCount * 0.66)}</span>
              <span>{Math.round(maxSourceCount * 0.33)}</span>
              <span>0</span>
            </div>

            <div className="chart-area">
              <div className="chart-bars">
                {sourceEntries.map(([source, count]) => (
                  <i
                    key={source}
                    title={`${source}: ${count}`}
                    style={{ height: `${Math.max((count / maxSourceCount) * 100, 4)}%` }}
                  />
                ))}
              </div>
            </div>

            <div className="chart-x">
              {sourceEntries.map(([source]) => <span key={source}>{source}</span>)}
            </div>
          </div>

          <div className="chart-legend">
            <span>
              <i className="dot coral" /> Contacts by source
            </span>
          </div>
        </Card>

        <Card className="focus-card" title="Today's focus">
          {[
            ["Lead follow-up", `${leads} contacts are currently leads`],
            ["Active relationships", `${active} contacts are marked active`],
            ["Re-engagement", `${inactive} contacts are currently inactive`],
          ].map(([title, detail], index) => (
            <div className="focus-item" key={title}>
              <span className="focus-number">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <strong>{title}</strong>
                <p>{detail}</p>
              </div>
              <ArrowUpOutlined />
            </div>
          ))}
        </Card>
      </div>

      <div className="dashboard-lower-grid">
        <Card className="activity-card" title="Recent activity">
          <div className="activity-list">
            {recentContacts.map((contact) => (
              <div className="activity-item" key={contact.id}>
                <span className={`activity-dot ${contact.status === "active" ? "success" : contact.status === "lead" ? "info" : "warning"}`} />
                <div>
                  <strong>{contact.full_name} added from {contact.source}</strong>
                  <p>{contact.company} · {formatDate(contact.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="pipeline-card" title="Pipeline momentum">
          <div className="pipeline-list">
            {["lead", "active", "inactive"].map((status) => {
              const count = contacts.filter((contact) => contact.status === status).length;
              return (
                <div className="pipeline-row" key={status}>
                  <div>
                    <span>{status[0].toUpperCase() + status.slice(1)}</span>
                    <small>{count} contacts</small>
                  </div>
                  <div className="pipeline-bar">
                    <i style={{ width: `${contacts.length ? (count / contacts.length) * 100 : 0}%` }} />
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