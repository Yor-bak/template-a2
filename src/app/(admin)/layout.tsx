import { AdminStoreProvider, AdminAuthProvider } from "@/store/adminStore";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminStoreProvider>{children}</AdminStoreProvider>
    </AdminAuthProvider>
  );
}
