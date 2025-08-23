import '../styles/globals.css';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/gas-logo.png" />
        <meta name="theme-color" content="#005826" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
