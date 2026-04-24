import { cookies } from "next/headers";
import { DEMO_AUTH_COOKIE, DEMO_AUTH_COOKIE_VALUE, validateDemoCredentials, type DemoLoginInput } from "@/lib/demo-auth-config";

export async function isDemoAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(DEMO_AUTH_COOKIE)?.value === DEMO_AUTH_COOKIE_VALUE;
}

export async function signInDemo(input: DemoLoginInput) {
  if (!validateDemoCredentials(input)) {
    return false;
  }

  const cookieStore = await cookies();
  cookieStore.set(DEMO_AUTH_COOKIE, DEMO_AUTH_COOKIE_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return true;
}

export async function signOutDemo() {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_AUTH_COOKIE);
}
