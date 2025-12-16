"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PawPrint } from "lucide-react";
import PetCard from "@/components/pets/PetCard";
import PetFilters, { FilterState } from "@/components/pets/PetFilters";
import { createClient } from "@/lib/supabase/client";
import type { Pet } from "@/types/database";

const initialFilters: FilterState = {
    search: "",
    species: "",
    gender: "",
    size: "",
    location: "",
    minAge: "",
    maxAge: "",
};

function PetsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [pets, setPets] = useState<Pet[]>([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [userId, setUserId] = useState<string | null>(null);
    const [filters, setFilters] = useState<FilterState>(() => ({
        search: searchParams.get("search") || "",
        species: searchParams.get("species") || "",
        gender: searchParams.get("gender") || "",
        size: searchParams.get("size") || "",
        location: searchParams.get("location") || "",
        minAge: searchParams.get("minAge") || "",
        maxAge: searchParams.get("maxAge") || "",
    }));

    const supabase = createClient();

    // Get current user
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUserId(user?.id || null);
        };
        getUser();
    }, [supabase.auth]);

    // Fetch favorites
    useEffect(() => {
        if (!userId) return;

        const fetchFavorites = async () => {
            const { data } = await supabase
                .from("favorites")
                .select("pet_id")
                .eq("user_id", userId);

            if (data) {
                setFavorites(new Set(data.map(f => f.pet_id)));
            }
        };

        fetchFavorites();
    }, [userId, supabase]);

    // Fetch pets
    const fetchPets = useCallback(async () => {
        setLoading(true);
        let query = supabase
            .from("pets")
            .select("*")
            .eq("status", "available")
            .order("created_at", { ascending: false });

        if (filters.species) {
            query = query.eq("species", filters.species);
        }
        if (filters.gender) {
            query = query.eq("gender", filters.gender);
        }
        if (filters.size) {
            query = query.eq("size", filters.size);
        }
        if (filters.location) {
            query = query.ilike("location", `%${filters.location}%`);
        }
        if (filters.search) {
            query = query.or(`name.ilike.%${filters.search}%,breed.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }
        if (filters.minAge) {
            query = query.gte("age_years", parseInt(filters.minAge));
        }
        if (filters.maxAge) {
            query = query.lte("age_years", parseInt(filters.maxAge));
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching pets:", error);
        } else {
            setPets(data || []);
        }
        setLoading(false);
    }, [filters, supabase]);

    useEffect(() => {
        fetchPets();
    }, [fetchPets]);

    // Update URL with filters
    useEffect(() => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });
        const queryString = params.toString();
        router.push(`/pets${queryString ? `?${queryString}` : ""}`, { scroll: false });
    }, [filters, router]);

    // Toggle favorite
    const toggleFavorite = async (petId: string) => {
        if (!userId) {
            router.push("/auth/login");
            return;
        }

        const isFavorited = favorites.has(petId);

        if (isFavorited) {
            await supabase
                .from("favorites")
                .delete()
                .eq("user_id", userId)
                .eq("pet_id", petId);

            setFavorites(prev => {
                const next = new Set(prev);
                next.delete(petId);
                return next;
            });
        } else {
            await supabase
                .from("favorites")
                .insert({ user_id: userId, pet_id: petId });

            setFavorites(prev => new Set([...prev, petId]));
        }
    };

    const handleFilterChange = (newFilters: FilterState) => {
        setFilters(newFilters);
    };

    const handleReset = () => {
        setFilters(initialFilters);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">浏览宠物</h1>
                <p className="text-[var(--muted)]">
                    找到你的完美伙伴，开始一段温暖的旅程
                </p>
            </div>

            {/* Filters */}
            <div className="mb-8">
                <PetFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onReset={handleReset}
                />
            </div>

            {/* Results */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="spinner"></div>
                </div>
            ) : pets.length > 0 ? (
                <>
                    <p className="text-[var(--muted)] mb-6">
                        找到 {pets.length} 只可爱的宠物
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {pets.map((pet) => (
                            <PetCard
                                key={pet.id}
                                pet={pet}
                                isFavorited={favorites.has(pet.id)}
                                onToggleFavorite={() => toggleFavorite(pet.id)}
                            />
                        ))}
                    </div>
                </>
            ) : (
                <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                        <PawPrint className="w-8 h-8 text-[var(--muted)]" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">暂无符合条件的宠物</h3>
                    <p className="text-[var(--muted)] mb-4">
                        试试调整筛选条件，或者稍后再来看看
                    </p>
                    <button onClick={handleReset} className="btn-primary">
                        清除筛选
                    </button>
                </div>
            )}
        </div>
    );
}

export default function PetsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="spinner"></div>
            </div>
        }>
            <PetsContent />
        </Suspense>
    );
}
