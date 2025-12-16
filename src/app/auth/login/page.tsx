import Link from "next/link";
import { PawPrint } from "lucide-react";
import AuthButtons from "@/components/auth/AuthButtons";

export default function LoginPage() {
    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-8 shadow-lg animate-fade-in">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-400 rounded-2xl mb-4">
                            <PawPrint className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">欢迎回来</h1>
                        <p className="text-[var(--muted)]">
                            登录您的 MyPets 账户
                        </p>
                    </div>

                    {/* Auth Buttons */}
                    <AuthButtons redirectTo="/" />

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[var(--card-border)]"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-[var(--card-bg)] text-[var(--muted)]">
                                或
                            </span>
                        </div>
                    </div>

                    {/* Terms */}
                    <p className="text-center text-sm text-[var(--muted)]">
                        登录即表示您同意我们的
                        <Link href="/terms" className="text-primary-500 hover:underline mx-1">
                            服务条款
                        </Link>
                        和
                        <Link href="/privacy" className="text-primary-500 hover:underline mx-1">
                            隐私政策
                        </Link>
                    </p>
                </div>

                {/* Additional info */}
                <div className="text-center mt-6">
                    <p className="text-[var(--muted)] text-sm">
                        还没有账户？使用上方的社交登录即可自动注册
                    </p>
                </div>
            </div>
        </div>
    );
}
