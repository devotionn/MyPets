"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Pet } from "@/types/database";

export default function AdoptionApplicationPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [petId, setPetId] = useState<string>("");
    const [pet, setPet] = useState<Pet | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        living_situation: "",
        has_other_pets: false,
        other_pets_details: "",
        experience_with_pets: "",
        why_adopt: "",
    });

    const supabase = createClient();

    useEffect(() => {
        const init = async () => {
            const { id } = await params;
            setPetId(id);

            // Check if user is logged in
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push(`/auth/login?next=/pets/${id}/apply`);
                return;
            }

            // Fetch pet info
            const { data: petData, error: petError } = await supabase
                .from("pets")
                .select("*")
                .eq("id", id)
                .single();

            if (petError || !petData) {
                router.push("/pets");
                return;
            }

            if (petData.status !== "available") {
                setError("该宠物目前不接受领养申请");
                setLoading(false);
                return;
            }

            // Check if already applied
            const { data: existing } = await supabase
                .from("adoption_applications")
                .select("id")
                .eq("pet_id", id)
                .eq("applicant_id", user.id)
                .single();

            if (existing) {
                setError("您已经申请过这只宠物了");
                setLoading(false);
                return;
            }

            setPet(petData);
            setLoading(false);
        };

        init();
    }, [params, router, supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/auth/login");
                return;
            }

            const { error: insertError } = await supabase
                .from("adoption_applications")
                .insert({
                    pet_id: petId,
                    applicant_id: user.id,
                    living_situation: formData.living_situation,
                    has_other_pets: formData.has_other_pets,
                    other_pets_details: formData.other_pets_details || null,
                    experience_with_pets: formData.experience_with_pets,
                    why_adopt: formData.why_adopt,
                });

            if (insertError) {
                throw insertError;
            }

            setSubmitted(true);
        } catch (err) {
            console.error("Error submitting application:", err);
            setError("提交申请时出错，请稍后重试");
        } finally {
            setSubmitting(false);
        }
    };

    const updateField = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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
                <h1 className="text-3xl font-bold mb-4">申请已提交！</h1>
                <p className="text-[var(--muted)] mb-8">
                    感谢您的申请！发布者将会审核您的申请并尽快与您联系。
                    您可以在"我的申请"中查看申请状态。
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/dashboard/applications" className="btn-primary">
                        查看我的申请
                    </Link>
                    <Link href="/pets" className="btn-secondary">
                        继续浏览
                    </Link>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Link href={`/pets/${petId}`} className="btn-primary">
                    返回宠物详情
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Back Button */}
            <Link
                href={`/pets/${petId}`}
                className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] mb-6 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                <span>返回</span>
            </Link>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">
                    申请领养 {pet?.name}
                </h1>
                <p className="text-[var(--muted)]">
                    请如实填写以下信息，帮助发布者了解您的情况
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Living Situation */}
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6">
                    <label className="block text-lg font-medium mb-4">
                        您的居住情况 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={formData.living_situation}
                        onChange={(e) => updateField("living_situation", e.target.value)}
                        placeholder="例如：自有住房/租房，公寓/别墅，面积大小，是否允许养宠..."
                        rows={3}
                        required
                        className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:border-primary-500 resize-none"
                    />
                </div>

                {/* Other Pets */}
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <label className="text-lg font-medium">您是否有其他宠物？</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.has_other_pets}
                                onChange={(e) => updateField("has_other_pets", e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                        </label>
                    </div>
                    {formData.has_other_pets && (
                        <textarea
                            value={formData.other_pets_details}
                            onChange={(e) => updateField("other_pets_details", e.target.value)}
                            placeholder="请描述您现有的宠物：种类、数量、年龄、性格等..."
                            rows={2}
                            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:border-primary-500 resize-none"
                        />
                    )}
                </div>

                {/* Pet Experience */}
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6">
                    <label className="block text-lg font-medium mb-4">
                        您的养宠经验 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={formData.experience_with_pets}
                        onChange={(e) => updateField("experience_with_pets", e.target.value)}
                        placeholder="请描述您之前养过的宠物、养宠时长、照顾经验等..."
                        rows={3}
                        required
                        className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:border-primary-500 resize-none"
                    />
                </div>

                {/* Why Adopt */}
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6">
                    <label className="block text-lg font-medium mb-4">
                        您为什么想领养这只宠物？ <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={formData.why_adopt}
                        onChange={(e) => updateField("why_adopt", e.target.value)}
                        placeholder="请描述您想领养的原因、对宠物的期待、您能提供的照顾等..."
                        rows={4}
                        required
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
                                <span>提交中...</span>
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                <span>提交申请</span>
                            </>
                        )}
                    </button>
                    <Link
                        href={`/pets/${petId}`}
                        className="btn-secondary flex-1 text-center"
                    >
                        取消
                    </Link>
                </div>
            </form>
        </div>
    );
}
