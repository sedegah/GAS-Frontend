export default function Head() {
  return (
    <>
      <title>GAS Correspondence Manager</title>
      <link rel="icon" href="/gas-logo.png" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      {/* PWA manifest */}
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#005826" />

      {/* Optional: Apple icons */}
      <link rel="apple-touch-icon" href="/gas-logo.png" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    </>
  )
}
