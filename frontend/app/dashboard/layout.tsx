import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import DashboardNav from "./DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[color:var(--color-surface)]">
      <DashboardNav email={user.email} />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <main className="flex-1 w-full max-w-[1280px] mx-auto px-6 md:px-10 py-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
