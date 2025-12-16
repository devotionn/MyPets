import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function AuthErrorPage() {
    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
            <div className="text-center max-w-md animate-fade-in">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-6">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold mb-4">登录失败</h1>
                <p className="text-[var(--muted)] mb-8">
                    抱歉，登录过程中发生了错误。这可能是由于网络问题或授权被拒绝导致的。
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/auth/login" className="btn-primary">
                        重新登录
                    </Link>
                    <Link href="/" className="btn-secondary">
                        返回首页
                    </Link>
                </div>
            </div>
        </div>
    );
}
