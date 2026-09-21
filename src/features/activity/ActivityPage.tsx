import { Card, Empty, Table, Tag, Typography } from "antd";
import { useAppSelector } from "../../app/hooks";
import { useGetContactsQuery } from "../contacts/contactsApi";
import type { Contact } from "../contacts/contactTypes";

export function ActivityPage() {
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
  const columns = [
    {
      title: "Contact",
      dataIndex: "full_name",
      key: "full_name",
      render: (name: string, contact: Contact) => <div className="contact-cell"><span className="contact-avatar">{name.slice(0, 1)}</span><div><strong>{name}</strong><small>{contact.company}</small></div></div>,
    },
    { title: "Event", key: "event", render: () => "Contact added to workspace" },
    { title: "Source", dataIndex: "source", key: "source" },
    { title: "Status", dataIndex: "status", key: "status", render: (status: Contact["status"]) => <Tag color={status === "active" ? "green" : status === "lead" ? "gold" : "default"}>{status.toUpperCase()}</Tag> },
    { title: "When", dataIndex: "created_at", key: "created_at", render: (date: string) => new Date(date).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) },
  ];

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <Typography.Text className="eyebrow">WORKSPACE LOG / {contacts.length.toString().padStart(2, "0")}</Typography.Text>
          <Typography.Title>Activity</Typography.Title>
          <Typography.Paragraph type="secondary">A chronological view of the contacts entering your workspace.</Typography.Paragraph>
        </div>
      </div>
      <Card className="table-card" variant="borderless">
        {contacts.length ? <Table rowKey="id" columns={columns} dataSource={contacts} loading={isLoading} pagination={{ pageSize: 10, showSizeChanger: true }} /> : <Empty description="No activity yet" />}
      </Card>
    </div>
  );
}
