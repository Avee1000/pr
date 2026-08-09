import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    return (
      <div>
        <h1>Access Denied</h1>
        <p>Please log in to view this page.</p>
      </div>
    );
  }

  // Server-side fetch from Next.js server to Express backend
  const res = await fetch("http://localhost:5000/api/protected", {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    cache: "no-store",
  });

  const data = await res.json();

  return (
    <div className="block w-full h-screen">
      <h1>Express Data:</h1>
      <p className="wrap-break-word">Bearer {session.access_token}</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      {/* <iframe className="w-full h-full" src="http://localhost:5000/preview-pdf/8a1f6584-6cd7-47f0-9bdc-a2e8e09d6e6d"></iframe> */}
    </div>
  );
}