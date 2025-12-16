"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "@/lib/theme-provider";
import { createClient } from "@/lib/supabase/client";
import {
    Menu,
    X,
    Sun,
    Moon,
    Search,
    Heart,
    Bell,
    User,
    PawPrint,
    LogOut,
    LayoutDashboard
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { setTheme, resolvedTheme } = useTheme();
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setShowUserMenu(false);
    };

    const toggleTheme = () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
    };

    const navLinks = [
        { href: "/pets", label: "浏览宠物" },
        { href: "/publish", label: "发布领养" },
        { href: "/stories", label: "成功案例" },
    ];

    return (
        <nav className="sticky top-0 z-50 glass border-b border-[var(--card-border)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <PawPrint className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold gradient-text hidden sm:block">
                            MyPets
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-[var(--muted)] hover:text-[var(--foreground)] font-medium transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        {/* Search */}
                        <Link
                            href="/pets"
                            className="p-2 rounded-lg hover:bg-[var(--card-bg)] transition-colors"
                            title="搜索宠物"
                        >
                            <Search className="w-5 h-5 text-[var(--muted)]" />
                        </Link>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg hover:bg-[var(--card-bg)] transition-colors"
                            title={resolvedTheme === "dark" ? "切换亮色模式" : "切换暗色模式"}
                        >
                            {resolvedTheme === "dark" ? (
                                <Sun className="w-5 h-5 text-[var(--muted)]" />
                            ) : (
                                <Moon className="w-5 h-5 text-[var(--muted)]" />
                            )}
                        </button>

                        {user ? (
                            <>
                                {/* Favorites */}
                                <Link
                                    href="/dashboard/favorites"
                                    className="p-2 rounded-lg hover:bg-[var(--card-bg)] transition-colors"
                                    title="我的收藏"
                                >
                                    <Heart className="w-5 h-5 text-[var(--muted)]" />
                                </Link>

                                {/* Notifications */}
                                <Link
                                    href="/dashboard/notifications"
                                    className="p-2 rounded-lg hover:bg-[var(--card-bg)] transition-colors relative"
                                    title="通知"
                                >
                                    <Bell className="w-5 h-5 text-[var(--muted)]" />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full"></span>
                                </Link>

                                {/* User Menu */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--card-bg)] transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center">
                                            <User className="w-4 h-4 text-white" />
                                        </div>
                                    </button>

                                    {showUserMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-lg py-2 animate-fade-in">
                                            <Link
                                                href="/dashboard"
                                                className="flex items-center gap-2 px-4 py-2 hover:bg-[var(--background)] transition-colors"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                <LayoutDashboard className="w-4 h-4" />
                                                <span>控制台</span>
                                            </Link>
                                            <Link
                                                href="/dashboard/profile"
                                                className="flex items-center gap-2 px-4 py-2 hover:bg-[var(--background)] transition-colors"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                <User className="w-4 h-4" />
                                                <span>个人资料</span>
                                            </Link>
                                            <hr className="my-2 border-[var(--card-border)]" />
                                            <button
                                                onClick={handleSignOut}
                                                className="flex items-center gap-2 px-4 py-2 w-full text-left text-primary-500 hover:bg-[var(--background)] transition-colors"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>退出登录</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <Link href="/auth/login" className="btn-primary text-sm">
                                登录
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg hover:bg-[var(--card-bg)] transition-colors"
                        >
                            {resolvedTheme === "dark" ? (
                                <Sun className="w-5 h-5 text-[var(--muted)]" />
                            ) : (
                                <Moon className="w-5 h-5 text-[var(--muted)]" />
                            )}
                        </button>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-lg hover:bg-[var(--card-bg)] transition-colors"
                        >
                            {isOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isOpen && (
                    <div className="md:hidden py-4 border-t border-[var(--card-border)] animate-fade-in">
                        <div className="flex flex-col gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="px-4 py-2 rounded-lg hover:bg-[var(--card-bg)] transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <hr className="my-2 border-[var(--card-border)]" />
                            {user ? (
                                <>
                                    <Link
                                        href="/dashboard"
                                        className="px-4 py-2 rounded-lg hover:bg-[var(--card-bg)] transition-colors"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        控制台
                                    </Link>
                                    <Link
                                        href="/dashboard/favorites"
                                        className="px-4 py-2 rounded-lg hover:bg-[var(--card-bg)] transition-colors"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        我的收藏
                                    </Link>
                                    <button
                                        onClick={handleSignOut}
                                        className="px-4 py-2 rounded-lg text-left text-primary-500 hover:bg-[var(--card-bg)] transition-colors"
                                    >
                                        退出登录
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/auth/login"
                                    className="mx-4 btn-primary text-center"
                                    onClick={() => setIsOpen(false)}
                                >
                                    登录
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
