import { notFound, redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard-client";
import { isDemoAuthenticated } from "@/lib/auth";
import { getRouteSnapshot } from "@/lib/service";
import { getRouteBySlug } from "@/lib/domain";

export const dynamic = "force-dynamic";

export default async function ConsoleRoutePage({ params }: { params: Promise<{ slug: string }> }) {
  if (!(await isDemoAuthenticated())) {
    redirect("/login");
  }

  const { slug } = await params;
  const route = getRouteBySlug(slug);
  if (!route) {
    notFound();
  }

  const snapshot = await getRouteSnapshot();
  return <DashboardClient initialSnapshot={snapshot} routeKey={route.key} currentPath={route.path} />;
}
