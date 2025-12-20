'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function CreditsPage() {
    const credits = [
        {
            name: 'Epic Seven',
            description: 'Epic Seven is developed and published by Smilegate Megaport. All game assets, characters, and related content are property of Smilegate.',
            url: 'https://epic7.smilegatemegaport.com/',
            logo: '/images/e7-logo.png'
        },
        {
            name: 'Epic7DB',
            description: 'Artifact images are provided by Epic7DB. A comprehensive database for Epic Seven game data.',
            url: 'https://epic7db.com/',
            logo: null
        },
        {
            name: 'Fribbels Epic 7 Optimizer',
            description: 'Hero and artifact data structures are based on the Fribbels Epic 7 Optimizer, an essential tool for the E7 community.',
            url: 'https://github.com/fribbels/Fribbels-Epic-7-Optimizer',
            logo: null
        },
        {
            name: 'EpicSevenDB (E7DB)',
            description: 'Some hero data and game mechanics information sourced from EpicSevenDB community resources.',
            url: 'https://epicsevendb.com/',
            logo: null
        }
    ];

    return (
        <div className="min-h-screen py-8 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-e7-gold mb-4">
                        Credits & Acknowledgments
                    </h1>
                    <p className="text-xl text-slate-400">
                        Thank you to these amazing resources and communities
                    </p>
                </div>

                {/* Credits List */}
                <div className="space-y-6">
                    {credits.map((credit, index) => (
                        <div
                            key={index}
                            className="glass-panel border-e7-gold/20 rounded-xl p-6 hover:border-e7-gold/40 transition-all"
                        >
                            <div className="flex items-start gap-6">
                                {credit.logo && (
                                    <div className="flex-shrink-0">
                                        <Image
                                            src={credit.logo}
                                            alt={credit.name}
                                            width={80}
                                            height={80}
                                            className="rounded-lg"
                                            unoptimized
                                        />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-e7-gold mb-2">
                                        {credit.name}
                                    </h2>
                                    <p className="text-slate-300 mb-4 text-lg">
                                        {credit.description}
                                    </p>
                                    {credit.url && (
                                        <a
                                            href={credit.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                                        >
                                            <span>Visit Website</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                                            </svg>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Disclaimer */}
                <div className="mt-12 p-6 bg-slate-800/50 rounded-xl border border-slate-700">
                    <h3 className="text-xl font-bold text-white mb-3">
                        Disclaimer
                    </h3>
                    <p className="text-slate-400 leading-relaxed">
                        This is a fan-made website and is not affiliated with, endorsed by, or sponsored by Smilegate or any of its subsidiaries. Epic Seven™ and all related characters, names, and indicia are trademarks of Smilegate Megaport. All game content and assets are property of their respective owners. This site is created for educational and community purposes only.
                    </p>
                </div>

                {/* Back to Home */}
                <div className="mt-8 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-e7-gold/20 text-e7-gold rounded-lg hover:bg-e7-gold/30 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
