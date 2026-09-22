import { useEffect, useState } from "react";
import {
  App as AntdApp,
  Button,
  Card,
  DatePicker,
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
import dayjs from "dayjs";

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
  const [searchValue, setSearchValue] = useState(filters.search);
  const [form] = Form.useForm<ContactInput>();
  const { message } = AntdApp.useApp();

  useEffect(() => {
    setSearchValue(filters.search);
  }, [filters.search]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      dispatch(setFilter({ key: "search", value: searchValue }));
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [dispatch, searchValue]);

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
      if (editing) {
        await update({ id: editing.id, input, demo: isDemo }).unwrap();
      } else {
        await create({ input, demo: isDemo }).unwrap();
      }
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
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700">
            {contact.full_name.slice(0, 1)}
          </span>
          <div>
            <div className="font-semibold text-slate-800">{contact.full_name}</div>
            <div className="text-xs text-slate-500">{contact.email}</div>
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
        <Tag color={statusColors[status]} className="!rounded-full !px-2.5 !py-0.5 !font-medium">
          {status.toUpperCase()}
        </Tag>
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Typography.Text className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Relationship graph / {data.length.toString().padStart(2, "0")}
          </Typography.Text>
          <Typography.Title className="!mb-1 !mt-2 !text-3xl !leading-tight !text-slate-900 md:!text-4xl">
            Contacts
          </Typography.Title>
          <Typography.Paragraph type="secondary" className="!mb-0">
            The people and companies that keep your work moving.
          </Typography.Paragraph>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="!h-11 !rounded-xl !bg-sky-600 hover:!bg-sky-500"
          onClick={() => openForm()}
        >
          Add contact
        </Button>
      </div>

      <Card
        bordered={false}
        className="!rounded-2xl !border-0 !bg-white/90 !shadow-[0_15px_35px_rgba(15,23,42,0.06)]"
      >
        <div className="mb-5 grid gap-3 lg:grid-cols-[1.2fr_repeat(4,minmax(0,0.8fr))_auto_auto]">
          <Input
            allowClear
            prefix={<SearchOutlined className="text-slate-400" />}
            placeholder="Search people, companies, email"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
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

          <DatePicker.RangePicker
            value={[
              filters.createdFrom ? dayjs(filters.createdFrom) : null,
              filters.createdTo ? dayjs(filters.createdTo) : null,
            ]}
            onChange={(dates) => {
              dispatch(
                setFilter({
                  key: "createdFrom",
                  value: dates?.[0]?.format("YYYY-MM-DD") ?? "",
                }),
              );
              dispatch(
                setFilter({
                  key: "createdTo",
                  value: dates?.[1]?.format("YYYY-MM-DD") ?? "",
                }),
              );
            }}
            placeholder={["Added from", "Added to"]}
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

          <div className="flex gap-2">
            <Button icon={<ReloadOutlined />} loading={isFetching} onClick={() => void refetch()} aria-label="Refresh contacts" />
            <Button type="link" onClick={() => dispatch(resetFilters())}>Reset</Button>
          </div>
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
            className="[&_.ant-table-thead>tr>th]:!bg-slate-50 [&_.ant-table-thead>tr>th]:!text-slate-600"
          />
        )}
      </Card>

      <Modal
        title={editing ? "Edit contact" : "Add contact"}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        destroyOnHidden
        className="!rounded-2xl"
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

          <div className="grid gap-4 md:grid-cols-2">
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

          <div className="grid gap-4 md:grid-cols-2">
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
                options={["Inbound", "Referral", "Partner", "Event"].map((value) => ({
                  value,
                  label: value,
                }))}
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
            className="!h-11 !rounded-xl !bg-sky-600 hover:!bg-sky-500"
            loading={createState.isLoading || updateState.isLoading}
          >
            {editing ? "Save changes" : "Add contact"}
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
