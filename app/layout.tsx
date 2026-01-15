import "./globals.css";
import Link from "next/link";
import RoleSwitcher from "@/components/RoleSwitcher";
import { RoleProvider } from "@/components/RoleProvider";
import { getSessionUser, getUserRole } from "@/lib/auth";

export const metadata = {
  title: "Internal Portfolio & Document Compliance",
  description: "Internal portfolio and document compliance system demo"
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  const role = await getUserRole(user?.email);

  return (
    <html lang="es">
      <body>
        <RoleProvider initialRole={role} userEmail={user?.email}>
          <header>
            <div>
              <div style={{ fontSize: 12, textTransform: "uppercase", color: "#6c645d" }}>
                Internal Systems
              </div>
              <div style={{ fontSize: 20, fontWeight: 600 }}>
                Portfolio & Compliance
              </div>
            </div>
            <nav>
              <Link href="/">Dashboard</Link>
              <Link href="/portfolio">Portfolio</Link>
              <Link href="/import">Import</Link>
            </nav>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <RoleSwitcher />
              <form action="/logout" method="post">
                <button
                  type="submit"
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    border: "1px solid #ccc",
                    background: "#ffffff"
                  }}
                >
                  Sign out
                </button>
              </form>
            </div>
          </header>
          <main>{children}</main>
        </RoleProvider>
      </body>
    </html>
  );
}
