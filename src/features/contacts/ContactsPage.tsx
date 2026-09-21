import { useEffect, useState } from "react";
import {
  App as AntdApp,
  Button,
  Card,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { setFilter, resetFilters } from "./contactsUiSlice";
import {
  useCreateContactMutation,
  useDeleteContactMutation,
  useGetContactsQuery,
  useUpdateContactMutation,
} from "./contactsApi";
import type { Contact, ContactInput } from "./contactTypes";

const statusColors = {
  lead: "gold",
  active: "green",
  inactive: "default",
} as const;
const initialForm: ContactInput = {
  full_name: "",
  email: "",
  company: "",
  status: "lead",
  source: "Inbound",
  phone: "",
  notes: "",
};
export default function ContactsPage() {
  const filters = useAppSelector((state) => state.contactsUi);
  const isDemo = useAppSelector((state) => state.auth.isDemo);
  const dispatch = useAppDispatch();
  const {
    data = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetContactsQuery({ ...filters, demo: isDemo });
  const [create, createState] = useCreateContactMutation();
  const [update, updateState] = useUpdateContactMutation();
  const [remove] = useDeleteContactMutation();
  const [editing, setEditing] = useState<Contact | null>(null);
  const [open, setOpen] = useState(false);
  const [pageSize, setPageSize] = useState(8);
  const [form] = Form.useForm<ContactInput>();
  const { message } = AntdApp.useApp();
  useEffect(() => {
    if (!open) return;
    form.setFieldsValue(
      editing
        ? {
            full_name: editing.full_name,
            email: editing.email,
            company: editing.company,
            status: editing.status,
            source: editing.source,
            phone: editing.phone ?? "",
            notes: editing.notes ?? "",
          }
        : initialForm,
    );
  }, [editing, form, open]);
  const openForm = (contact?: Contact) => {
    setEditing(contact ?? null);
    setOpen(true);
  };
  const submit = async (input: ContactInput) => {
    try {
      if (editing)
        await update({ id: editing.id, input, demo: isDemo }).unwrap();
      else await create({ input, demo: isDemo }).unwrap();
      message.success(editing ? "Contact updated" : "Contact added");
      setOpen(false);
    } catch (error: unknown) {
      const apiError = error as {
        data?: { message?: string; details?: string; hint?: string };
      };
      const reason = apiError.data?.message ?? "Supabase rejected the request.";
      const details = [apiError.data?.details, apiError.data?.hint]
        .filter(Boolean)
        .join(" ");
      message.error(`${reason}${details ? ` ${details}` : ""}`);
    }
  };
  const columns = [
    {
      title: "Contact",
      key: "contact",
      render: (_: unknown, contact: Contact) => (
        <div className="contact-cell">
          <span className="contact-avatar">
            {contact.full_name.slice(0, 1)}
          </span>
          <div>
            <strong>{contact.full_name}</strong>
            <small>{contact.email}</small>
          </div>
        </div>
      ),
    },
    { title: "Company", dataIndex: "company", key: "company" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: Contact["status"]) => (
        <Tag color={statusColors[status]}>{status.toUpperCase()}</Tag>
      ),
    },
    { title: "Source", dataIndex: "source", key: "source" },
    {
      title: "Added",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) =>
        new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
    },
    {
      title: "",
      key: "actions",
      align: "right" as const,
      render: (_: unknown, contact: Contact) => (
        <Space>
          <Button
            type="text"
            aria-label={`Edit ${contact.full_name}`}
            icon={<EditOutlined />}
            onClick={() => openForm(contact)}
          />
          <Popconfirm
            title="Delete this contact?"
            description="This cannot be undone."
            onConfirm={() =>
              void remove({ id: contact.id, demo: isDemo })
                .unwrap()
                .then(() => message.success("Contact deleted"))
                .catch(() => message.error("Could not delete contact."))
            }
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              aria-label={`Delete ${contact.full_name}`}
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];
  return (
    <div className="page-content">
      <div className="page-heading contacts-heading">
        <div>
          <Typography.Text className="eyebrow">
            RELATIONSHIP GRAPH / {data.length.toString().padStart(2, "0")}
          </Typography.Text>
          <Typography.Title>Contacts</Typography.Title>
          <Typography.Paragraph type="secondary">
            The people and companies that keep your work moving.
          </Typography.Paragraph>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openForm()}
        >
          Add contact
        </Button>
      </div>
      <Card className="table-card" variant="borderless">
        <div className="filter-bar">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search people, companies, email"
            value={filters.search}
            onChange={(event) =>
              dispatch(setFilter({ key: "search", value: event.target.value }))
            }
          />
          <Select
            value={filters.status}
            onChange={(value) => dispatch(setFilter({ key: "status", value }))}
            options={[
              { value: "all", label: "All statuses" },
              { value: "lead", label: "Lead" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
          />
          <Select
            value={filters.source}
            onChange={(value) => dispatch(setFilter({ key: "source", value }))}
            options={[
              { value: "all", label: "All sources" },
              { value: "Inbound", label: "Inbound" },
              { value: "Referral", label: "Referral" },
              { value: "Partner", label: "Partner" },
              { value: "Event", label: "Event" },
            ]}
          />
          <Select
            value={filters.sort}
            onChange={(value) => dispatch(setFilter({ key: "sort", value }))}
            options={[
              { value: "newest", label: "Newest first" },
              { value: "oldest", label: "Oldest first" },
            ]}
          />
          <Button
            icon={<ReloadOutlined />}
            loading={isFetching}
            onClick={() => void refetch()}
            aria-label="Refresh contacts"
          />
          <Button type="link" onClick={() => dispatch(resetFilters())}>
            Reset
          </Button>
        </div>
        {isError ? (
          <Empty description="Could not reach Supabase. Check your schema or network connection." />
        ) : data.length === 0 && !isLoading ? (
          <Empty description="No contacts match these filters." />
        ) : (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={data}
            loading={isLoading}
            pagination={{
              pageSize,
              pageSizeOptions: ["8", "10", "20"],
              showSizeChanger: true,
              hideOnSinglePage: true,
              onShowSizeChange: (_, size) => setPageSize(size),
            }}
          />
        )}
      </Card>
      <Modal
        title={editing ? "Edit contact" : "Add contact"}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => void submit(values)}
          initialValues={initialForm}
        >
          <Form.Item
            label="Full name"
            name="full_name"
            rules={[{ required: true, message: "Add a name" }]}
          >
            <Input placeholder="e.g. Maya Chen" />
          </Form.Item>
          <div className="form-grid">
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, type: "email" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Company"
              name="company"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </div>
          <div className="form-grid">
            <Form.Item label="Status" name="status">
              <Select
                options={[
                  { value: "lead", label: "Lead" },
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
              />
            </Form.Item>
            <Form.Item label="Source" name="source">
              <Select
                options={["Inbound", "Referral", "Partner", "Event"].map(
                  (value) => ({ value, label: value }),
                )}
              />
            </Form.Item>
          </div>
          <Form.Item label="Phone" name="phone">
            <Input />
          </Form.Item>
          <Form.Item label="Notes" name="notes">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={createState.isLoading || updateState.isLoading}
          >
            {editing ? "Save changes" : "Add contact"}
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
