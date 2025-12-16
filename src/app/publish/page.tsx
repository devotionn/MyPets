"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, CheckCircle, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ImageUploader from "@/components/publish/ImageUploader";
import { speciesLabels, genderLabels, sizeLabels } from "@/lib/utils";
import type { PetSpecies, PetGender, PetSize } from "@/types/database";

export default function PublishPetPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [canPublish, setCanPublish] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        species: "dog" as PetSpecies,
        breed: "",
        age_years: 0,
        age_months: 0,
        gender: "unknown" as PetGender,
        size: "medium" as PetSize,
        location: "",
        description: "",
        health_status: "",
        vaccination_status: "",
        adoption_requirements: "",
        photos: [] as string[],
    });

    const supabase = createClient();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/auth/login?next=/publish");
                return;
            }

            // Check if user can publish (publisher or admin role)
            const { data: profile } = await supabase
                .from("users")
                .select("role")
                .eq("id", user.id)
                .single();

            if (profile?.role === "publisher" || profile?.role === "admin") {
                setCanPublish(true);
            } else {
                // For now, allow all users to publish (can be restricted later)
                setCanPublish(true);
            }

            setLoading(false);
        };

        checkUser();
    }, [router, supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.photos.length === 0) {
            setError("请至少上传一张宠物照片");
            return;
        }

        if (!formData.name || !formData.location || !formData.description) {
            setError("请填写所有必填字段");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/auth/login");
                return;
            }

            const { error: insertError } = await supabase
                .from("pets")
                .insert({
                    publisher_id: user.id,
                    name: formData.name,
                    species: formData.species,
                    breed: formData.breed || null,
                    age_years: formData.age_years,
                    age_months: formData.age_months,
                    gender: formData.gender,
                    size: formData.size,
                    location: formData.location,
                    description: formData.description,
                    health_status: formData.health_status || null,
                    vaccination_status: formData.vaccination_status || null,
                    adoption_requirements: formData.adoption_requirements || null,
                    photos: formData.photos,
                    status: "available",
                });

            if (insertError) {
                throw insertError;
            }

            setSubmitted(true);
        } catch (err) {
            console.error("Error publishing pet:", err);
            setError("发布失败，请稍后重试");
        } finally {
            setSubmitting(false);
        }
    };

    const updateField = (field: string, value: string | number | string[]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (error) setError(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="spinner"></div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-fade-in">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-teal-100 dark:bg-teal-900/20 rounded-full mb-6">
                    <CheckCircle className="w-10 h-10 text-teal-500" />
                </div>
                <h1 className="text-3xl font-bold mb-4">发布成功！</h1>
                <p className="text-[var(--muted)] mb-8">
                    您的宠物信息已成功发布，期待有爱心的领养者联系您。
                    您可以在"我的宠物"中管理已发布的宠物。
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/dashboard/my-pets" className="btn-primary">
                        查看我的宠物
                    </Link>
                    <Link href="/pets" className="btn-secondary">
                        浏览宠物
                    </Link>
                </div>
            </div>
        );
    }

    if (!canPublish) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 dark:bg-amber-900/20 rounded-full mb-6">
                    <AlertCircle className="w-10 h-10 text-amber-500" />
                </div>
                <h1 className="text-2xl font-bold mb-4">暂无发布权限</h1>
                <p className="text-[var(--muted)] mb-8">
                    您的账户还未开通发布权限。请联系管理员获取发布者权限。
                </p>
                <Link href="/" className="btn-primary">
                    返回首页
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] mb-4 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>返回</span>
                </Link>
                <h1 className="text-3xl font-bold mb-2">发布待领养宠物</h1>
                <p className="text-[var(--muted)]">
                    填写宠物信息，帮助它找到温暖的家
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Photo Upload */}
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6">
                    <h2 className="text-lg font-semibold mb-4">
                        宠物照片 <span className="text-red-500">*</span>
                    </h2>
                    <p className="text-sm text-[var(--muted)] mb-4">
                        第一张图片将作为封面展示，请上传清晰的宠物照片
                    </p>
                    <ImageUploader
                        images={formData.photos}
                        onChange={(photos) => updateField("photos", photos)}
                        maxImages={6}
                    />
                </div>

                {/* Basic Info */}
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6">
                    <h2 className="text-lg font-semibold mb-6">基本信息</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                宠物名字 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => updateField("name", e.target.value)}
                                placeholder="给它取个名字吧"
                                required
                                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:border-primary-500"
                            />
                        </div>

                        {/* Species */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                宠物类型 <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.species}
                                onChange={(e) => updateField("species", e.target.value)}
                                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:border-primary-500"
                            >
                                {Object.entries(speciesLabels).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Breed */}
                        <div>
                            <label className="block text-sm font-medium mb-2">品种</label>
                            <input
                                type="text"
                                value={formData.breed}
                                onChange={(e) => updateField("breed", e.target.value)}
                                placeholder="例如：金毛、英短、荷兰垂耳兔..."
                                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:border-primary-500"
                            />
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="block text-sm font-medium mb-2">性别</label>
                            <select
                                value={formData.gender}
                                onChange={(e) => updateField("gender", e.target.value)}
                                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:border-primary-500"
                            >
                                {Object.entries(genderLabels).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Age */}
                        <div>
                            <label className="block text-sm font-medium mb-2">年龄</label>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="0"
                                            max="30"
                                            value={formData.age_years}
                                            onChange={(e) => updateField("age_years", parseInt(e.target.value) || 0)}
                                            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:border-primary-500"
                                        />
                                        <span className="text-[var(--muted)]">岁</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="0"
                                            max="11"
                                            value={formData.age_months}
                                            onChange={(e) => updateField("age_months", parseInt(e.target.value) || 0)}
                                            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:border-primary-500"
                                        />
                                        <span className="text-[var(--muted)]">月</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Size */}
                        <div>
                            <label className="block text-sm font-medium mb-2">体型</label>
                            <select
                                value={formData.size}
                                onChange={(e) => updateField("size", e.target.value)}
                                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:border-primary-500"
                            >
                                {Object.entries(sizeLabels).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Location */}
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium mb-2">
                                所在城市 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => updateField("location", e.target.value)}
                                placeholder="例如：北京市朝阳区"
                                required
                                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:border-primary-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6">
                    <h2 className="text-lg font-semibold mb-4">
                        宠物介绍 <span className="text-red-500">*</span>
                    </h2>
                    <textarea
                        value={formData.description}
                        onChange={(e) => updateField("description", e.target.value)}
                        placeholder="介绍一下这只宠物的性格、习惯、喜好等..."
                        rows={5}
                        required
                        className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:border-primary-500 resize-none"
                    />
                </div>

                {/* Health Info */}
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6">
                    <h2 className="text-lg font-semibold mb-6">健康信息</h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">健康状况</label>
                            <textarea
                                value={formData.health_status}
                                onChange={(e) => updateField("health_status", e.target.value)}
                                placeholder="描述宠物的健康状态，是否有绝育、是否有遗传病等..."
                                rows={2}
                                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:border-primary-500 resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">疫苗接种情况</label>
                            <textarea
                                value={formData.vaccination_status}
                                onChange={(e) => updateField("vaccination_status", e.target.value)}
                                placeholder="已接种哪些疫苗，接种日期等..."
                                rows={2}
                                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:border-primary-500 resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Adoption Requirements */}
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6">
                    <h2 className="text-lg font-semibold mb-4">领养须知</h2>
                    <textarea
                        value={formData.adoption_requirements}
                        onChange={(e) => updateField("adoption_requirements", e.target.value)}
                        placeholder="对领养者的要求，例如：需要有稳定住所、需要签订领养协议等..."
                        rows={3}
                        className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:border-primary-500 resize-none"
                    />
                </div>

                {/* Submit */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {submitting ? (
                            <>
                                <div className="spinner w-5 h-5"></div>
                                <span>发布中...</span>
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                <span>发布宠物</span>
                            </>
                        )}
                    </button>
                    <Link href="/" className="btn-secondary flex-1 text-center">
                        取消
                    </Link>
                </div>
            </form>
        </div>
    );
}
