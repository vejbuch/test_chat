import "./globals.css";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="cs">
      <body className="bg-white text-black antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
