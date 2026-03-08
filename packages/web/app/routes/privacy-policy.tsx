import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Remote for Transmission" },
      {
        name: "description",
        content:
          "Privacy Policy for Remote for Transmission, an open source Android app for remotely controlling Transmission clients.",
      },
      {
        name: "robots",
        content:
          "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      { property: "og:type", content: "website" },
      {
        property: "og:site_name",
        content: "Remote for Transmission",
      },
      { property: "og:locale", content: "en_US" },
      {
        property: "og:url",
        content: "https://remote.jg.ar/privacy-policy",
      },
      {
        property: "og:title",
        content: "Privacy Policy | Remote for Transmission",
      },
      {
        property: "og:description",
        content:
          "How Remote for Transmission handles data and privacy for Android users.",
      },
      {
        property: "og:image",
        content: "https://remote.jg.ar/assets/screen.jpg",
      },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Privacy Policy | Remote for Transmission",
      },
      {
        name: "twitter:description",
        content:
          "Privacy details for Remote for Transmission, including data handling and contact information.",
      },
      {
        name: "twitter:image",
        content: "https://remote.jg.ar/assets/screen.jpg",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://remote.jg.ar/privacy-policy",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Privacy Policy | Remote for Transmission",
          url: "https://remote.jg.ar/privacy-policy",
          inLanguage: "en",
          isPartOf: {
            "@type": "WebSite",
            name: "Remote for Transmission",
            url: "https://remote.jg.ar/",
          },
        }),
      },
    ],
  }),
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  return (
    <main className="mx-auto max-w-[1080px] px-[1.1rem] pt-[2.4rem] pb-[1.6rem]">
      <div className="mb-[1.1rem] flex flex-wrap justify-between gap-[0.8rem] text-[#888]">
        <span>Remote for Transmission</span>
        <span>Privacy</span>
      </div>

      <a
        className="mb-[1.2rem] inline-block font-medium text-[#cc0063] underline decoration-1 underline-offset-[0.2em] hover:text-[#a90052]"
        href="/"
      >
        Back to homepage
      </a>

      <h1 className="mb-[0.8rem] text-[clamp(2rem,5.2vw,3rem)] leading-[0.98] tracking-[-0.02em]">
        Privacy Policy
      </h1>
      <p className="mt-[0.65rem] leading-[1.6] text-[#888]">
        <strong>Last updated:</strong> February 23, 2026
      </p>

      <p className="mt-[0.65rem] leading-[1.6] text-[#444]">
        Remote for Transmission is an open source Android app created by Jorge
        Galat. This page explains how the app handles data.
      </p>

      <h2 className="mt-6 text-[1.08rem]">Summary</h2>
      <p className="mt-[0.65rem] leading-[1.6] text-[#444]">
        The app is a client for your own Transmission server. It does not
        require an account with us, and it does not run a hosted backend
        operated by us.
      </p>

      <h2 className="mt-6 text-[1.08rem]">Data Collected by the App</h2>
      <p className="mt-[0.65rem] leading-[1.6] text-[#444]">
        The app itself does not collect personal data on remote.jg.ar servers.
        Connection details and preferences you enter in the app are stored on
        your device to make the app work.
      </p>

      <h2 className="mt-6 text-[1.08rem]">How Network Data Flows</h2>
      <p className="mt-[0.65rem] leading-[1.6] text-[#444]">
        When you use the app, it communicates directly with the Transmission
        instance you configure. Credentials and torrent-management requests are
        sent to that server endpoint, not to an app-owned cloud service.
      </p>

      <h2 className="mt-6 text-[1.08rem]">Third-Party Services</h2>
      <p className="mt-[0.65rem] leading-[1.6] text-[#444]">
        App distribution and platform-level services may process technical data
        according to their own privacy policies. These services may include:
      </p>
      <ul className="mt-1 list-disc pl-[1.15rem] marker:text-[#cc0063]">
        <li className="mt-[0.65rem] leading-[1.6] text-[#444]">
          <a
            className="font-medium text-[#cc0063] underline decoration-1 underline-offset-[0.2em] hover:text-[#a90052]"
            href="https://www.google.com/policies/privacy/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Play Services
          </a>
        </li>
        <li className="mt-[0.65rem] leading-[1.6] text-[#444]">
          <a
            className="font-medium text-[#cc0063] underline decoration-1 underline-offset-[0.2em] hover:text-[#a90052]"
            href="https://expo.dev/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Expo
          </a>
        </li>
        <li className="mt-[0.65rem] leading-[1.6] text-[#444]">
          <a
            className="font-medium text-[#cc0063] underline decoration-1 underline-offset-[0.2em] hover:text-[#a90052]"
            href="https://www.revenuecat.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            RevenueCat
          </a>
        </li>
      </ul>

      <h2 className="mt-6 text-[1.08rem]">Children&apos;s Privacy</h2>
      <p className="mt-[0.65rem] leading-[1.6] text-[#444]">
        The app is not directed to children under 13. We do not knowingly
        collect personal information from children.
      </p>

      <h2 className="mt-6 text-[1.08rem]">External Links</h2>
      <p className="mt-[0.65rem] leading-[1.6] text-[#444]">
        The app and this website may link to external sites. We are not
        responsible for the content or privacy practices of third-party sites.
      </p>

      <h2 className="mt-6 text-[1.08rem]">Changes to This Policy</h2>
      <p className="mt-[0.65rem] leading-[1.6] text-[#444]">
        This policy may be updated over time. Changes will be posted on this
        page with an updated date.
      </p>

      <h2 className="mt-6 text-[1.08rem]">Contact</h2>
      <p className="mt-[0.65rem] leading-[1.6] text-[#444]">
        Questions about this policy can be sent to{" "}
        <a
          className="font-medium text-[#cc0063] underline decoration-1 underline-offset-[0.2em] hover:text-[#a90052]"
          href="mailto:remote@jg.ar"
        >
          remote@jg.ar
        </a>
        .
      </p>

      <footer className="mt-[2.1rem] text-[0.9rem] text-[#888]">
        Remote for Transmission
      </footer>
    </main>
  );
}
