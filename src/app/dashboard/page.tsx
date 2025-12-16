import Link from "next/link";
import { redirect } from "next/navigation";
import {
    PawPrint,
    Heart,
    FileText,
    MessageSquare,
    Bell,
    User,
    ChevronRight,
    Plus
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect("/auth/login");
    }

    // Fetch user profile
    const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

    // Fetch stats
    const [petsResult, applicationsResult, favoritesResult, notificationsResult] = await Promise.all([
        supabase.from("pets").select("id", { count: "exact" }).eq("publisher_id", user.id),
        supabase.from("adoption_applications").select("id", { count: "exact" }).eq("applicant_id", user.id),
        supabase.from("favorites").select("id", { count: "exact" }).eq("user_id", user.id),
        supabase.from("notifications").select("id", { count: "exact" }).eq("user_id", user.id).eq("is_read", false),
    ]);

    const stats = {
        myPets: petsResult.count || 0,
        myApplications: applicationsResult.count || 0,
        myFavorites: favoritesResult.count || 0,
        unreadNotifications: notificationsResult.count || 0,
    };

    const quickLinks = [
        {
            href: "/dashboard/my-pets",
            icon: PawPrint,
            label: "我的宠物",
            count: stats.myPets,
            color: "from-primary-500 to-primary-600",
        },
        {
            href: "/dashboard/applications",
            icon: FileText,
            label: "我的申请",
            count: stats.myApplications,
            color: "from-blue-500 to-blue-600",
        },
        {
            href: "/dashboard/favorites",
            icon: Heart,
            label: "我的收藏",
            count: stats.myFavorites,
            color: "from-pink-500 to-pink-600",
        },
        {
            href: "/dashboard/notifications",
            icon: Bell,
            label: "通知",
            count: stats.unreadNotifications,
            color: "from-amber-500 to-amber-600",
            showBadge: stats.unreadNotifications > 0,
        },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-1">
                        你好，{profile?.display_name || "用户"} 👋
                    </h1>
                    <p className="text-[var(--muted)]">
                        欢迎回到 MyPets 控制台
                    </p>
                </div>
                <Link href="/publish" className="btn-primary inline-flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    <span>发布宠物</span>
                </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {quickLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="relative bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 hover:shadow-lg transition-shadow group"
                    >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <link.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-medium text-[var(--muted)] mb-1">{link.label}</h3>
                        <p className="text-2xl font-bold">{link.count}</p>
                        {link.showBadge && (
                            <span className="absolute top-4 right-4 w-3 h-3 bg-primary-500 rounded-full animate-pulse" />
                        )}
                        <ChevronRight className="absolute bottom-6 right-6 w-5 h-5 text-[var(--muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                ))}
            </div>

            {/* Profile Card */}
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6">
                <div className="flex items-start justify-between mb-6">
                    <h2 className="text-lg font-semibold">个人资料</h2>
                    <Link
                        href="/dashboard/profile"
                        className="text-sm text-primary-500 hover:text-primary-600 transition-colors"
                    >
                        编辑
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center">
                        {profile?.avatar_url ? (
                            <img
                                src={profile.avatar_url}
                                alt={profile.display_name || ""}
                                className="w-full h-full rounded-full object-cover"
                            />
                        ) : (
                            <User className="w-8 h-8 text-white" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">{profile?.display_name || "未设置昵称"}</h3>
                        <p className="text-[var(--muted)]">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs rounded-full">
                            {profile?.role === "admin" ? "管理员" : profile?.role === "publisher" ? "发布者" : "普通用户"}
                        </span>
                    </div>
                </div>

                {profile?.bio && (
                    <p className="mt-4 text-[var(--muted)] text-sm">{profile.bio}</p>
                )}

                {profile?.location && (
                    <p className="mt-2 text-[var(--muted)] text-sm">📍 {profile.location}</p>
                )}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link
                    href="/pets"
                    className="flex items-center gap-4 p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl hover:border-primary-500 transition-colors"
                >
                    <PawPrint className="w-6 h-6 text-primary-500" />
                    <span className="font-medium">浏览所有宠物</span>
                    <ChevronRight className="w-5 h-5 text-[var(--muted)] ml-auto" />
                </Link>

                <Link
                    href="/dashboard/messages"
                    className="flex items-center gap-4 p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl hover:border-primary-500 transition-colors"
                >
                    <MessageSquare className="w-6 h-6 text-blue-500" />
                    <span className="font-medium">查看消息</span>
                    <ChevronRight className="w-5 h-5 text-[var(--muted)] ml-auto" />
                </Link>

                <Link
                    href="/stories"
                    className="flex items-center gap-4 p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl hover:border-primary-500 transition-colors"
                >
                    <Heart className="w-6 h-6 text-pink-500" />
                    <span className="font-medium">成功案例</span>
                    <ChevronRight className="w-5 h-5 text-[var(--muted)] ml-auto" />
                </Link>
            </div>
        </div>
    );
}
