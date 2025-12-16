import { notFound } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Heart,
    Share2,
    MapPin,
    Calendar,
    User,
    MessageCircle,
    Shield,
    Syringe,
    Info
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import PhotoCarousel from "@/components/pets/PhotoCarousel";
import { formatAge, speciesLabels, genderLabels, sizeLabels, formatDate } from "@/lib/utils";

interface PetDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function PetDetailPage({ params }: PetDetailPageProps) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch pet with publisher info
    const { data: pet, error } = await supabase
        .from("pets")
        .select(`
      *,
      publisher:users!pets_publisher_id_fkey (
        id,
        display_name,
        avatar_url,
        location
      )
    `)
        .eq("id", id)
        .single();

    if (error || !pet) {
        notFound();
    }

    // Check if current user has favorited this pet
    const { data: { user } } = await supabase.auth.getUser();
    let isFavorited = false;
    let hasApplied = false;

    if (user) {
        const { data: favorite } = await supabase
            .from("favorites")
            .select("id")
            .eq("user_id", user.id)
            .eq("pet_id", id)
            .single();

        isFavorited = !!favorite;

        const { data: application } = await supabase
            .from("adoption_applications")
            .select("id, status")
            .eq("applicant_id", user.id)
            .eq("pet_id", id)
            .single();

        hasApplied = !!application;
    }

    type PublisherInfo = { id: string; display_name: string | null; avatar_url: string | null; location: string | null };
    const publisherData = pet.publisher;
    const publisher: PublisherInfo | null = Array.isArray(publisherData) ? publisherData[0] : publisherData;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Back Button */}
            <Link
                href="/pets"
                className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] mb-6 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                <span>返回列表</span>
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Photo Section */}
                <div>
                    <PhotoCarousel photos={pet.photos || []} petName={pet.name} />
                </div>

                {/* Info Section */}
                <div>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold">{pet.name}</h1>
                                <span className={`badge ${pet.status === "available"
                                    ? "badge-success"
                                    : pet.status === "pending"
                                        ? "badge-warning"
                                        : "bg-gray-100 text-gray-600"
                                    }`}>
                                    {pet.status === "available" ? "待领养" : pet.status === "pending" ? "申请中" : "已领养"}
                                </span>
                            </div>
                            <p className="text-lg text-[var(--muted)]">
                                {speciesLabels[pet.species]} · {pet.breed || "混种"}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <button className="p-3 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-primary-500 transition-colors">
                                <Heart className={`w-5 h-5 ${isFavorited ? "fill-primary-500 text-primary-500" : ""}`} />
                            </button>
                            <button className="p-3 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-primary-500 transition-colors">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Quick Info */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 text-center">
                            <Calendar className="w-5 h-5 mx-auto mb-2 text-primary-500" />
                            <p className="text-sm text-[var(--muted)]">年龄</p>
                            <p className="font-semibold">{formatAge(pet.age_years, pet.age_months)}</p>
                        </div>
                        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 text-center">
                            <User className="w-5 h-5 mx-auto mb-2 text-primary-500" />
                            <p className="text-sm text-[var(--muted)]">性别</p>
                            <p className="font-semibold">{genderLabels[pet.gender]}</p>
                        </div>
                        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 text-center">
                            <Info className="w-5 h-5 mx-auto mb-2 text-primary-500" />
                            <p className="text-sm text-[var(--muted)]">体型</p>
                            <p className="font-semibold">{sizeLabels[pet.size]}</p>
                        </div>
                        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 text-center">
                            <MapPin className="w-5 h-5 mx-auto mb-2 text-primary-500" />
                            <p className="text-sm text-[var(--muted)]">地区</p>
                            <p className="font-semibold truncate">{pet.location}</p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold mb-3">关于 {pet.name}</h2>
                        <p className="text-[var(--muted)] leading-relaxed whitespace-pre-line">
                            {pet.description}
                        </p>
                    </div>

                    {/* Health & Vaccination */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        {pet.health_status && (
                            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield className="w-5 h-5 text-teal-500" />
                                    <h3 className="font-medium">健康状况</h3>
                                </div>
                                <p className="text-sm text-[var(--muted)]">{pet.health_status}</p>
                            </div>
                        )}
                        {pet.vaccination_status && (
                            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Syringe className="w-5 h-5 text-blue-500" />
                                    <h3 className="font-medium">疫苗接种</h3>
                                </div>
                                <p className="text-sm text-[var(--muted)]">{pet.vaccination_status}</p>
                            </div>
                        )}
                    </div>

                    {/* Adoption Requirements */}
                    {pet.adoption_requirements && (
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold mb-3">领养须知</h2>
                            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                                <p className="text-sm text-amber-800 dark:text-amber-200 whitespace-pre-line">
                                    {pet.adoption_requirements}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Publisher Info */}
                    {publisher && (
                        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 mb-8">
                            <h3 className="font-medium mb-3">发布者</h3>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{publisher.display_name || "匿名用户"}</p>
                                        {publisher.location && (
                                            <p className="text-sm text-[var(--muted)]">{publisher.location}</p>
                                        )}
                                    </div>
                                </div>
                                <button className="btn-secondary text-sm flex items-center gap-2">
                                    <MessageCircle className="w-4 h-4" />
                                    联系
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        {pet.status === "available" && (
                            hasApplied ? (
                                <Link href="/dashboard/applications" className="btn-secondary flex-1 text-center">
                                    查看我的申请
                                </Link>
                            ) : (
                                <Link
                                    href={user ? `/pets/${pet.id}/apply` : "/auth/login"}
                                    className="btn-primary flex-1 text-center"
                                >
                                    申请领养
                                </Link>
                            )
                        )}
                        <button className="btn-secondary flex-1 flex items-center justify-center gap-2">
                            <MessageCircle className="w-5 h-5" />
                            发送消息
                        </button>
                    </div>

                    {/* Posted Date */}
                    <p className="text-sm text-[var(--muted)] mt-6 text-center">
                        发布于 {formatDate(pet.created_at)}
                    </p>
                </div>
            </div>
        </div>
    );
}
