'use client';

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/useTranslations";

export default function Home() {
  const { t } = useTranslations();

  const features = [
    {
      icon: "🗡️",
      href: "/heroes",
      title: t('home.heroWiki', 'Hero Wiki'),
      desc: t('home.heroWikiDesc', 'Explore all the heroes in the game, their information and builds created by the community.'),
      details: t('home.heroWikiDetails', 'Complete database with stats, skills, multipliers and popular builds.'),
      gradient: "from-red-500/20 to-orange-500/20",
      borderColor: "hover:border-red-500/50",
    },
    {
      icon: "📊",
      href: "/builds",
      title: t('home.communityBuilds', 'Community Builds'),
      desc: t('home.communityBuildsDesc', 'Create and share your builds with recommended stats, sets and artifacts.'),
      details: t('home.communityBuildsDetails', 'Build system with synergies, counters and detailed descriptions.'),
      gradient: "from-blue-500/20 to-cyan-500/20",
      borderColor: "hover:border-blue-500/50",
    },
    {
      icon: "⚔️",
      href: "/guides",
      title: t('home.gameGuides', 'Game Guides'),
      desc: t('home.gameGuidesDesc', 'Guides for PVE, RTA, Arena, Guild War and more game content.'),
      details: t('home.gameGuidesDetails', 'Videos, images and strategies to master each game mode.'),
      gradient: "from-purple-500/20 to-violet-500/20",
      borderColor: "hover:border-purple-500/50",
    },
    {
      icon: "🏰",
      href: "/guilds",
      title: t('nav.guilds', 'Guilds'),
      desc: t('guilds.subtitle', 'Find your perfect guild or recruit new members'),
      details: t('guilds.noPosts', 'Connect with active players worldwide'),
      gradient: "from-green-500/20 to-emerald-500/20",
      borderColor: "hover:border-green-500/50",
    },
  ];

  return (
    <main className="min-h-screen bg-void-glow overflow-hidden">
      {/* Hero Section with Animated Background */}
      <section className="relative py-16 md:py-24 px-4">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-e7-gold/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500" />
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <div className="relative w-32 h-32 md:w-40 md:h-40 animate-float">
              <div className="absolute -inset-2 bg-gradient-to-r from-e7-gold via-e7-purple to-e7-gold rounded-3xl opacity-40 blur-md animate-border-glow" />
              <Image
                src="/images/icon_menu_orbis.png"
                alt="E7 Orbis Helper"
                fill
                className="object-contain rounded-2xl shadow-2xl shadow-e7-gold/30 relative"
                priority
                unoptimized
              />
            </div>
          </div>

          {/* Title with Gradient */}
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-4 tracking-wide bg-gradient-to-r from-e7-gold via-yellow-300 to-e7-gold bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]">
            ORBIS HELPER
          </h1>

          <p className="text-lg md:text-xl text-slate-300 mb-2 font-medium">
            by Orbis Helper
          </p>

          <p className="text-lg md:text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            {t('home.subtitle', 'Discover and publish your character builds and create game guides for the community')}
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/heroes">
              <Button
                size="lg"
                className="btn-gold px-8 font-semibold shadow-lg shadow-e7-gold/30 hover:shadow-e7-gold/50 transition-all duration-300 hover:scale-105"
              >
                {t('home.exploreHeroes', 'Explore Heroes')}
              </Button>
            </Link>
            <Link href="/guides">
              <Button
                size="lg"
                variant="outline"
                className="border-e7-gold text-e7-gold hover:bg-e7-gold/10 px-8 hover:scale-105 transition-all duration-300"
              >
                {t('home.viewGuides', 'View Guides')}
              </Button>
            </Link>
          </div>

        </div>
      </section>

      {/* Features Section with Glassmorphism Cards */}
      <section className="py-16 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-e7-panel/30 to-transparent" />

        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="font-display text-3xl md:text-4xl text-center text-gold-gradient mb-4">
            {t('home.whatYouFind', 'What will you find?')}
          </h2>
          <p className="text-center text-slate-400 mb-12 max-w-2xl mx-auto">
            Everything you need to master Epic Seven
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Link key={index} href={feature.href}>
                <div
                  className={`group card-fantasy relative glass-panel rounded-xl overflow-hidden h-full`}
                >
                  {/* Gradient Background on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                  <div className="relative p-6">
                    <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-e7-gold transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-slate-400 text-sm mb-3">
                      {feature.desc}
                    </p>
                    <p className="text-slate-500 text-xs">
                      {feature.details}
                    </p>
                  </div>
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
              { value: "500+", label: "Artifacts" },
              { value: "∞", label: t('nav.builds', 'Builds') },
              { value: "6", label: "Languages" },
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
              alt="E7 Orbis Helper"
              width={32}
              height={32}
              className="rounded-lg ring-1 ring-e7-gold/30"
              unoptimized
            />
            <span className="text-e7-gold font-bold">E7 Orbis Helper</span>
          </div>
          <div className="text-center text-slate-500 text-sm">
            <p>{t('footer.notAffiliated', 'E7 Orbis Helper is not affiliated with Smilegate or Super Creative.')}</p>
            <p>{t('footer.copyright', 'Epic Seven and all its content are property of their respective owners.')}</p>
          </div>
          <div className="flex gap-4">
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
