import { AdminHeaderNav } from "./admin-header-nav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <AdminHeaderNav />
      <main className="">
        {children}
      </main>
    </div>
  );
}