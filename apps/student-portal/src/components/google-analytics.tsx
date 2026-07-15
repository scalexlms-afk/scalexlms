import Script from "next/script";
import { AI_REFERRER_HOSTS } from "@/lib/ai-visibility";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-CYYB6ZHSVG";

const AI_HOSTS_JSON = JSON.stringify(AI_REFERRER_HOSTS);

export function GoogleAnalytics() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            send_page_view: true
          });

          (function trackAiReferrals() {
            var ref = document.referrer;
            if (!ref) return;
            try {
              var host = new URL(ref).hostname.replace(/^www\\./, '');
              var aiHosts = ${AI_HOSTS_JSON};
              var match = aiHosts.find(function(h) {
                return host === h || host.endsWith('.' + h);
              });
              if (match) {
                gtag('event', 'ai_referral', {
                  referrer_source: match,
                  referrer_url: ref,
                  page_location: window.location.href,
                  traffic_type: 'ai_referral'
                });
              }
            } catch(e) {}
          })();
        `}
      </Script>
    </>
  );
}
