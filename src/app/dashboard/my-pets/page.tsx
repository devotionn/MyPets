"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PawPrint, Edit, Trash2, Eye, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatRelativeTime, speciesLabels, statusLabels } from "@/lib/utils";
import type { Pet } from "@/types/database";

export default function MyPetsPage() {
    const router = useRouter();
    const [pets, setPets] = useState<Pet[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchPets = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/auth/login");
                return;
            }

            const { data } = await supabase
                .from("pets")
                .select("*")
                .eq("publisher_id", user.id)
                .order("created_at", { ascending: false });

            if (data) {
                setPets(data);
            }
            setLoading(false);
        };

        fetchPets();
    }, [router, supabase]);

    const deletePet = async (petId: string) => {
        if (!confirm("确定要删除这只宠物吗？此操作无法撤销。")) return;

        const { error } = await supabase
            .from("pets")
            .delete()
            .eq("id", petId);

        if (!error) {
            setPets(prev => prev.filter(p => p.id !== petId));
        }
    };

    const statusColors = {
        available: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
        pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        adopted: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">我的宠物</h1>
                    <p className="text-[var(--muted)]">
                        管理您发布的待领养宠物
                    </p>
                </div>
                <Link href="/publish" className="btn-primary inline-flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">发布新宠物</span>
                </Link>
            </div>

            {pets.length > 0 ? (
                <div className="space-y-4">
                    {pets.map((pet) => (
                        <div
                            key={pet.id}
                            className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start gap-4">
                                {/* Pet Image */}
                                <Link href={`/pets/${pet.id}`} className="shrink-0">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                                        {pet.photos && pet.photos.length > 0 ? (
                                            <img
                                                src={pet.photos[0]}
                                                alt={pet.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl">
                                                🐾
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <Link
                                                href={`/pets/${pet.id}`}
                                                className="font-semibold text-lg hover:text-primary-500 transition-colors"
                                            >
                                                {pet.name}
                                            </Link>
                                            <p className="text-sm text-[var(--muted)]">
                                                {speciesLabels[pet.species]} · {pet.breed || "混种"}
                                            </p>
                                        </div>

                                        <span className={`badge ${statusColors[pet.status]}`}>
                                            {statusLabels[pet.status]}
                                        </span>
                                    </div>

                                    <p className="text-sm text-[var(--muted)] mt-2 line-clamp-2">
                                        {pet.description}
                                    </p>

                                    <div className="flex items-center justify-between mt-4">
                                        <p className="text-xs text-[var(--muted)]">
                                            发布于 {formatRelativeTime(pet.created_at)}
                                        </p>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/pets/${pet.id}`}
                                                className="p-2 rounded-lg hover:bg-[var(--background)] transition-colors"
                                                title="查看"
                                            >
                                                <Eye className="w-5 h-5 text-[var(--muted)]" />
                                            </Link>
                                            <Link
                                                href={`/dashboard/my-pets/${pet.id}/edit`}
                                                className="p-2 rounded-lg hover:bg-[var(--background)] transition-colors"
                                                title="编辑"
                                            >
                                                <Edit className="w-5 h-5 text-[var(--muted)]" />
                                            </Link>
                                            <button
                                                onClick={() => deletePet(pet.id)}
                                                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                title="删除"
                                            >
                                                <Trash2 className="w-5 h-5 text-red-500" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                        <PawPrint className="w-8 h-8 text-[var(--muted)]" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">还没有发布宠物</h3>
                    <p className="text-[var(--muted)] mb-6">
                        发布您的第一只待领养宠物吧
                    </p>
                    <Link href="/publish" className="btn-primary">
                        发布宠物
                    </Link>
                </div>
            )}
        </div>
    );
}
