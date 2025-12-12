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
    { href: '/guides', label: t('nav.guides', 'Guides') },
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
        <header className="sticky top-0 z-50 w-full border-b border-e7-gold/20 bg-e7-void/95 backdrop-blur supports-[backdrop-filter]:bg-e7-void/80">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo & App Name */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-e7-gold to-blue-600 flex items-center justify-center">
                        <span className="text-white font-bold text-xl">E7</span>
                    </div>
                    <div className="hidden sm:block">
                        <h1 className="text-lg font-bold text-e7-gold group-hover:text-e7-text-gold transition-colors">
                            E7 EXCOFF
                        </h1>
                        <p className="text-xs text-gray-400 -mt-1">
                            Builder & Guides
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
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-e7-gold/20 text-e7-gold'
                                    : 'text-gray-400 hover:text-e7-gold hover:bg-e7-panel'
                                    }`}
                            >
                                {link.label}
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
                                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-e7-panel border border-e7-gold/30">
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
                                        <div className="w-6 h-6 rounded-full bg-e7-gold/30 flex items-center justify-center text-xs text-e7-gold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="text-sm text-gray-300">{user.name}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                                    title="Cerrar sesión"
                                >
                                    Salir
                                </button>
                            </div>
                        ) : (
                            <Link href="/login">
                                <Button size="sm" className="bg-e7-gold text-black hover:bg-e7-text-gold">
                                    Iniciar Sesión
                                </Button>
                            </Link>
                        )
                    )}
                </div>
            </div>
        </header>
    );
}
