"use client";

import { useEffect, useState } from "react";
import { api, handleApiError } from "@/lib/api";
import Heart from "@/components/ui/heart";
import Fire from "@/components/ui/fire";

interface User {
  id: number;
  email: string;
  name: string;
  avatar: string;
  hearts: number;
  streak: number;
  daily_goal: number;
  onboarded: boolean;
  created_at: string;
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/app/me");
        setUser(response.data.user);
      } catch (error) {
        console.error("Failed to fetch user:", handleApiError(error));
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <header className="flex w-full items-center justify-between px-6 py-4">
        <div className="h-10 w-32 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-10 w-40 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
      </header>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <header className="flex w-full items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name || "User avatar"}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 font-semibold dark:bg-neutral-800">
            {user.name?.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="hidden sm:block">
          <p className="text-sm font-semibold">{user.name}</p>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <Heart size={25} />
          <span className="text-sm font-semibold">{user.hearts}</span>
        </div>

        <div className="flex items-center gap-2">
          <Fire size={25} />
          <span className="text-sm font-semibold">{user.streak}</span>
        </div>
      </div>
    </header>
  );
}
