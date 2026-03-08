import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title:
          "Remote for Transmission | React Native app for Transmission",
      },
      {
        name: "description",
        content:
          "Remote for Transmission is an open source React Native app to control your Transmission server from Android. Manage, monitor, and fine-tune torrents from anywhere.",
      },
      {
        name: "keywords",
        content:
          "remote for Transmission, Transmission controller app, React Native Transmission app, control Transmission server from phone, Android",
      },
      {
        name: "robots",
        content:
          "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      {
        name: "googlebot",
        content:
          "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      { name: "application-name", content: "Remote for Transmission" },
      { property: "og:type", content: "website" },
      {
        property: "og:site_name",
        content: "Remote for Transmission",
      },
      { property: "og:locale", content: "en_US" },
      { property: "og:url", content: "https://remote.jg.ar/" },
      {
        property: "og:title",
        content:
          "Remote for Transmission | React Native app for Transmission",
      },
      {
        property: "og:description",
        content:
          "Open source React Native app to control your Transmission server from Android.",
      },
      {
        property: "og:image",
        content: "https://remote.jg.ar/assets/screen.jpg",
      },
      { property: "og:image:width", content: "385" },
      { property: "og:image:height", content: "842" },
      {
        property: "og:image:alt",
        content: "Remote for Transmission Android app screen preview",
      },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content:
          "Remote for Transmission | React Native app for Transmission",
      },
      {
        name: "twitter:description",
        content:
          "Open source React Native app to control your Transmission server from Android.",
      },
      {
        name: "twitter:image",
        content: "https://remote.jg.ar/assets/screen.jpg",
      },
    ],
    links: [{ rel: "canonical", href: "https://remote.jg.ar/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Remote for Transmission",
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Android",
          isAccessibleForFree: true,
          url: "https://remote.jg.ar/",
          downloadUrl:
            "https://play.google.com/store/apps/details?id=ar.jg.remote",
          screenshot: "https://remote.jg.ar/assets/screen.jpg",
          description:
            "Open source React Native Android app to control your Transmission server.",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          author: { "@type": "Person", name: "Jorge Galat" },
          sameAs: [
            "https://github.com/jgalat/remote-app",
            "https://github.com/jgalat/remote-app/issues",
            "https://github.com/jgalat/remote-app/wiki",
          ],
          featureList: [
            "View active, paused, and completed torrents",
            "Add torrents by magnet link, .torrent file, and Android share intents",
            "Advanced controls for file priorities, limits, and queue rules",
            "Server status, bandwidth activity, and session stats",
            "Light and dark mode",
            "Optional biometric lock and secure direct connection to your own Transmission instance",
            "Background notifications for completed downloads",
            "Open source app with public repository and issue tracker",
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Remote for Transmission",
          url: "https://remote.jg.ar/",
          inLanguage: "en",
        }),
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <main className="mx-auto max-w-[1080px] px-[1.1rem] pt-[2.4rem] pb-[1.6rem]">
      <section
        className="animate-reveal grid min-h-[min(78vh,760px)] grid-cols-[1fr_minmax(280px,360px)] items-center gap-8 max-[920px]:min-h-auto max-[920px]:grid-cols-1"
        aria-labelledby="hero-title"
      >
        <div className="max-[920px]:text-center">
          <p className="mb-[0.7rem] tracking-[0.03em] text-[#444]">
            Remote for Transmission
          </p>
          <h1
            id="hero-title"
            className="mb-4 text-[clamp(2rem,5.2vw,3.7rem)] leading-[0.95] tracking-[-0.02em]"
          >
            Control your torrents remotely.
          </h1>
          <p className="max-w-[58ch] leading-[1.6] text-[#444] max-[920px]:mx-auto">
            Remote for Transmission is an open source Android app built with
            React Native to control your Transmission server while managing,
            monitoring, and fine-tuning your downloads, queue, files, peers,
            trackers, and speed limits.
          </p>
          <div className="mt-[1.35rem] flex flex-wrap items-center gap-4 max-[920px]:justify-center max-[760px]:flex-col max-[760px]:items-center max-[760px]:gap-3">
            <a
              href="https://play.google.com/store/apps/details?id=ar.jg.remote"
              rel="noopener noreferrer"
              target="_blank"
              aria-label="Download Remote for Transmission on Google Play"
            >
              <img
                width={646}
                height={250}
                className="block h-auto w-[min(240px,100%)] max-[920px]:mx-auto"
                alt="Get Remote for Transmission on Google Play"
                src="https://play.google.com/intl/es-419/badges/static/images/badges/en_badge_web_generic.png"
              />
            </a>
          </div>
        </div>

        <figure
          className="justify-self-center max-[920px]:max-w-[340px] max-[920px]:justify-self-center"
          aria-label="App screen preview"
        >
          <img
            width={385}
            height={842}
            className="block h-auto w-full rounded-[34px] shadow-[0_26px_50px_-34px_rgba(0,0,0,0.46)]"
            alt="Remote for Transmission app screenshot showing torrent list and controls"
            src="/assets/screen.jpg"
          />
        </figure>
      </section>

      <section
        className="mt-8 flex flex-wrap gap-x-5 gap-y-[0.65rem]"
        aria-label="Project links"
      >
        <a
          className="font-medium text-[#cc0063] underline decoration-1 underline-offset-[0.2em] hover:text-[#a90052]"
          href="/buy"
        >
          Buy Pro
        </a>
        <a
          className="font-medium text-[#cc0063] underline decoration-1 underline-offset-[0.2em] hover:text-[#a90052]"
          href="https://github.com/jgalat/remote-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Repository
        </a>
        <a
          className="font-medium text-[#cc0063] underline decoration-1 underline-offset-[0.2em] hover:text-[#a90052]"
          href="https://github.com/jgalat/remote-app/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          Issues
        </a>
        <a
          className="font-medium text-[#cc0063] underline decoration-1 underline-offset-[0.2em] hover:text-[#a90052]"
          href="https://github.com/jgalat/remote-app/wiki"
          target="_blank"
          rel="noopener noreferrer"
        >
          Wiki
        </a>
        <a
          className="font-medium text-[#cc0063] underline decoration-1 underline-offset-[0.2em] hover:text-[#a90052]"
          href="mailto:remote@jg.ar"
        >
          Contact: remote@jg.ar
        </a>
      </section>

      <section
        className="animate-reveal mt-8 [animation-delay:0.12s]"
        aria-labelledby="features-title"
      >
        <h2 id="features-title" className="mb-[0.7rem] text-[1.08rem]">
          What you can do
        </h2>
        <ul className="m-0 list-disc pl-[1.15rem] leading-[1.6] text-[#444] marker:text-[#cc0063]">
          <li>
            Add torrents via magnet links, .torrent files, and Android share
            intents.
          </li>
          <li>
            Inspect torrent details: files, trackers, peers, pieces, speeds,
            ratio, and ETA.
          </li>
          <li>
            Run torrent actions: start, start now, pause, verify, reannounce,
            move, and remove.
          </li>
          <li>
            Set per-file priorities and skip files you do not want to download.
          </li>
          <li>
            Control Transmission settings: speed limits, seeding rules, queue
            sizes, and peer discovery.
          </li>
          <li>Manage download directories globally and per server.</li>
          <li>
            Use light, dark, or system theme, with optional biometric lock.
          </li>
          <li>Receive background notifications when downloads complete.</li>
          <li>
            Pro features include multi-server support and torrent search via
            Jackett or Prowlarr.
          </li>
        </ul>
      </section>

      <footer className="mt-[2.1rem] flex flex-wrap justify-between gap-[0.8rem] text-[0.9rem] text-[#888]">
        <span>Remote for Transmission</span>
        <a
          href="/privacy-policy"
          className="text-inherit no-underline hover:text-[#cc0063] hover:underline hover:underline-offset-[0.22em]"
        >
          Privacy Policy
        </a>
      </footer>
    </main>
  );
}
