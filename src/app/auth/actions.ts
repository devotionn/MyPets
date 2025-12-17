"use server";

import { createClient } from "@/lib/supabase/server";

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
        const { data: userProfile } = await supabase
            .from('users')
            .select('email')
            .eq('username', identifier)
            .single();

        let targetEmail;

        if (userProfile?.email) {
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

    // Check username uniqueness
    const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("username", username)
        .single();

    if (existingUser) {
        return { error: "该用户名已被使用" };
    }

    const isPhone = isValidPhone(contact);
    const isEmail = isValidEmail(contact);

    if (!isPhone && !isEmail) {
        return { error: "请输入有效的手机号或邮箱" };
    }

    // Perform auth signup
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

    if (result.error) {
        return { error: result.error.message };
    }

    // ★ CRITICAL: Manually insert user profile into public.users ★
    // Don't rely on database trigger - do it directly here
    if (result.data.user) {
        const userId = result.data.user.id;
        const userEmail = isEmail ? contact : null;

        const { error: insertError } = await supabase
            .from('users')
            .upsert({
                id: userId,
                username: username,
                email: userEmail,
                display_name: username,
                role: 'user',
            }, { onConflict: 'id' });

        if (insertError) {
            // Return the actual error to user for debugging
            return {
                error: `注册成功但保存用户资料失败: ${insertError.message}`,
                debug: { code: insertError.code, details: insertError.details }
            };
        }
    } else {
        return { error: "注册失败：未获取到用户ID" };
    }

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

    // Construct fake email for username-only registration
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

    // ★ CRITICAL: Manually insert user profile into public.users ★
    if (data.user) {
        const userId = data.user.id;

        const { error: insertError } = await supabase
            .from('users')
            .upsert({
                id: userId,
                username: username,
                email: email,
                display_name: username,
                role: 'user',
            }, { onConflict: 'id' });

        if (insertError) {
            return {
                error: `注册成功但保存用户资料失败: ${insertError.message}`,
                debug: { code: insertError.code, details: insertError.details }
            };
        }
    } else {
        return { error: "注册失败：未获取到用户ID" };
    }

    return { success: true, redirectUrl: redirectTo };
}
