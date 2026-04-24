import { redirect } from "next/navigation";
import { LoginPageClient } from "@/components/auth/login-page-client";
import { isDemoAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isDemoAuthenticated()) {
    redirect("/");
  }

  return <LoginPageClient />;
}
