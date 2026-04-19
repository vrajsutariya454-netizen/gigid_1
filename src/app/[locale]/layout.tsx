import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ClientProviders } from "./providers";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'app'});
 
  return {
    title: t('name') + " - " + t('tagline'),
    description: t('description'),
    keywords: [
      "gig workers",
      "digital identity",
      "verifiable credentials",
      "zero knowledge proof",
      "India",
      "fintech",
    ],
    authors: [{ name: "GigID" }],
    openGraph: {
      title: t('name') + " - Your Work, Your Identity",
      description: t('description'),
      type: "website",
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3b82f6",
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Instrument+Serif:ital,wght@0,400;1,400&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ClientProviders>{children}</ClientProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
