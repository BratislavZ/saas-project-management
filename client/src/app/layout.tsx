import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Providers } from "./_utils/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaskFlow",
  description: "Your best project management tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`font-main antialiased`}>
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
