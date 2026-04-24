export const DEMO_CREDENTIALS = {
  username: "admin",
  password: "admin123",
  displayName: "演示管理员",
  role: "系统管理员",
} as const;

export const DEMO_AUTH_COOKIE = "demo_auth";
export const DEMO_AUTH_COOKIE_VALUE = "authenticated";

export type DemoLoginInput = {
  username: string;
  password: string;
};

export type DemoLoginResult = {
  ok: boolean;
  message?: string;
};

export function validateDemoCredentials(input: DemoLoginInput) {
  return input.username === DEMO_CREDENTIALS.username && input.password === DEMO_CREDENTIALS.password;
}
