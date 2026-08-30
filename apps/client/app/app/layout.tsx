import { UserProvider } from "@/contexts/user-context";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}