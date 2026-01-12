
import { Suspense } from "react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-black text-white flex items-center justify-center">Loading...</div>}>
      <DashboardLayout />
    </Suspense>
  );
}
