"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import PetCard from "@/components/pets/PetCard";
import type { Pet } from "@/types/database";

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState<Pet[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchFavorites = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from("favorites")
                .select(`
          pet:pets (*)
        `)
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (data) {
                const pets = data
                    .map(f => {
                        const petData = f.pet;
                        return Array.isArray(petData) ? petData[0] : petData;
                    })
                    .filter((p): p is Pet => p !== null);
                setFavorites(pets);
            }
            setLoading(false);
        };

        fetchFavorites();
    }, [supabase]);

    const removeFavorite = async (petId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase
            .from("favorites")
            .delete()
            .eq("user_id", user.id)
            .eq("pet_id", petId);

        setFavorites(prev => prev.filter(p => p.id !== petId));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">我的收藏</h1>
                <p className="text-[var(--muted)]">
                    您收藏的宠物会显示在这里
                </p>
            </div>

            {favorites.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {favorites.map((pet) => (
                        <PetCard
                            key={pet.id}
                            pet={pet}
                            isFavorited={true}
                            onToggleFavorite={() => removeFavorite(pet.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                        <Heart className="w-8 h-8 text-[var(--muted)]" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">暂无收藏</h3>
                    <p className="text-[var(--muted)] mb-6">
                        浏览宠物时，点击爱心图标即可收藏
                    </p>
                    <Link href="/pets" className="btn-primary">
                        浏览宠物
                    </Link>
                </div>
            )}
        </div>
    );
}
