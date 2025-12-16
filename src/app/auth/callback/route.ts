import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Check if user profile exists, if not create one
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: existingProfile } = await supabase
                    .from("users")
                    .select("id")
                    .eq("id", user.id)
                    .single();

                if (!existingProfile) {
                    // Create new user profile
                    await supabase.from("users").insert({
                        id: user.id,
                        display_name: user.user_metadata.full_name || user.user_metadata.name || user.email?.split("@")[0],
                        avatar_url: user.user_metadata.avatar_url || user.user_metadata.picture,
                        role: "user",
                    });
                }
            }

            const forwardedHost = request.headers.get("x-forwarded-host");
            const isLocalEnv = process.env.NODE_ENV === "development";

            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${next}`);
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`);
            } else {
                return NextResponse.redirect(`${origin}${next}`);
            }
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/error`);
}
