'use client';

import { useTranslations } from "@/hooks/useTranslations";
import Link from 'next/link';
import { ArrowLeft, Database, Github, Server, Users } from "lucide-react";

export default function CreditsPage() {
    const { t } = useTranslations();

    return (
        <div className="min-h-screen bg-e7-void py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-12 text-center">
                    <h1 className="font-display text-4xl md:text-5xl text-gold-gradient tracking-wide mb-2">
                        {t('credits.title', 'Credits & Acknowledgements')}
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        {t('credits.description', 'This project is made possible thanks to the amazing Epic Seven community and the developers who build tools for it.')}
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Developer */}
                    <div className="glass-panel p-8 rounded-xl border border-e7-gold/20">
                        <div className="flex items-center gap-3 mb-6 border-b border-e7-gold/10 pb-4">
                            <span className="p-2 bg-e7-gold/10 rounded-lg text-e7-gold">
                                <Users size={24} />
                            </span>
                            <h2 className="text-2xl font-semibold text-e7-gold">
                                {t('credits.developer_title', 'Developed By')}
                            </h2>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex flex-col">
                                <span className="text-lg font-medium text-slate-200 flex items-center gap-2">
                                    {t('credits.built_with', 'Built with')} <Heart className="text-red-500 fill-red-500" size={16} /> {t('credits.by_author', 'by Santi and the Antigravity AI team.')}
                                </span>
                                <span className="text-sm text-slate-500 mt-1">
                                    {t('credits.dedication', 'Dedicated to providing the best tools for the E7 community.')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Data Sources */}
                    <div className="glass-panel p-8 rounded-xl border border-e7-gold/20">
                        <div className="flex items-center gap-3 mb-6 border-b border-e7-gold/10 pb-4">
                            <span className="p-2 bg-e7-gold/10 rounded-lg text-e7-gold">
                                <Database size={24} />
                            </span>
                            <h2 className="text-2xl font-semibold text-e7-gold">
                                {t('footer.dataPoweredBy', 'Hero & Artifact Data Powered By')}
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* CeciliaBot */}
                            <div className="bg-e7-void/40 p-5 rounded-lg border border-white/5 hover:border-e7-gold/30 transition-colors group">
                                <div className="flex items-center gap-2 mb-2">
                                    <Server className="text-e7-gold" size={20} />
                                    <h3 className="text-xl font-medium text-slate-100 group-hover:text-e7-gold transition-colors">CeciliaBot</h3>
                                </div>
                                <p className="text-sm text-slate-400 mb-4 h-10">
                                    {t('credits.ceciliabot_desc', 'Invaluable source for detailed skill descriptions, translations, and game data.')}
                                </p>
                                <a
                                    href="https://ceciliabot.github.io/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-e7-gold hover:text-white text-sm font-medium inline-flex items-center gap-1 transition-colors"
                                >
                                    {t('credits.website', 'Website')} <div className="text-xs">↗</div>
                                </a>
                            </div>

                            {/* Fribbels */}
                            <div className="bg-e7-void/40 p-5 rounded-lg border border-white/5 hover:border-e7-gold/30 transition-colors group">
                                <div className="flex items-center gap-2 mb-2">
                                    <Github className="text-e7-gold" size={20} />
                                    <h3 className="text-xl font-medium text-slate-100 group-hover:text-e7-gold transition-colors">Fribbels E7 Optimizer</h3>
                                </div>
                                <p className="text-sm text-slate-400 mb-4 h-10">
                                    {t('credits.fribbels_desc', 'Provides the foundational hero and artifact database used throughout this application.')}
                                </p>
                                <a
                                    href="https://github.com/fribbels/Fribbels-Epic-7-Optimizer"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-e7-gold hover:text-white text-sm font-medium inline-flex items-center gap-1 transition-colors"
                                >
                                    {t('credits.repository', 'Repository')} <div className="text-xs">↗</div>
                                </a>
                            </div>

                            {/* Reddit Datamines */}
                            <div className="bg-e7-void/40 p-5 rounded-lg border border-white/5 hover:border-e7-gold/30 transition-colors md:col-span-2 group">
                                <div className="flex items-center gap-2 mb-2">
                                    <Users className="text-e7-gold" size={20} />
                                    <h3 className="text-xl font-medium text-slate-100 group-hover:text-e7-gold transition-colors">{t('credits.reddit_title', 'Reddit Datamines')}</h3>
                                </div>
                                <p className="text-sm text-slate-400 mb-4">
                                    {t('credits.reddit_desc', 'Community contributors who extract skill multipliers and hidden data from game files.')}
                                </p>
                                <a
                                    href="https://www.reddit.com/r/EpicSeven/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-e7-gold hover:text-white text-sm font-medium inline-flex items-center gap-1 transition-colors"
                                >
                                    Reddit (r/EpicSeven) <div className="text-xs">↗</div>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <Link href="/" className="text-slate-500 hover:text-e7-gold transition-colors text-sm flex items-center justify-center gap-2">
                        <ArrowLeft size={16} /> {t('common.backToHome', 'Back to Home')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
