import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Morrow — Objects for everyday living", description: "Thoughtful homewares, made to be lived with." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
