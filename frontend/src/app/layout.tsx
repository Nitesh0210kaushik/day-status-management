import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Day Status Management",
  description: "Manage and view daily status data.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
