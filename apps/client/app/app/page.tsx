"use client";

import { useEffect, useState } from "react";
import { api, API_BASE_URL, handleApiError } from "@/lib/api";

interface User {
  id: number;
  email: string;
  name: string;
  avatar: string;
  hearts: number;
  streak: number;
}

export default function Application() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/app/me`, {
          withCredentials: true,
        });

        setUser(response.data.user);
      } catch (error) {
        const message = handleApiError(error);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">
          {error || "You are not authenticated."}
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-neutral-200 p-6 shadow-sm dark:border-neutral-800">
          <div className="flex items-center gap-4">
            {user.avatar && (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-16 w-16 rounded-full"
              />
            )}

            <div>
              <h1 className="text-2xl font-semibold">
                {user.name}
              </h1>

              <p className="text-neutral-500">
                {user.email}
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-neutral-100 p-4 dark:bg-neutral-900">
              <p className="text-sm text-neutral-500">
                Hearts
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {user.hearts}
              </p>
            </div>

            <div className="rounded-xl bg-neutral-100 p-4 dark:bg-neutral-900">
              <p className="text-sm text-neutral-500">
                Streak
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {user.streak}
              </p>
            </div>
          </div>

          <div className="mt-6 text-sm text-neutral-500">
            User ID: {user.id}
          </div>
        </div>
      </div>
    </main>
  );
}
