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

