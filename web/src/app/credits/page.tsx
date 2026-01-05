import Link from "next/link";
import { ArrowLeft, Database, Github, Heart, Server, Users } from "lucide-react";
import { useTranslations } from "next-intl";

export default function CreditsPage() {
    const t = useTranslations('credits');
    const tNav = useTranslations('nav');

    return (
        <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-void-radial -z-20 opacity-50" />
            <div className="absolute top-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
            <div className="absolute bottom-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl -z-10" />

            <div className="max-w-4xl mx-auto space-y-12">
                {/* Header */}
                <div className="space-y-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">
                        {t('title')}
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        {t('description')}
                    </p>
                </div>

                {/* Developer Section */}
                <section className="glass-panel p-8 rounded-2xl border-l-4 border-primary">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/20 rounded-xl">
                            <Users className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-2">{t('developer_title')}</h2>
                            <p className="text-gray-300 leading-relaxed mb-4">
                                {t('built_with')} <Heart className="w-4 h-4 inline text-red-500 mx-1" /> {t('by_author')}
                            </p>
                            <p className="text-sm text-gray-400">
                                {t('dedication')}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Data Sources Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* CeciliaBot */}
                    <div className="glass-panel p-6 rounded-xl hover:border-accent/50 transition-colors duration-300">
                        <div className="flex items-center gap-3 mb-4">
                            <Database className="w-6 h-6 text-accent" />
                            <h3 className="text-xl font-bold">CeciliaBot</h3>
                        </div>
                        <p className="text-gray-400 text-sm mb-6 min-h-[60px]">
                            {t('ceciliabot_desc')}
                        </p>
                        <div className="flex gap-4">
                            <Link href="https://ceciliabot.github.io/" target="_blank" className="text-xs font-mono border border-white/10 px-3 py-1.5 rounded hover:bg-white/5 transition-colors">
                                {t('website')}
                            </Link>
                            <Link href="https://github.com/CeciliaBot/E7Tools" target="_blank" className="text-xs font-mono border border-white/10 px-3 py-1.5 rounded hover:bg-white/5 transition-colors flex items-center gap-2">
                                <Github className="w-3 h-3" /> GitHub
                            </Link>
                        </div>
                    </div>

                    {/* Fribbels */}
                    <div className="glass-panel p-6 rounded-xl hover:border-accent/50 transition-colors duration-300">
                        <div className="flex items-center gap-3 mb-4">
                            <Server className="w-6 h-6 text-green-400" />
                            <h3 className="text-xl font-bold">Fribbels Optimizer</h3>
                        </div>
                        <p className="text-gray-400 text-sm mb-6 min-h-[60px]">
                            {t('fribbels_desc')}
                        </p>
                        <Link href="https://github.com/fribbels/Fribbels-Epic-7-Optimizer" target="_blank" className="text-xs font-mono border border-white/10 px-3 py-1.5 rounded hover:bg-white/5 transition-colors inline-flex items-center gap-2">
                            <Github className="w-3 h-3" /> {t('repository')}
                        </Link>
                    </div>

                    {/* Reddit Datamines */}
                    <div className="glass-panel p-6 rounded-xl hover:border-accent/50 transition-colors duration-300">
                        <div className="flex items-center gap-3 mb-4">
                            <Users className="w-6 h-6 text-orange-400" />
                            <h3 className="text-xl font-bold">{t('reddit_title')}</h3>
                        </div>
                        <p className="text-gray-400 text-sm mb-6 min-h-[60px]">
                            {t('reddit_desc')}
                        </p>
                        <Link href="https://www.reddit.com/r/EpicSeven/" target="_blank" className="text-xs font-mono border border-white/10 px-3 py-1.5 rounded hover:bg-white/5 transition-colors">
                            r/EpicSeven
                        </Link>
                    </div>
                </div>

                <div className="flex justify-center pt-8">
                    <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" /> {tNav('home')}
                    </Link>
                </div>
            </div>
        </main>
    );
}
