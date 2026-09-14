import Script from "next/script";

const CLARITY_PROJECT_ID_PATTERN = /^[a-zA-Z0-9]{5,32}$/;

function isClarityEnabled(): boolean {
  return process.env.NEXT_PUBLIC_CLARITY_ENABLED === "true";
}

function getValidClarityProjectId(): string | null {
  const raw = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim();
  if (!raw) return null;
  if (!CLARITY_PROJECT_ID_PATTERN.test(raw)) return null;
  return raw;
}

export default function MicrosoftClarity() {
  if (!isClarityEnabled()) return null;

  const projectId = getValidClarityProjectId();
  if (!projectId) return null;

  return (
    <Script id="microsoft-clarity" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${projectId}");`}
    </Script>
  );
}
