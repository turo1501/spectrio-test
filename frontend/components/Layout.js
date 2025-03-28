import Head from 'next/head';

export default function Layout({ children, title = 'Device Management System' }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Device Management System - Monitoring Dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>{children}</main>
    </>
  );
} 