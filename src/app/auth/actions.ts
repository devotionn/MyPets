"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string) {
    return /^1[3-9]\d{9}$/.test(phone);
}

export async function login(prevState: any, formData: FormData) {
    const supabase = await createClient();
    const identifier = formData.get("identifier") as string;
    const password = formData.get("password") as string;
    const redirectTo = formData.get("redirectTo") as string || "/dashboard";

    if (!identifier || !password) {
        return { error: "请输入账号和密码" };
    }

    // 1. Check valid email format
    if (!isValidEmail(identifier)) {
        // Not a standard email format. Could be Phone or Username.

        // A. Try Phone Login first (if it's a valid phone number)
        if (isValidPhone(identifier)) {
            const { error } = await supabase.auth.signInWithPassword({
                phone: identifier,
                password
            });
            if (!error) {
                return { success: true, redirectUrl: redirectTo };
            }
        }

        // B. Try to find the EMAIL associated with this USERNAME from public.users
        // This is crucial for users who registered with "Real Email + Username" but want to login with "Username".
        const { data: userProfile } = await supabase
            .from('users')
            .select('email')
            .eq('username', identifier)
            .single();

        let targetEmail;

        if (userProfile?.email) {
            // Found the real email linked to this username
            targetEmail = userProfile.email;
        } else {
            // Fallback: Assume it's a "Username-Only" user (username@mypets.local)
            targetEmail = `${identifier}@mypets.local`;
        }

        // Attempt login with the resolved email
        const { error } = await supabase.auth.signInWithPassword({
            email: targetEmail,
            password
        });

        if (!error) {
            return { success: true, redirectUrl: redirectTo };
        }

        // If failed, return generic error
        return { error: "登录失败，请检查账号或密码" };
    }

    // Standard Email Login
    const { error } = await supabase.auth.signInWithPassword({
        email: identifier,
        password,
    });

    if (error) {
        return { error: error.message === "Invalid login credentials" ? "账号或密码错误" : error.message };
    }

    return { success: true, redirectUrl: redirectTo };
}

export async function signup(prevState: any, formData: FormData) {
    const supabase = await createClient();
    const username = formData.get("username") as string;
    const contact = formData.get("contact") as string; // Email or Phone
    const password = formData.get("password") as string;
    const redirectTo = formData.get("redirectTo") as string || "/dashboard";

    if (!username || !password || !contact) {
        return { error: "请填写所有必填项" };
    }

    // Check username uniqueness (Public query)
    const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("username", username)
        .single();

    if (existingUser) {
        return { error: "该用户名已被使用" };
    }

    let isPhone = isValidPhone(contact);
    let isEmail = isValidEmail(contact);

    if (!isPhone && !isEmail) {
        return { error: "请输入有效的手机号或邮箱" };
    }

    let result;
    if (isPhone) {
        result = await supabase.auth.signUp({
            phone: contact,
            password,
            options: {
                data: {
                    display_name: username,
                    username: username,
                }
            }
        });
    } else {
        result = await supabase.auth.signUp({
            email: contact,
            password,
            options: {
                data: {
                    display_name: username,
                    username: username,
                }
            }
        });
    }

    if (result.error) return { error: result.error.message };

    return { success: true, redirectUrl: redirectTo };
}

export async function signupWithUsername(prevState: any, formData: FormData) {
    const supabase = await createClient();
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const redirectTo = formData.get("redirectTo") as string || "/dashboard";

    if (!username || !password) {
        return { error: "用户名和密码不能为空" };
    }

    // Check username uniqueness
    const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("username", username)
        .single();

    if (existingUser) {
        return { error: "用户名已存在" };
    }

    // Construct fake email
    const email = `${username}@mypets.local`;

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                display_name: username,
                username: username,
            }
        }
    });

    if (error) {
        return { error: error.message };
    }

    return { success: true, redirectUrl: redirectTo };
}
