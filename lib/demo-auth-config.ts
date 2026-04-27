export const DEMO_CREDENTIALS = {
  username: "admin",
  password: "admin123",
  displayName: "演示管理员",
  role: "系统管理员",
} as const;

export const DEFAULT_PASSWORD_SUFFIX = "123";
export const DEFAULT_PASSWORD_RULE_TEXT = "登录账号 + 123";
export const DEMO_AUTH_COOKIE = "demo_auth";
export const DEMO_AUTH_COOKIE_VALUE = "authenticated";

export type DemoLoginInput = {
  username: string;
  password: string;
};

export type DemoLoginResult = {
  ok: boolean;
  message?: string;
  username?: string;
  displayName?: string;
};

export function buildDefaultPassword(username: string) {
  return `${username.trim()}${DEFAULT_PASSWORD_SUFFIX}`;
}
