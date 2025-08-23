import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />
        {/* Favicon */}
        <link rel="icon" href="/gas-logo.png" />
        {/* Theme color */}
        <meta name="theme-color" content="#005826" />
        {/* Mobile / Apple fallback */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="GAS CMS" />
        <link rel="apple-touch-icon" href="/gas-logo.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
