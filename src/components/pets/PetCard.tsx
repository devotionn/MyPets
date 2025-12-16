"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, Calendar } from "lucide-react";
import { Pet } from "@/types/database";
import { formatAge, speciesLabels, genderLabels } from "@/lib/utils";

interface PetCardProps {
    pet: Pet;
    isFavorited?: boolean;
    onToggleFavorite?: () => void;
}

export default function PetCard({ pet, isFavorited = false, onToggleFavorite }: PetCardProps) {
    const statusColors = {
        available: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
        pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        adopted: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
    };

    const statusLabels = {
        available: "待领养",
        pending: "申请中",
        adopted: "已领养",
    };

    return (
        <div className="group bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl overflow-hidden card-hover">
            {/* Image */}
            <div className="relative aspect-square overflow-hidden">
                {pet.photos && pet.photos.length > 0 ? (
                    <Image
                        src={pet.photos[0]}
                        alt={pet.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/20 dark:to-accent-900/20 flex items-center justify-center">
                        <span className="text-4xl">🐾</span>
                    </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                    <span className={`badge ${statusColors[pet.status]}`}>
                        {statusLabels[pet.status]}
                    </span>
                </div>

                {/* Favorite Button */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onToggleFavorite?.();
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-colors"
                >
                    <Heart
                        className={`w-5 h-5 transition-colors ${isFavorited
                                ? "fill-primary-500 text-primary-500"
                                : "text-gray-400 hover:text-primary-500"
                            }`}
                    />
                </button>
            </div>

            {/* Content */}
            <Link href={`/pets/${pet.id}`} className="block p-4">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold truncate">{pet.name}</h3>
                    <span className="text-sm text-[var(--muted)] shrink-0 ml-2">
                        {speciesLabels[pet.species]}
                    </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-[var(--muted)] mb-3">
                    <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatAge(pet.age_years, pet.age_months)}
                    </span>
                    <span>{genderLabels[pet.gender]}</span>
                </div>

                <div className="flex items-center gap-1 text-sm text-[var(--muted)]">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{pet.location}</span>
                </div>
            </Link>
        </div>
    );
}
