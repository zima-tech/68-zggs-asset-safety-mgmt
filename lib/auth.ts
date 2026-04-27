import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { DEMO_AUTH_COOKIE, DEMO_AUTH_COOKIE_VALUE, type DemoLoginInput, type DemoLoginResult } from "@/lib/demo-auth-config";
import { buildInitialPasswordHash, verifyPassword } from "@/lib/password";

export async function isDemoAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(DEMO_AUTH_COOKIE)?.value === DEMO_AUTH_COOKIE_VALUE;
}

export async function signInDemo(input: DemoLoginInput): Promise<DemoLoginResult> {
  const username = input.username.trim();
  const user = await prisma.systemUser.findUnique({
    where: { username },
  });

  if (!user) {
    return { ok: false, message: "用户名或密码错误" };
  }

  let passwordHash = user.passwordHash;
  if (!passwordHash) {
    passwordHash = buildInitialPasswordHash(user.username);
    await prisma.systemUser.update({
      where: { id: user.id },
      data: { passwordHash },
    });
  }

  if (!verifyPassword(input.password, passwordHash)) {
    return { ok: false, message: "用户名或密码错误" };
  }

  if (user.status !== "启用") {
    return { ok: false, message: "账号已停用，请联系管理员" };
  }

  await prisma.systemUser.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const cookieStore = await cookies();
  cookieStore.set(DEMO_AUTH_COOKIE, DEMO_AUTH_COOKIE_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return {
    ok: true,
    username: user.username,
    displayName: user.displayName,
  };
}

export async function signOutDemo() {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_AUTH_COOKIE);
}
