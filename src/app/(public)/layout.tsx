import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PublicTabBar } from "@/components/layout/public-tab-bar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      <PublicTabBar />
    </div>
  );
}
