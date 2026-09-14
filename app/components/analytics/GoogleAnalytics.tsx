import Script from "next/script";

const GA_MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]{6,12}$/i;

function isGoogleAnalyticsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_GA_ENABLED === "true";
}

function getValidGaMeasurementId(): string | null {
  const raw = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  if (!raw) return null;
  if (!GA_MEASUREMENT_ID_PATTERN.test(raw)) return null;
  return raw;
}

export default function GoogleAnalytics() {
  if (!isGoogleAnalyticsEnabled()) return null;

  const measurementId = getValidGaMeasurementId();
  if (!measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}
