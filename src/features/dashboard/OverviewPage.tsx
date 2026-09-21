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

  const { data: contacts = [], isLoading } = useGetContactsQuery({
    search: "",
    status: "all",
    source: "all",
    sort: "newest",
    demo: isDemo,
  });

  const active = contacts.filter((contact) => contact.status === "active").length;
  const leads = contacts.filter((contact) => contact.status === "lead").length;

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <Typography.Text className="eyebrow">
            MONDAY, SEPTEMBER 21, 2026
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
              <ArrowUpOutlined /> 12% <em>this month</em>
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
              <ArrowUpOutlined /> 8.4% <em>this month</em>
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
              title="Avg. response time"
              value="4.2h"
              prefix={<FieldTimeOutlined />}
            />
            <span className="metric-trend muted">- 18m from last week</span>
          </Card>
        </Col>
      </Row>

      <div className="overview-grid">
        <Card
          className="signal-card"
          title="Relationship signal"
          extra={<Typography.Text type="secondary">Last 30 days</Typography.Text>}
        >
          <div className="signal-chart">
            <div className="chart-y">
              <span>120</span>
              <span>80</span>
              <span>40</span>
              <span>0</span>
            </div>

            <div className="chart-area">
              <div className="chart-line" />
              <div className="chart-bars">
                <i style={{ height: "32%" }} />
                <i style={{ height: "46%" }} />
                <i style={{ height: "38%" }} />
                <i style={{ height: "64%" }} />
                <i style={{ height: "53%" }} />
                <i style={{ height: "78%" }} />
                <i style={{ height: "67%" }} />
                <i style={{ height: "92%" }} />
                <i style={{ height: "73%" }} />
                <i style={{ height: "84%" }} />
              </div>
            </div>

            <div className="chart-x">
              <span>Aug 24</span>
              <span>Sep 07</span>
              <span>Sep 21</span>
            </div>
          </div>

          <div className="chart-legend">
            <span>
              <i className="dot coral" /> Engaged contacts
            </span>
            <span>
              <i className="dot navy" /> New conversations
            </span>
          </div>
        </Card>

        <Card className="focus-card" title="Today's focus">
          <div className="focus-item">
            <span className="focus-number">01</span>
            <div>
              <strong>Follow up with new leads</strong>
              <p>3 contacts waiting for a first touch</p>
            </div>
            <ArrowUpOutlined />
          </div>

          <div className="focus-item">
            <span className="focus-number">02</span>
            <div>
              <strong>Review quiet relationships</strong>
              <p>8 contacts have gone quiet this month</p>
            </div>
            <ArrowUpOutlined />
          </div>

          <div className="focus-item">
            <span className="focus-number">03</span>
            <div>
              <strong>Prepare weekly snapshot</strong>
              <p>Team update is due tomorrow</p>
            </div>
            <ArrowUpOutlined />
          </div>
        </Card>
      </div>
    </div>
  );
}