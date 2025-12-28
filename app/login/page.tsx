"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage("エラー: " + error.message);
      } else {
        setMessage("ログイン成功！");
        // ★ここを変更しました：ダッシュボードへ移動
        router.push("/dashboard");
      }
    } catch (error) {
      setMessage("予期せぬエラーが発生しました。");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">ログイン画面</h1>
      
      <div className="flex flex-col gap-4 w-full max-w-md">
        <input
          className="border p-2 rounded text-black"
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border p-2 rounded text-black"
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          ログインする
        </button>
        
        {message && <p className="mt-4 text-center">{message}</p>}
      </div>
    </div>
  );
}