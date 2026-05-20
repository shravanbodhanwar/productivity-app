import type { Metadata } from "next";
import "./globals.css";
import AuthLayout from "./auth-layout";

export const metadata: Metadata = {
  title: "StudyFlow — Your study workspace",
  description: "Notion-style notes, task boards, calendar, and AI — built for students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthLayout>{children}</AuthLayout>
      </body>
    </html>
  );
}
