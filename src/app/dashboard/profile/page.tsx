"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User as AppUser } from "@/types/database";

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<AppUser | null>(null);
    const [formData, setFormData] = useState({
        display_name: "",
        bio: "",
        location: "",
        phone: "",
    });

    const supabase = createClient();

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/auth/login");
                return;
            }

            const { data } = await supabase
                .from("users")
                .select("*")
                .eq("id", user.id)
                .single();

            if (data) {
                setProfile(data);
                setFormData({
                    display_name: data.display_name || "",
                    bio: data.bio || "",
                    location: data.location || "",
                    phone: data.phone || "",
                });
            }
            setLoading(false);
        };

        fetchProfile();
    }, [router, supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from("users")
                .update({
                    display_name: formData.display_name || null,
                    bio: formData.bio || null,
                    location: formData.location || null,
                    phone: formData.phone || null,
                })
                .eq("id", user.id);

            if (!error) {
                router.push("/dashboard");
            }
        } catch (err) {
            console.error("Error updating profile:", err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] mb-4 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>返回</span>
                </button>
                <h1 className="text-3xl font-bold mb-2">编辑个人资料</h1>
                <p className="text-[var(--muted)]">
                    完善您的个人信息
                </p>
            </div>

            {/* Avatar Preview */}
            <div className="flex items-center gap-4 mb-8 p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center">
                    {profile?.avatar_url ? (
                        <img
                            src={profile.avatar_url}
                            alt={profile.display_name || ""}
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : (
                        <User className="w-10 h-10 text-white" />
                    )}
                </div>
                <div>
                    <p className="font-medium">{formData.display_name || "未设置昵称"}</p>
                    <p className="text-sm text-[var(--muted)]">头像来自您的登录账户</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Display Name */}
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6">
                    <label className="block text-sm font-medium mb-2">
                        昵称
                    </label>
                    <input
                        type="text"
                        value={formData.display_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                        placeholder="您希望别人如何称呼您"
                        className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:border-primary-500"
                    />
                </div>

                {/* Bio */}
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6">
                    <label className="block text-sm font-medium mb-2">
                        个人简介
                    </label>
                    <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="介绍一下自己..."
                        rows={3}
                        className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:border-primary-500 resize-none"
                    />
                </div>

                {/* Location */}
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6">
                    <label className="block text-sm font-medium mb-2">
                        所在城市
                    </label>
                    <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="例如：北京市"
                        className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:border-primary-500"
                    />
                </div>

                {/* Phone */}
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6">
                    <label className="block text-sm font-medium mb-2">
                        联系电话
                    </label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="用于发布者联系您"
                        className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:border-primary-500"
                    />
                    <p className="text-xs text-[var(--muted)] mt-2">
                        仅在您提交领养申请后对发布者可见
                    </p>
                </div>

                {/* Submit */}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <div className="spinner w-5 h-5"></div>
                                <span>保存中...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                <span>保存更改</span>
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="btn-secondary flex-1"
                    >
                        取消
                    </button>
                </div>
            </form>
        </div>
    );
}
