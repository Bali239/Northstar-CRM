import { useState } from "react";
import {
  Alert,
  App as AntdApp,
  Button,
  Card,
  Form,
  Input,
  Typography,
} from "antd";
import {
  ArrowRightOutlined,
  CompassOutlined,
  LockOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { supabase, hasSupabaseConfig } from "../../config/supabase";
import { useAppDispatch } from "../../app/hooks";
import { setDemoSession } from "./authSlice";

type Credentials = { email: string; password: string };
export function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { message } = AntdApp.useApp();
  const submit = async ({ email, password }: Credentials) => {
    setLoading(true);
    setError("");
    const result = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    if (isSignUp && !result.data.session) {
      message.success("Check your email to confirm your account.");
      return;
    }
    navigate("/", { replace: true });
  };
  return (
    <main className="auth-page">
      <section className="auth-brand">
        <div className="brand-mark">
          <CompassOutlined />
        </div>
        <Typography.Text className="eyebrow">NORTHSTAR / CRM</Typography.Text>
        <Typography.Title>
          Know your customers.
          <br />
          <span>Move with intent.</span>
        </Typography.Title>
        <Typography.Paragraph>
          One calm workspace for the relationships that move your business
          forward.
        </Typography.Paragraph>
        <div className="auth-signal">
          <strong>01</strong>
          <span>Everything important, in view.</span>
        </div>
      </section>
      <Card className="auth-card" variant="borderless">
        <Typography.Text className="eyebrow">
          {isSignUp ? "CREATE YOUR WORKSPACE" : "WELCOME BACK"}
        </Typography.Text>
        <Typography.Title level={2}>
          {isSignUp ? "Start your northstar" : "Sign in to Northstar"}
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          {isSignUp
            ? "Set up your private CRM workspace in a minute."
            : "Your team context is waiting."}
        </Typography.Paragraph>
        {!hasSupabaseConfig && (
          <Alert
            className="auth-alert"
            type="warning"
            showIcon
            message="Demo configuration active"
            description="Add Supabase environment variables for live authentication."
          />
        )}
        {error && (
          <Alert className="auth-alert" type="error" showIcon message={error} />
        )}
        <Form
          layout="vertical"
          onFinish={submit}
          requiredMark={false}
          size="large"
        >
          <Form.Item
            label="Email address"
            name="email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input prefix={<MailOutlined />} placeholder="you@company.com" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, min: 6 }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="At least 6 characters"
            />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            icon={<ArrowRightOutlined />}
          >
            {isSignUp ? "Create account" : "Enter workspace"}
          </Button>
        </Form>
        <Button
          type="link"
          block
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError("");
          }}
        >
          {isSignUp
            ? "Already have an account? Sign in"
            : "Need an account? Sign up"}
        </Button>
        <div className="auth-divider">
          <span>or</span>
        </div>
        <Button
          block
          onClick={() => {
            dispatch(setDemoSession());
            navigate("/", { replace: true });
          }}
        >
          Explore demo workspace
        </Button>
      </Card>
    </main>
  );
}
