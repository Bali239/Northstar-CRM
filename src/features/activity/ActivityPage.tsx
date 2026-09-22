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
      render: (name: string, contact: Contact) => (
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700">
            {name.slice(0, 1)}
          </span>
          <div>
            <div className="font-semibold text-slate-800">{name}</div>
            <div className="text-xs text-slate-500">{contact.company}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Event",
      key: "event",
      render: () => "Contact added to workspace",
    },
    { title: "Source", dataIndex: "source", key: "source" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: Contact["status"]) => (
        <Tag color={status === "active" ? "green" : status === "lead" ? "gold" : "default"} className="!rounded-full !px-2.5 !py-0.5 !font-medium">
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "When",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) =>
        new Date(date).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Typography.Text className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
          Workspace log / {contacts.length.toString().padStart(2, "0")}
        </Typography.Text>
        <Typography.Title className="!mb-1 !mt-2 !text-3xl !leading-tight !text-slate-900 md:!text-4xl">
          Activity
        </Typography.Title>
        <Typography.Paragraph type="secondary" className="!mb-0">
          A chronological view of the contacts entering your workspace.
        </Typography.Paragraph>
      </div>

      <Card
        bordered={false}
        className="!rounded-2xl !border-0 !bg-white/90 !shadow-[0_15px_35px_rgba(15,23,42,0.06)]"
      >
        {contacts.length ? (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={contacts}
            loading={isLoading}
            pagination={{ defaultPageSize: 10, showSizeChanger: true }}
            className="[&_.ant-table-thead>tr>th]:!bg-slate-50 [&_.ant-table-thead>tr>th]:!text-slate-600"
          />
        ) : (
          <Empty description="No activity yet" />
        )}
      </Card>
    </div>
  );
}
