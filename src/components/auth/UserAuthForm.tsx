"use client";

import { useState, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, User, Mail, Lock, Phone } from "lucide-react";
import { login, signup, signupWithUsername } from "@/app/auth/actions";

function SubmitButton({ text, loadingText }: { text: string; loadingText: string }) {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
            {pending ? (
                <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {loadingText}
                </>
            ) : (
                text
            )}
        </button>
    );
}

export default function UserAuthForm() {
    const router = useRouter();
    const [mode, setMode] = useState<"login" | "register">("login");

    const [loginState, loginAction] = useFormState(login, null);
    const [registerState, registerAction] = useFormState(signup, null);
    const [usernameRegState, usernameRegAction] = useFormState(signupWithUsername, null);

    // Handle Login Feedback
    useEffect(() => {
        if (loginState?.success) {
            toast.success("登录成功！欢迎回来");
            if (loginState.redirectUrl) {
                // Slight delay to let toast show
                setTimeout(() => router.push(loginState.redirectUrl!), 500);
            }
        } else if (loginState?.error) {
            toast.error(loginState.error);
        }
    }, [loginState, router]);

    // Handle Register Feedback
    useEffect(() => {
        if (registerState?.success) {
            toast.success("注册成功！即将进入系统");
            if (registerState.redirectUrl) {
                setTimeout(() => router.push(registerState.redirectUrl!), 1000);
            }
        } else if (registerState?.error) {
            toast.error(registerState.error);
        }
    }, [registerState, router]);

    // Handle Username Register Feedback
    useEffect(() => {
        if (usernameRegState?.success) {
            toast.success("注册成功！即将进入系统");
            if (usernameRegState.redirectUrl) {
                setTimeout(() => router.push(usernameRegState.redirectUrl!), 1000);
            }
        } else if (usernameRegState?.error) {
            toast.error(usernameRegState.error);
        }
    }, [usernameRegState, router]);


    return (
        <div className="w-full">
            {/* Tabs */}
            <div className="flex p-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <button
                    onClick={() => setMode("login")}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === "login"
                            ? "bg-white dark:bg-gray-700 text-primary-600 shadow-sm"
                            : "text-[var(--muted)] hover:text-[var(--foreground)]"
                        }`}
                >
                    登录
                </button>
                <button
                    onClick={() => setMode("register")}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === "register"
                            ? "bg-white dark:bg-gray-700 text-primary-600 shadow-sm"
                            : "text-[var(--muted)] hover:text-[var(--foreground)]"
                        }`}
                >
                    注册
                </button>
            </div>

            {mode === "login" ? (
                <form action={loginAction} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">账号</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                name="identifier"
                                type="text"
                                required
                                placeholder="用户名 / 手机号 / 邮箱"
                                className="block w-full pl-10 pr-3 py-2 border border-[var(--input-border)] rounded-xl bg-[var(--input-bg)] focus:ring-primary-500 focus:border-primary-500 transition-colors"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">密码</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                name="password"
                                type="password"
                                required
                                placeholder="请输入密码"
                                className="block w-full pl-10 pr-3 py-2 border border-[var(--input-border)] rounded-xl bg-[var(--input-bg)] focus:ring-primary-500 focus:border-primary-500 transition-colors"
                            />
                        </div>
                    </div>

                    <SubmitButton text="立即登录" loadingText="登录中..." />
                </form>
            ) : (
                <div className="space-y-4">
                    {/* Register Form */}
                    <form action={registerAction} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">用户名</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    name="username"
                                    type="text"
                                    required
                                    placeholder="设置用户名"
                                    className="block w-full pl-10 pr-3 py-2 border border-[var(--input-border)] rounded-xl bg-[var(--input-bg)] focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">手机号或邮箱</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    name="contact"
                                    type="text"
                                    required
                                    placeholder="请输入手机号或邮箱"
                                    className="block w-full pl-10 pr-3 py-2 border border-[var(--input-border)] rounded-xl bg-[var(--input-bg)] focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">密码</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    minLength={6}
                                    placeholder="设置6位以上密码"
                                    className="block w-full pl-10 pr-3 py-2 border border-[var(--input-border)] rounded-xl bg-[var(--input-bg)] focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                />
                            </div>
                        </div>

                        <SubmitButton text="立即注册" loadingText="注册中..." />
                    </form>

                    <div className="relative flex justify-center text-xs">
                        <span className="bg-[var(--card-bg)] px-2 text-[var(--muted)]">或者</span>
                    </div>

                    {/* Quick Register (Username Only) */}
                    <form action={usernameRegAction} className="space-y-4">
                        <div className="text-center">
                            <h3 className="text-sm font-medium text-[var(--muted)] mb-2">不想用手机/邮箱？</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                name="username"
                                type="text"
                                required
                                placeholder="用户名"
                                className="col-span-1 px-3 py-2 border border-[var(--input-border)] rounded-xl bg-[var(--input-bg)] text-sm"
                            />
                            <input
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                placeholder="密码"
                                className="col-span-1 px-3 py-2 border border-[var(--input-border)] rounded-xl bg-[var(--input-bg)] text-sm"
                            />
                        </div>
                        <SubmitButton text="仅用用户名注册" loadingText="注册中..." />
                    </form>
                </div>
            )}
        </div>
    );
}
