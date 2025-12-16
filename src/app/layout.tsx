import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({
    subsets: ["latin"],
    display: 'swap',
    variable: '--font-inter',
});

export const metadata: Metadata = {
    title: "MyPets - 宠物领养平台",
    description: "连接待领养宠物与爱心领养者，让每一个毛孩子都能找到温暖的家",
    keywords: ["宠物领养", "领养宠物", "猫咪领养", "狗狗领养", "宠物救助"],
    authors: [{ name: "MyPets Team" }],
    openGraph: {
        title: "MyPets - 宠物领养平台",
        description: "连接待领养宠物与爱心领养者，让每一个毛孩子都能找到温暖的家",
        type: "website",
        locale: "zh_CN",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="zh-CN" suppressHydrationWarning>
            <body className={`${inter.variable} font-sans antialiased`}>
                <ThemeProvider>
                    <div className="flex min-h-screen flex-col">
                        <Navbar />
                        <main className="flex-1">
                            {children}
                        </main>
                        <Footer />
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
