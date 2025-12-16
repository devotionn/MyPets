"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
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

    let email = identifier;

    // 1. 如果是手机号，尝试查找对应的邮箱 (或者直接用手机号登录，如果Supabase支持)
    // Supabase 支持手机号登录，需要 enable Phone Auth across providers. 
    // 但为了简化，我们这里假设用户注册时如果用手机号，我们会生成一个 fake email 或者直接存储 phone。
    // 这里我们先尝试用 email 登录逻辑（如果输入的是 Email）

    if (!isValidEmail(identifier)) {
        // 如果不是邮箱，尝试查找该 username 或 phone 对应的 email
        // 注意：这里需要 service_role 权限或者在 public table 查。
        // 由于我们在 public.users 表里存了 username 和 phone，且 RLS 是 public read，我们可以查。

        let query = supabase.from("users").select("id, email").limit(1);

        // 这里的 email 我们在 users 表里最初没有存（users 表通常是从 auth.users 同步过来的，
        // 但 auth.users 不可直接读）。
        // 这是一个常见问题。通常我们需要在 public.users 里也冗余存一份 email，或者使用 Admin Client。
        // 由于安全原因，Admin Client 不应在客户端使用，但在 Server Action 可以。
        // 但我们没有暴露 Admin Client 的 createClient 方法在当前项目结构中 (通常在 lib/supabase/admin.ts)

        // 策略调整：
        // 1. 尝试直接用 identifier 当作 email 登录 (Fail)
        // 2. 尝试用 identifier 当作 phone 登录 (Supabase signInWithPassword 支持 phone: '...')
        // 3. 如果是 Username，我们需要找到 Email。

        // 由于当前只能操作 public.users，如果我们无法获得 Email，就无法用 signInWithPassword(email)。
        // 除非我们强制要求 Username 注册时生成固定格式邮箱： username@mypets.local

        if (isValidPhone(identifier)) {
            // 尝试手机号登录
            const { error } = await supabase.auth.signInWithPassword({
                phone: identifier,
                password
            });
            if (!error) return redirect(redirectTo);
            // 如果手机号登录失败，可能是没开启手机号登录或者密码错，或者这就是个用户名恰好是数字
        }

        // 尝试构建 username 邮箱
        // 假设我们在注册时使用了 username@mypets.local
        const fakeEmail = `${identifier}@mypets.local`;

        const { error } = await supabase.auth.signInWithPassword({
            email: fakeEmail,
            password
        });

        if (!error) {
            return redirect(redirectTo);
        }

        // 如果 fakeEmail 失败，可能用户是用真实邮箱注册的，只是可以用 username 登录？
        // 这种情况下，必须在 public.users 存储 email 才能查找。
        // 鉴于这是一个新功能，我们可以规定：
        // "使用用户名注册的用户，其实际登录邮箱为 username@mypets.local"
        // "使用邮箱注册的用户，必须用邮箱登录"

        return { error: "登录失败，请检查账号或密码" };
    }

    // Email 登录
    const { error } = await supabase.auth.signInWithPassword({
        email: identifier,
        password,
    });

    if (error) {
        return { error: error.message === "Invalid login credentials" ? "账号或密码错误" : error.message };
    }

    return redirect(redirectTo);
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

    // check username uniquness
    const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("username", username)
        .single();

    if (existingUser) {
        return { error: "该用户名已被使用" };
    }

    let signUpData: any;
    let isPhone = isValidPhone(contact);
    let isEmail = isValidEmail(contact);

    if (!isPhone && !isEmail) {
        return { error: "请输入有效的手机号或邮箱" };
    }

    if (isPhone) {
        // Phone signup
        const { data, error } = await supabase.auth.signUp({
            phone: contact,
            password,
            options: {
                data: {
                    display_name: username,
                    username: username,
                }
            }
        });

        if (error) return { error: error.message };

        // Manually update public.users if trigger fails or we want to ensure username is set
        // (Trigger mostly handles id, created_at, etc. Metadata synchronization depends on implementation)
        // We relies on Trigger to create row, but we might need to update username.
        // Actually, better to use the username as the identifier if provided? No, Supabase uses Email/Phone.

        return redirect(redirectTo);
    } else {
        // Email signup
        // 但是用户想要 "无需邮箱验证"。
        // 如果开启了 Confirm，这里会发邮件。如果关闭了 Confirm，这里直接注册成功。
        // 也就是直接使用 contact 作为 email。

        const { data, error } = await supabase.auth.signUp({
            email: contact,
            password,
            options: {
                data: {
                    display_name: username,
                    username: username,
                }
            }
        });

        if (error) return { error: error.message };

        return redirect(redirectTo);
    }
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

    return redirect(redirectTo);
}
