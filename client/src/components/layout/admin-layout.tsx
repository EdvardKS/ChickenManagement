export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <main className="p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}