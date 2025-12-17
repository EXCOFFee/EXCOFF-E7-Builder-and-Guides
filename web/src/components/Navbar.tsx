'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LanguageSelector } from './LanguageSelector';
import { Button } from './ui/button';
import { useTranslations } from '@/hooks/useTranslations';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const getNavLinks = (t: (key: string, fallback: string) => string) => [
    { href: '/', label: t('nav.home', 'Home') },
    { href: '/heroes', label: t('nav.heroes', 'Heroes') },
    { href: '/builds', label: t('nav.builds', 'Builds') },
    { href: '/guides', label: t('nav.guides', 'Guides') },
    { href: '/guilds', label: t('nav.guilds', 'Guilds') },
];

interface User {
    id: number;
    name: string;
    avatar: string | null;
}

export function Navbar() {
    const pathname = usePathname();
    const { t } = useTranslations();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const navLinks = getNavLinks(t);

    // Check authentication on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_URL}/user`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                } else {
                    localStorage.removeItem('auth_token');
                }
            } catch {
                // Silent fail
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const handleLogout = async () => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            try {
                await fetch(`${API_URL}/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
            } catch {
                // Ignore errors
            }
        }
        localStorage.removeItem('auth_token');
        setUser(null);
        window.location.reload();
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-e7-gold/20 bg-e7-void/80 backdrop-blur-xl supports-[backdrop-filter]:bg-e7-void/70 shadow-lg shadow-black/20">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo & App Name */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-e7-gold to-e7-purple flex items-center justify-center overflow-hidden ring-2 ring-e7-gold/30 group-hover:ring-e7-gold/60 transition-all group-hover:shadow-lg group-hover:shadow-e7-gold/20">
                        <Image src="/images/LogoEXCOFF.jpg" alt="ORBIS" width={40} height={40} className="object-cover" unoptimized />
                    </div>
                    <div className="hidden sm:block">
                        <h1 className="text-lg font-bold text-gold-gradient tracking-wide group-hover:opacity-90 transition-opacity">
                            ORBIS HELPER
                        </h1>
                        <p className="text-xs text-slate-500 -mt-1 tracking-wider">
                            by EXCOFF
                        </p>
                    </div>
                </Link>

                {/* Navigation Links */}
                <nav className="flex items-center gap-1">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href ||
                            (link.href !== '/' && pathname.startsWith(link.href));

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative ${isActive
                                    ? 'bg-e7-gold/15 text-e7-gold border border-e7-gold/30'
                                    : 'text-slate-400 hover:text-e7-gold hover:bg-e7-panel/50 border border-transparent hover:border-e7-gold/20'
                                    }`}
                            >
                                {link.label}
                                {isActive && (
                                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-e7-gold rounded-full" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Right Side - User & Language */}
                <div className="flex items-center gap-3">
                    <LanguageSelector />

                    {!isLoading && (
                        user ? (
                            <div className="flex items-center gap-2">
                                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg glass-panel border border-e7-gold/20 hover:border-e7-gold/40 transition-colors">
                                    {user.avatar ? (
                                        <Image
                                            src={user.avatar}
                                            alt={user.name}
                                            width={24}
                                            height={24}
                                            className="w-6 h-6 rounded-full ring-1 ring-e7-gold/30"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-e7-gold to-e7-gold-dim flex items-center justify-center text-xs text-e7-void font-bold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="text-sm text-slate-300">{user.name}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="text-xs text-slate-500 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-red-500/10"
                                    title={t('nav.logout', 'Logout')}
                                >
                                    {t('nav.logout', 'Logout')}
                                </button>
                            </div>
                        ) : (
                            <Link href="/login">
                                <Button size="sm" className="btn-gold px-4 rounded-lg shadow-lg shadow-e7-gold/20 hover:shadow-e7-gold/40">
                                    {t('nav.login', 'Login')}
                                </Button>
                            </Link>
                        )
                    )}
                </div>
            </div>
        </header>
    );
}
