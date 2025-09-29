"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Enter email and password.');
      return;
    }
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else router.replace("/dashboard");
    setLoading(false);
  };

  const handleSignUp = async () => {
    if (!email || !password || password.length < 6) {
      setError('Enter email and a password of at least 6 characters.');
      return;
    }
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: email.split("@")[0] } },
    });
    if (error) setError(error.message);
    else setError("Check your email to confirm");
    setLoading(false);
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError('Enter your email.');
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) setError(error.message);
    else setError('Check your email for the sign-in link.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={handleSignIn} className="w-full max-w-sm space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm mb-1">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border rounded px-3 h-11" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm mb-1">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full border rounded px-3 h-11" />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button type="submit" disabled={loading} className="w-full h-11 bg-primary text-primary-foreground rounded">
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <button type="button" onClick={handleSignUp} disabled={loading} className="w-full h-11 border rounded">
          {loading ? "Creating..." : "Create Account"}
        </button>
        <button type="button" onClick={handleMagicLink} disabled={loading} className="w-full h-11 border rounded">
          {loading ? 'Sending...' : 'Send magic link'}
        </button>
      </form>
    </div>
  );
}


