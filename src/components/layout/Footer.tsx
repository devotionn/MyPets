import Link from "next/link";
import { PawPrint, Heart, Github, Mail } from "lucide-react";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        platform: [
            { href: "/pets", label: "浏览宠物" },
            { href: "/publish", label: "发布领养" },
            { href: "/stories", label: "成功案例" },
        ],
        support: [
            { href: "/about", label: "关于我们" },
            { href: "/faq", label: "常见问题" },
            { href: "/contact", label: "联系我们" },
        ],
        legal: [
            { href: "/terms", label: "服务条款" },
            { href: "/privacy", label: "隐私政策" },
        ],
    };

    return (
        <footer className="bg-[var(--card-bg)] border-t border-[var(--card-border)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-400 rounded-xl flex items-center justify-center">
                                <PawPrint className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold gradient-text">MyPets</span>
                        </Link>
                        <p className="text-[var(--muted)] text-sm mb-4">
                            连接待领养宠物与爱心领养者，让每一个毛孩子都能找到温暖的家。
                        </p>
                        <div className="flex items-center gap-2 text-[var(--muted)]">
                            <Heart className="w-4 h-4 text-primary-500" />
                            <span className="text-sm">用爱改变生命</span>
                        </div>
                    </div>

                    {/* Platform Links */}
                    <div>
                        <h3 className="font-semibold mb-4">平台</h3>
                        <ul className="space-y-2">
                            {footerLinks.platform.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-[var(--muted)] hover:text-[var(--foreground)] text-sm transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div>
                        <h3 className="font-semibold mb-4">支持</h3>
                        <ul className="space-y-2">
                            {footerLinks.support.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-[var(--muted)] hover:text-[var(--foreground)] text-sm transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal & Social */}
                    <div>
                        <h3 className="font-semibold mb-4">法律条款</h3>
                        <ul className="space-y-2 mb-6">
                            {footerLinks.legal.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-[var(--muted)] hover:text-[var(--foreground)] text-sm transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <h3 className="font-semibold mb-4">联系方式</h3>
                        <div className="flex gap-3">
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-[var(--background)] hover:bg-primary-500 hover:text-white transition-colors"
                                title="GitHub"
                            >
                                <Github className="w-5 h-5" />
                            </a>
                            <a
                                href="mailto:contact@mypets.com"
                                className="p-2 rounded-lg bg-[var(--background)] hover:bg-primary-500 hover:text-white transition-colors"
                                title="Email"
                            >
                                <Mail className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-[var(--card-border)] text-center text-sm text-[var(--muted)]">
                    <p>© {currentYear} MyPets. 保留所有权利。</p>
                </div>
            </div>
        </footer>
    );
}
