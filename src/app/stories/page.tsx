import Link from "next/link";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function StoriesPage() {
    const supabase = await createClient();

    const { data: stories } = await supabase
        .from("success_stories")
        .select(`
      *,
      pet:pets (
        name,
        species,
        photos
      ),
      adopter:users!success_stories_adopter_id_fkey (
        display_name,
        avatar_url
      )
    `)
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(20);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/20 mb-4">
                    <Heart className="w-5 h-5 text-primary-500" />
                    <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                        温暖的故事
                    </span>
                </div>
                <h1 className="text-4xl font-bold mb-4">领养成功案例</h1>
                <p className="text-[var(--muted)] max-w-2xl mx-auto">
                    这里记录着每一个温暖的相遇，每一段美好的故事。
                    感谢每一位领养者，给毛孩子们一个温暖的家。
                </p>
            </div>

            {/* Stories Grid */}
            {stories && stories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stories.map((story) => {
                        type PetInfo = { name: string; species: string; photos: string[] };
                        type AdopterInfo = { display_name: string | null; avatar_url: string | null };
                        const petData = story.pet;
                        const adopterData = story.adopter;
                        const pet: PetInfo | null = Array.isArray(petData) ? petData[0] : petData;
                        const adopter: AdopterInfo | null = Array.isArray(adopterData) ? adopterData[0] : adopterData;

                        return (
                            <div
                                key={story.id}
                                className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl overflow-hidden card-hover"
                            >
                                {/* Cover Image */}
                                <div className="aspect-video relative overflow-hidden">
                                    {story.photos && story.photos.length > 0 ? (
                                        <img
                                            src={story.photos[0]}
                                            alt={story.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : pet?.photos && pet.photos.length > 0 ? (
                                        <img
                                            src={pet.photos[0]}
                                            alt={pet.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/20 dark:to-accent-900/20 flex items-center justify-center">
                                            <span className="text-5xl">🐾</span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                                        {story.title}
                                    </h3>
                                    <p className="text-[var(--muted)] text-sm mb-4 line-clamp-3">
                                        {story.story}
                                    </p>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-4 border-t border-[var(--card-border)]">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center">
                                                {adopter?.avatar_url ? (
                                                    <img
                                                        src={adopter.avatar_url}
                                                        alt=""
                                                        className="w-full h-full rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-white text-xs font-medium">
                                                        {(adopter?.display_name || "匿名")[0]}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-sm text-[var(--muted)]">
                                                {adopter?.display_name || "匿名用户"}
                                            </span>
                                        </div>
                                        <span className="text-xs text-[var(--muted)]">
                                            {formatDate(story.created_at)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                        <Heart className="w-10 h-10 text-[var(--muted)]" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">暂无成功案例</h3>
                    <p className="text-[var(--muted)] mb-6">
                        第一个温暖的故事正在等待发生
                    </p>
                    <Link href="/pets" className="btn-primary">
                        浏览待领养宠物
                    </Link>
                </div>
            )}
        </div>
    );
}
