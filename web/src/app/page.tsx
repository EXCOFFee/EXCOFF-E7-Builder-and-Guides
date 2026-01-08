'use client';

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/useTranslations";

export default function Home() {
  const { t } = useTranslations();

  const features = [
    {
      icon: "",
      href: "/heroes",
      title: t('home.heroWiki', 'Hero Wiki'),
      desc: t('home.heroWikiDesc', 'Explore all the heroes in the game, their information and builds created by the community.'),
      details: t('home.heroWikiDetails', 'Complete database with stats, skills, multipliers and popular builds.'),
      gradient: "from-red-500/20 to-orange-500/20",
      borderColor: "hover:border-red-500/50",
    },
    {
      icon: "",
      href: "/builds",
      title: t('home.communityBuilds', 'Community Builds'),
      desc: t('home.communityBuildsDesc', 'Create and share your builds with recommended stats, sets and artifacts.'),
      details: t('home.communityBuildsDetails', 'Build system with synergies, counters and detailed descriptions.'),
      gradient: "from-blue-500/20 to-cyan-500/20",
      borderColor: "hover:border-blue-500/50",
    },
    {
      icon: "",
      href: "/guides",
      title: t('home.gameGuides', 'Game Guides'),
      desc: t('home.gameGuidesDesc', 'Guides for PVE, RTA, Arena, Guild War and more game content.'),
      details: t('home.gameGuidesDetails', 'Videos, images and strategies to master each game mode.'),
      gradient: "from-purple-500/20 to-violet-500/20",
      borderColor: "hover:border-purple-500/50",
    },
    {
      icon: "",
      href: "/guilds",
      title: t('nav.guilds', 'Guilds'),
      desc: t('guilds.subtitle', 'Find your perfect guild or recruit new members'),
      details: t('guilds.noPosts', 'Connect with active players worldwide'),
      gradient: "from-green-500/20 to-emerald-500/20",
      borderColor: "hover:border-green-500/50",
    },
    {
      icon: "",
      href: "/news",
      title: t('nav.news', 'News'),
      desc: t('news.subtitle', 'Latest updates, announcements and videos'),
      details: t('news.disclaimer', 'Official Epic Seven news and YouTube content'),
      gradient: "from-green-500/20 to-emerald-500/20",
      borderColor: "hover:border-green-500/50",
    },
  ];

  return (
    <main className="min-h-screen bg-e7-void overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 px-4">

        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="relative w-24 h-24 md:w-32 md:h-32">
              <Image
                src="/images/icon_menu_orbis.png"
                alt="EXCOFF E7 HUB"
                fill
                className="object-contain rounded-xl"
                priority
                unoptimized
              />
            </div>
          </div>

          {/* Title */}
          <h1 className="font-display text-4xl md:text-6xl font-semibold mb-4 tracking-tight text-e7-gold">
            EXCOFF E7 HUB
          </h1>

          <p className="text-base md:text-lg text-neutral-400 mb-2">
            {t('home.tagline', 'E7 Builds, Guides & Hero Wiki')}
          </p>

          <p className="text-base md:text-lg text-neutral-500 mb-10 max-w-xl mx-auto">
            {t('home.subtitle', 'Discover and publish your character builds and create game guides for the community')}
          </p>

          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/heroes">
              <Button
                size="lg"
                className="btn-gold px-6 font-medium"
              >
                {t('home.exploreHeroes', 'Explore Heroes')}
              </Button>
            </Link>
            <Link href="/guides">
              <Button
                size="lg"
                variant="outline"
                className="border-e7-gold/40 text-e7-gold hover:bg-e7-gold/10 px-6"
              >
                {t('home.viewGuides', 'View Guides')}
              </Button>
            </Link>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold text-center text-e7-gold mb-3">
            {t('home.whatYouFind', 'What will you find?')}
          </h2>
          <p className="text-center text-neutral-500 mb-12 max-w-lg mx-auto">
            {t('home.everythingYouNeed', 'Everything you need to master Epic Seven')}
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <Link key={index} href={feature.href}>
                <div className="group p-5 rounded-lg bg-e7-panel border border-white/6 hover:border-e7-gold/30 transition-colors h-full">
                  <h3 className="font-display text-base font-medium text-neutral-200 mb-2 group-hover:text-e7-gold transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-500 text-sm mb-2">
                    {feature.desc}
                  </p>
                  <p className="text-neutral-600 text-xs">
                    {feature.details}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "300+", label: t('nav.heroes', 'Heroes') },
              { value: "∞", label: t('nav.builds', 'Builds') },
              { value: "6", label: t('home.languages', 'Languages') },
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-xl glass-panel hover:border-e7-gold/30 transition-all hover:shadow-lg hover:shadow-e7-gold/10">
                <div className="text-3xl md:text-4xl font-bold text-e7-gold mb-1">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with Gradient Background */}
      <section className="py-16 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-e7-gold/10 to-blue-900/20" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="glass-panel rounded-2xl p-8 md:p-12">
            <h2 className="font-display text-3xl md:text-4xl text-slate-100 mb-4">
              {t('home.readyToShare', 'Ready to share your knowledge?')}
            </h2>
            <p className="text-slate-400 mb-8 text-lg">
              {t('home.createAccount', 'Create your account and start contributing guides and builds for your favorite heroes.')}
            </p>
            <Link href="/login">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold px-10 py-6 text-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
              >
                {t('home.joinCommunity', 'Join the Community')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-e7-gold/20 py-8 px-4 glass-panel mt-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/images/icon_menu_orbis.png"
              alt="EpicSevenHub"
              width={32}
              height={32}
              className="rounded-lg ring-1 ring-e7-gold/30"
              unoptimized
            />
            <span className="text-e7-gold font-bold">EXCOFF E7 HUB</span>
          </div>
          <div className="text-center text-slate-500 text-sm">
            <p>{t('footer.notAffiliated', 'EpicSevenHub is not affiliated with Smilegate or Super Creative.')}</p>
            <p>{t('footer.copyright', 'Epic Seven and all its content are property of their respective owners.')}</p>
          </div>
          <div className="flex gap-4 items-center">
            <a href="https://discord.gg/Tx7Nr6vJjp" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-400 transition-colors text-sm flex items-center gap-1">
              Discord
            </a>
            <a href="https://www.youtube.com/@EXCOFFe7" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-red-400 transition-colors text-sm flex items-center gap-1">
              YouTube
            </a>
            <Link href="/heroes" className="text-slate-400 hover:text-e7-gold transition-colors text-sm">
              {t('nav.heroes', 'Heroes')}
            </Link>
            <Link href="/guides" className="text-slate-400 hover:text-e7-gold transition-colors text-sm">
              {t('nav.guides', 'Guides')}
            </Link>
            <Link href="/guilds" className="text-slate-400 hover:text-e7-gold transition-colors text-sm">
              {t('nav.guilds', 'Guilds')}
            </Link>
          </div>
        </div>
      </footer>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-shimmer {
          animation: shimmer 3s linear infinite;
        }
        .delay-500 {
          animation-delay: 500ms;
        }
        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </main>
  );
}
