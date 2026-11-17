import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ARK Board",
  description: "Live room status across ARK DE GLORY hotels",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
