import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
            <div className="text-center max-w-md animate-fade-in">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
                    <FileQuestion className="w-10 h-10 text-[var(--muted)]" />
                </div>
                <h1 className="text-3xl font-bold mb-4">找不到宠物</h1>
                <p className="text-[var(--muted)] mb-8">
                    抱歉，您要查找的宠物不存在或已被删除。
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/pets" className="btn-primary">
                        浏览其他宠物
                    </Link>
                    <Link href="/" className="btn-secondary">
                        返回首页
                    </Link>
                </div>
            </div>
        </div>
    );
}
