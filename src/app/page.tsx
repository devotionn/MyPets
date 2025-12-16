import Link from "next/link";
import {
    PawPrint,
    Heart,
    Search,
    Shield,
    Users,
    ArrowRight,
    Cat,
    Dog,
    Rabbit,
    Bird
} from "lucide-react";

export default function HomePage() {
    const features = [
        {
            icon: Search,
            title: "轻松搜索",
            description: "多维度筛选，快速找到与您匹配的毛孩子",
        },
        {
            icon: Shield,
            title: "安全领养",
            description: "严格审核流程，确保每一次领养都是负责任的",
        },
        {
            icon: Users,
            title: "社区支持",
            description: "加入爱宠社区，分享经验，获取帮助",
        },
        {
            icon: Heart,
            title: "爱心传递",
            description: "用爱改变生命，让每个毛孩子都有温暖的家",
        },
    ];

    const petCategories = [
        { icon: Dog, name: "狗狗", count: 128, color: "from-amber-400 to-orange-500" },
        { icon: Cat, name: "猫咪", count: 96, color: "from-purple-400 to-pink-500" },
        { icon: Rabbit, name: "兔子", count: 24, color: "from-green-400 to-teal-500" },
        { icon: Bird, name: "鸟类", count: 18, color: "from-blue-400 to-cyan-500" },
    ];

    const stats = [
        { value: "500+", label: "待领养宠物" },
        { value: "1200+", label: "成功领养" },
        { value: "3000+", label: "注册用户" },
        { value: "98%", label: "满意度" },
    ];

    return (
        <div className="animate-fade-in">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full blur-3xl opacity-30 dark:opacity-10"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-200 rounded-full blur-3xl opacity-30 dark:opacity-10"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-sm mb-6 animate-bounce-subtle">
                            <PawPrint className="w-5 h-5 text-primary-500" />
                            <span className="text-sm font-medium text-[var(--muted)]">
                                已有 1200+ 毛孩子找到新家
                            </span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                            让每一个
                            <span className="gradient-text"> 毛孩子 </span>
                            <br />
                            都能找到温暖的家
                        </h1>

                        <p className="text-lg sm:text-xl text-[var(--muted)] mb-8 max-w-2xl mx-auto">
                            MyPets 是一个连接待领养宠物与爱心领养者的平台。
                            在这里，您可以找到最适合您的伙伴，开启一段温暖的旅程。
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/pets" className="btn-primary inline-flex items-center justify-center gap-2 text-lg px-8 py-4">
                                开始领养
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link href="/publish" className="btn-secondary inline-flex items-center justify-center gap-2 text-lg px-8 py-4">
                                发布领养信息
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 bg-[var(--card-bg)] border-y border-[var(--card-border)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div
                                key={stat.label}
                                className="text-center animate-fade-in-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-[var(--muted)] text-sm sm:text-base">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pet Categories */}
            <section className="py-16 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            寻找您的新伙伴
                        </h2>
                        <p className="text-[var(--muted)] max-w-2xl mx-auto">
                            我们有各种类型的宠物正在等待一个温暖的家
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                        {petCategories.map((category, index) => (
                            <Link
                                key={category.name}
                                href={`/pets?species=${category.name}`}
                                className="group relative overflow-hidden rounded-2xl p-6 sm:p-8 card-hover animate-fade-in-up bg-[var(--card-bg)] border border-[var(--card-border)]"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                                <div className="relative">
                                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <category.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-semibold mb-1">
                                        {category.name}
                                    </h3>
                                    <p className="text-[var(--muted)] text-sm">
                                        {category.count} 只待领养
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="text-center mt-10">
                        <Link
                            href="/pets"
                            className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-medium transition-colors"
                        >
                            查看全部宠物
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 lg:py-24 bg-[var(--card-bg)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            为什么选择 MyPets
                        </h2>
                        <p className="text-[var(--muted)] max-w-2xl mx-auto">
                            我们致力于为每一只宠物和每一位领养者提供最好的服务
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={feature.title}
                                className="p-6 rounded-2xl bg-[var(--background)] border border-[var(--card-border)] card-hover animate-fade-in-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-400 flex items-center justify-center mb-4">
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                                <p className="text-[var(--muted)] text-sm">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 to-primary-600 p-8 sm:p-12 lg:p-16">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-400/20 rounded-full blur-3xl"></div>

                        <div className="relative text-center text-white max-w-3xl mx-auto">
                            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                                准备好开始了吗？
                            </h2>
                            <p className="text-white/80 mb-8 text-lg">
                                加入我们，成为爱心领养者，给毛孩子一个温暖的家。
                                或者，如果您有需要领养的宠物，也可以在这里发布信息。
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/auth/login" className="inline-flex items-center justify-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold hover:bg-white/90 transition-colors">
                                    立即注册
                                </Link>
                                <Link href="/stories" className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/20">
                                    查看成功案例
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
