import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Providers } from "./providers";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://jkcycling.com'),
  title: {
    default: "JK Cycling - Cycling Events in Jammu & Kashmir",
    template: "%s | JK Cycling"
  },
  description: "Discover cycling events, races, and community in Jammu & Kashmir. Your hub for MTB and road cycling events.",
  openGraph: {
    title: "JK Cycling",
    description: "Cycling Events and Results in J&K",
    url: 'https://jkcycling.com',
    siteName: 'JK Cycling',
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <div className={styles.shell}>
            <Header />
            <main className={`container ${styles.main}`}>
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
