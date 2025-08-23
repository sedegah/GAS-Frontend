import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Link to manifest */}
        <link rel="manifest" href="/manifest.json" />
        {/* Favicon */}
        <link rel="icon" href="/gas-logo.png" />
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#005826" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
