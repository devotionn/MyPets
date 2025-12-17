import { createClient } from "@/lib/supabase/server";

export default async function DebugPage() {
    const supabase = await createClient();

    // 1. Get Project URL (Masked)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT SET";
    const maskedUrl = url.replace(/https:\/\/([^.]+)\..*/, "https://$1...");

    // 2. Try to fetch user count from public.users (using anon key)
    const { count: publicCount, error: publicError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

    // 3. Try to fetch auth session
    const { data: { session } } = await supabase.auth.getSession();

    return (
        <div className="p-8 font-mono space-y-6 max-w-2xl mx-auto mt-10 border rounded-lg shadow">
            <h1 className="text-2xl font-bold border-b pb-2">Environment Debugger</h1>

            <div className="space-y-2">
                <h2 className="font-bold text-lg">1. Connection Info</h2>
                <div className="bg-gray-100 p-3 rounded">
                    <p><strong>SUPABASE_URL:</strong> {maskedUrl}</p>
                    <p className="text-xs text-gray-500">(Please check if this matches your Supabase Dashboard URL)</p>
                </div>
            </div>

            <div className="space-y-2">
                <h2 className="font-bold text-lg">2. Database Check (public.users)</h2>
                <div className="bg-gray-100 p-3 rounded">
                    {publicError ? (
                        <p className="text-red-500">Error: {publicError.message}</p>
                    ) : (
                        <p className="text-green-600">Row Count: <strong>{publicCount}</strong></p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <h2 className="font-bold text-lg">3. Auth Session</h2>
                <div className="bg-gray-100 p-3 rounded">
                    {session ? (
                        <div>
                            <p className="text-green-600">Logged In as:</p>
                            <p>Email: {session.user.email}</p>
                            <p>ID: {session.user.id}</p>
                        </div>
                    ) : (
                        <p className="text-yellow-600">Not Logged In</p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <h2 className="font-bold text-lg">4. Diagnosis</h2>
                <ul className="list-disc pl-5 text-sm">
                    <li>If URL does <strong>not</strong> match your dashboard: You are connecting to the wrong project. Check <code>.env.local</code>.</li>
                    <li>If URL matches but Row Count is 0: The database is truly empty. RLS or Trigger failed.</li>
                    <li>If Row Count &gt; 0 here but 0 in Dashboard: You are looking at the wrong project in Dashboard (or vice versa).</li>
                </ul>
            </div>
        </div>
    );
}
