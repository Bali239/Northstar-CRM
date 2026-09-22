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
    <main className="grid min-h-screen bg-slate-100 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="relative hidden overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.22),_transparent_28%),linear-gradient(135deg,#061c31_0%,#0f2d46_42%,#0b1b2a_100%)] px-8 py-12 text-white lg:flex lg:flex-col lg:justify-between lg:px-16 lg:py-16">
        <div className="absolute -right-24 -top-24 size-80 rounded-full border-[40px] border-cyan-400/15" />
        <div className="absolute bottom-10 right-16 size-40 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute left-10 top-20 h-32 w-32 rounded-full border border-sky-300/20" />

        <div className="relative z-10">
          <div className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-sky-500 text-2xl font-bold text-[#061c31] shadow-[0_20px_45px_rgba(14,165,233,0.45)] animate-pulse-glow">
            <CompassOutlined />
          </div>

          <Typography.Text className="mt-8 block text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
            Northstar / CRM
          </Typography.Text>

          <Typography.Title className="!mt-5 !mb-4 !text-5xl !leading-[1.02] !text-white xl:!text-6xl">
            Know your customers.
            <br />
            <span className="text-cyan-300">Move with intent.</span>
          </Typography.Title>

          <Typography.Paragraph className="max-w-lg !mb-0 !text-base !leading-7 !text-sky-100/80">
            Northstar turns scattered customer details into clear next steps,
            so your team can build better relationships and move with intent.
          </Typography.Paragraph>

          <div className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-sky-700/80 pt-6 text-sm text-sky-100/80">
            <div>
              <div className="text-2xl font-bold text-white">15k+</div>
              <div className="mt-1 text-xs uppercase tracking-[0.14em] text-sky-200/80">
                records
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">99.9%</div>
              <div className="mt-1 text-xs uppercase tracking-[0.14em] text-sky-200/80">
                uptime
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">SOC 2</div>
              <div className="mt-1 text-xs uppercase tracking-[0.14em] text-sky-200/80">
                ready
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-10 flex items-center gap-4 text-sm text-sky-200">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300/10 font-semibold text-cyan-200">
            01
          </span>
          <span>Everything important, in view.</span>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-8 sm:px-8 lg:px-10">
        <Card
          bordered={false}
          className="w-full max-w-md !rounded-[28px] !border-0 !bg-white/85 !shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-sm"
        >
          <div className="mb-8 flex items-center justify-between gap-4">
            <Typography.Text className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-600">
              {isSignUp ? "Create your workspace" : "Welcome back"}
            </Typography.Text>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
              Secure access
            </span>
          </div>

          <Typography.Title level={2} className="!mb-2 !text-3xl !text-slate-900">
            {isSignUp ? "Start your Northstar" : "Sign in to Northstar"}
          </Typography.Title>

          <Typography.Paragraph type="secondary" className="!mb-7">
            {isSignUp
              ? "Set up your private CRM workspace in a minute."
              : "Your team context is waiting."}
          </Typography.Paragraph>

          {!hasSupabaseConfig && (
            <Alert
              className="!mb-4"
              type="warning"
              showIcon
              message="Demo configuration active"
              description="Add Supabase environment variables for live authentication."
            />
          )}

          {error && (
            <Alert className="!mb-4" type="error" showIcon message={error} />
          )}

          <Form layout="vertical" onFinish={submit} requiredMark={false} size="large">
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
              className="!h-12 !rounded-xl !bg-sky-600 hover:!bg-sky-500"
            >
              {isSignUp ? "Create account" : "Enter workspace"}
            </Button>
          </Form>

          <Button
            type="link"
            block
            className="!mt-3 !px-0"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Need an account? Sign up"}
          </Button>

          <div className="my-6 flex items-center gap-3 text-xs text-slate-400 before:h-px before:flex-1 before:bg-slate-200 after:h-px after:flex-1 after:bg-slate-200">
            <span>or</span>
          </div>

          <Button
            block
            className="!h-12 !rounded-xl !border-slate-200 !bg-white !text-slate-700 hover:!bg-slate-50"
            onClick={() => {
              dispatch(setDemoSession());
              navigate("/", { replace: true });
            }}
          >
            Explore demo workspace
          </Button>
        </Card>
      </section>
    </main>
  );
}
