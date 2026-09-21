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

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <Typography.Text className="eyebrow">WORKSPACE INTELLIGENCE</Typography.Text>
          <Typography.Title>Analytics</Typography.Title>
          <Typography.Paragraph type="secondary">
            A clear read on the shape and momentum of your relationship graph.
          </Typography.Paragraph>
        </div>
        <Tag color="blue" className="live-tag">All contacts</Tag>
      </div>

      <Row gutter={[16, 16]} className="metric-row">
        <Col xs={24} sm={12} xl={6}><Card className="metric-card"><Statistic title="Total contacts" value={contacts.length} prefix={<ContactsOutlined />} loading={isLoading} /></Card></Col>
        <Col xs={24} sm={12} xl={6}><Card className="metric-card accent"><Statistic title="Active rate" value={contacts.length ? Math.round((contacts.filter((contact) => contact.status === "active").length / contacts.length) * 100) : 0} suffix="%" prefix={<RiseOutlined />} loading={isLoading} /></Card></Col>
        <Col xs={24} sm={12} xl={6}><Card className="metric-card"><Statistic title="Leads" value={contacts.filter((contact) => contact.status === "lead").length} prefix={<UserAddOutlined />} loading={isLoading} /></Card></Col>
        <Col xs={24} sm={12} xl={6}><Card className="metric-card"><Statistic title="Needs attention" value={contacts.filter((contact) => contact.status === "inactive").length} prefix={<FieldTimeOutlined />} loading={isLoading} /></Card></Col>
      </Row>

      <div className="analytics-grid">
        <Card className="signal-card" title="Contacts by source" extra={<Typography.Text type="secondary">Distribution</Typography.Text>}>
          {sourceEntries.length ? <div className="analytics-bars">
            {sourceEntries.map(([source, count]) => (
              <div className="analytics-bar-row" key={source}>
                <div className="analytics-bar-label"><span>{source}</span><strong>{count}</strong></div>
                <div className="analytics-bar-track"><i style={{ width: `${(count / maxSourceCount) * 100}%` }} /></div>
              </div>
            ))}
          </div> : <Empty description="No contact data yet" />}
        </Card>
        <Card className="focus-card" title="Pipeline mix">
          <div className="analytics-status-list">
            {statuses.map((status) => {
              const count = contacts.filter((contact) => contact.status === status).length;
              return <div className="analytics-status-row" key={status}><Tag color={status === "active" ? "green" : status === "lead" ? "gold" : "default"}>{status}</Tag><strong>{count}</strong><span>{contacts.length ? Math.round((count / contacts.length) * 100) : 0}%</span></div>;
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
