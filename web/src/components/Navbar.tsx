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
    { href: '/news', label: t('nav.news', 'News') },
    { href: '/guilds', label: t('nav.guilds', 'Guilds') },
    { href: '/credits', label: t('nav.credits', 'Credits') },
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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = getNavLinks(t);

    // Check authentication on mount and listen for storage changes
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                setUser(null);
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
                    setUser(null);
                }
            } catch {
                // Silent fail
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();

        // Listen for storage changes (login from another tab or callback page)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'auth_token') {
                checkAuth();
            }
        };

        // Listen for custom auth change event (same tab)
        const handleAuthChange = () => {
            checkAuth();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('authChange', handleAuthChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('authChange', handleAuthChange);
        };
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

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
        <header className="sticky top-0 z-50 w-full border-b border-white/6 bg-e7-void/95 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo & App Name */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-9 h-9 rounded-lg bg-e7-panel flex items-center justify-center overflow-hidden border border-white/8 transition-colors group-hover:border-e7-gold/40">
                        <Image src="/images/icon_menu_orbis.png" alt="ORBIS" width={36} height={36} className="object-cover" unoptimized />
                    </div>
                    <div className="hidden sm:block">
                        <h1 className="text-base font-semibold text-e7-gold tracking-wide">
                            EXCOFF E7 HUB
                        </h1>
                    </div>
                </Link>

                {/* Desktop Navigation Links */}
                <nav className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href ||
                            (link.href !== '/' && pathname.startsWith(link.href));

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                    ? 'bg-white/8 text-e7-gold'
                                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/4'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                    {/* Social Links */}
                    <a
                        href="https://discord.gg/Tx7Nr6vJjp"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-2 rounded-md text-sm font-medium text-neutral-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                        title="Discord"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                        </svg>
                    </a>
                    <a
                        href="https://www.youtube.com/@EXCOFFe7"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-2 rounded-md text-sm font-medium text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="YouTube"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                    </a>
                </nav>

                {/* Right Side - User & Language */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <LanguageSelector />

                    {!isLoading && (
                        user ? (
                            <div className="hidden sm:flex items-center gap-2">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/4 border border-white/8">
                                    {user.avatar ? (
                                        <Image
                                            src={user.avatar}
                                            alt={user.name}
                                            width={24}
                                            height={24}
                                            className="w-6 h-6 rounded-full"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full bg-e7-gold flex items-center justify-center text-xs text-e7-void font-medium">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="text-sm text-neutral-300">{user.name}</span>
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
                            <Link href="/login" className="hidden sm:block">
                                <Button size="sm" className="btn-gold px-4 rounded-md">
                                    {t('nav.login', 'Login')}
                                </Button>
                            </Link>
                        )
                    )}

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-white/4 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-e7-gold/20 bg-e7-void/95 backdrop-blur-xl">
                    <nav className="container mx-auto px-4 py-4 space-y-2">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href ||
                                (link.href !== '/' && pathname.startsWith(link.href));

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`block px-4 py-3 rounded-lg text-base font-medium transition-all ${isActive
                                        ? 'bg-e7-gold/15 text-e7-gold border border-e7-gold/30'
                                        : 'text-slate-400 hover:text-e7-gold hover:bg-e7-panel/50 border border-transparent'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}

                        {/* Mobile Login/User */}
                        {!isLoading && (
                            user ? (
                                <div className="pt-2 border-t border-e7-gold/10 mt-2">
                                    <div className="flex items-center gap-3 px-4 py-2">
                                        {user.avatar ? (
                                            <Image
                                                src={user.avatar}
                                                alt={user.name}
                                                width={32}
                                                height={32}
                                                className="w-8 h-8 rounded-full ring-1 ring-e7-gold/30"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-e7-gold to-e7-gold-dim flex items-center justify-center text-sm text-e7-void font-bold">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <span className="text-slate-300">{user.name}</span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        {t('nav.logout', 'Logout')}
                                    </button>
                                </div>
                            ) : (
                                <Link href="/login" className="block">
                                    <Button className="w-full btn-gold rounded-lg mt-2">
                                        {t('nav.login', 'Login')}
                                    </Button>
                                </Link>
                            )
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}

