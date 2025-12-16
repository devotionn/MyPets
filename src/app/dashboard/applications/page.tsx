import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatRelativeTime, applicationStatusLabels, speciesLabels } from "@/lib/utils";

export default async function ApplicationsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect("/auth/login");
    }

    // Fetch applications with pet info
    const { data: applications } = await supabase
        .from("adoption_applications")
        .select(`
      *,
      pet:pets (
        id,
        name,
        species,
        photos
      )
    `)
        .eq("applicant_id", user.id)
        .order("submitted_at", { ascending: false });

    const statusIcons = {
        pending: Clock,
        approved: CheckCircle,
        rejected: XCircle,
        withdrawn: AlertCircle,
    };

    const statusColors = {
        pending: "text-amber-500 bg-amber-100 dark:bg-amber-900/20",
        approved: "text-teal-500 bg-teal-100 dark:bg-teal-900/20",
        rejected: "text-red-500 bg-red-100 dark:bg-red-900/20",
        withdrawn: "text-gray-500 bg-gray-100 dark:bg-gray-800",
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">我的申请</h1>
                <p className="text-[var(--muted)]">
                    查看和管理您的领养申请
                </p>
            </div>

            {applications && applications.length > 0 ? (
                <div className="space-y-4">
                    {applications.map((app) => {
                        type PetInfo = { id: string; name: string; species: string; photos: string[] };
                        const petData = app.pet;
                        const pet: PetInfo | null = Array.isArray(petData) ? petData[0] : petData;
                        const StatusIcon = statusIcons[app.status];

                        return (
                            <div
                                key={app.id}
                                className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Pet Image */}
                                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800">
                                        {pet?.photos && pet.photos.length > 0 ? (
                                            <img
                                                src={pet.photos[0]}
                                                alt={pet.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-2xl">
                                                🐾
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <Link
                                                    href={`/pets/${pet?.id}`}
                                                    className="font-semibold text-lg hover:text-primary-500 transition-colors"
                                                >
                                                    {pet?.name || "未知宠物"}
                                                </Link>
                                                <p className="text-sm text-[var(--muted)]">
                                                    {pet?.species ? speciesLabels[pet.species] : ""}
                                                </p>
                                            </div>

                                            {/* Status Badge */}
                                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusColors[app.status]}`}>
                                                <StatusIcon className="w-4 h-4" />
                                                <span>{applicationStatusLabels[app.status]}</span>
                                            </div>
                                        </div>

                                        <p className="text-sm text-[var(--muted)] mt-2">
                                            提交于 {formatRelativeTime(app.submitted_at)}
                                        </p>

                                        {app.reviewer_notes && (
                                            <div className="mt-3 p-3 bg-[var(--background)] rounded-lg">
                                                <p className="text-sm">
                                                    <span className="font-medium">审核备注：</span>
                                                    {app.reviewer_notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                        <FileText className="w-8 h-8 text-[var(--muted)]" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">暂无申请记录</h3>
                    <p className="text-[var(--muted)] mb-6">
                        浏览我们的宠物，找到您心仪的伙伴吧
                    </p>
                    <Link href="/pets" className="btn-primary">
                        浏览宠物
                    </Link>
                </div>
            )}
        </div>
    );
}
