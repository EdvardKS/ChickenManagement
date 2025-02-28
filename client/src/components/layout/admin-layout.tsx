import { ReactNode } from "react";
import AdminDrawer from "./admin-drawer";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background font-poppins">
      <header className="border-b">
        <div className="flex h-16 items-center px-4">
          <AdminDrawer />
          <div className="ml-auto flex items-center space-x-4"></div>
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {children}
      </main>
    </div>
  );
}