'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "@/hooks/useTranslations";

export default function Home() {
  const { t } = useTranslations();

  return (
    <main className="min-h-screen bg-e7-void">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="font-display text-5xl md:text-7xl font-bold text-e7-text-gold mb-6 tracking-wide">
            E7 EXCOFF
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-2 font-medium">
            Builder & Guides
          </p>
          <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto">
            {t('home.subtitle', 'Discover and publish your character builds and create game guides for the community')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/heroes">
              <Button size="lg" className="bg-e7-gold text-black hover:bg-e7-text-gold font-semibold px-8">
                {t('home.exploreHeroes', 'Explore Heroes')}
              </Button>
            </Link>
            <Link href="/guides">
              <Button size="lg" variant="outline" className="border-e7-gold text-e7-gold hover:bg-e7-gold/10 px-8">
                {t('home.viewGuides', 'View Guides')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-e7-panel/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl text-center text-e7-gold mb-12">
            {t('home.whatYouFind', 'What will you find?')}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-e7-panel border-e7-gold/30 hover:border-e7-gold transition-colors">
              <CardHeader>
                <CardTitle className="text-e7-text-gold font-display">🗡️ {t('home.heroWiki', 'Hero Wiki')}</CardTitle>
                <CardDescription className="text-gray-400">
                  {t('home.heroWikiDesc', 'Explore all the heroes in the game, their information and builds created by the community.')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm">
                  {t('home.heroWikiDetails', 'Complete database with stats, skills, multipliers and popular builds.')}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-e7-panel border-e7-gold/30 hover:border-e7-gold transition-colors">
              <CardHeader>
                <CardTitle className="text-e7-text-gold font-display">📊 {t('home.communityBuilds', 'Community Builds')}</CardTitle>
                <CardDescription className="text-gray-400">
                  {t('home.communityBuildsDesc', 'Create and share your builds with recommended stats, sets and artifacts.')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm">
                  {t('home.communityBuildsDetails', 'Build system with synergies, counters and detailed descriptions.')}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-e7-panel border-e7-gold/30 hover:border-e7-gold transition-colors">
              <CardHeader>
                <CardTitle className="text-e7-text-gold font-display">⚔️ {t('home.gameGuides', 'Game Guides')}</CardTitle>
                <CardDescription className="text-gray-400">
                  {t('home.gameGuidesDesc', 'Guides for PVE, RTA, Arena, Guild War and more game content.')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm">
                  {t('home.gameGuidesDetails', 'Videos, images and strategies to master each game mode.')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl text-e7-text-gold mb-4">
            {t('home.readyToShare', 'Ready to share your knowledge?')}
          </h2>
          <p className="text-gray-400 mb-8">
            {t('home.createAccount', 'Create your account and start contributing guides and builds for your favorite heroes.')}
          </p>
          <Link href="/register">
            <Button className="bg-e7-gold text-black hover:bg-e7-text-gold font-semibold px-8">
              {t('home.joinCommunity', 'Join the Community')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-e7-gold/20 py-8 px-4 text-center text-gray-500 text-sm">
        <p>{t('footer.notAffiliated', 'E7 EXCOFF is not affiliated with Smilegate or Super Creative.')}</p>
        <p>{t('footer.copyright', 'Epic Seven and all its content are property of their respective owners.')}</p>
      </footer>
    </main>
  );
}
