import { redirect } from "next/navigation";
import { isDemoAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (!(await isDemoAuthenticated())) {
    redirect("/login");
  }

  redirect("/dashboard");
}
