"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@/contexts/user-context";
import { api, handleApiError } from "@/lib/api";

interface HifzProgress {
  id: number;
  user_id: number;
  surah_number: number;
  start_ayah: number;
  end_ayah: number;
  mastery_level: number;
  repetitions: number;
  last_reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
}

interface DailyProgress {
  id: number;
  user_id: number;
  date: string;
  new_ayahs_count: number;
  reviewed_count: number;
  goal_target: number;
  is_goal_achieved: boolean;
}

interface HifzSession {
  id: number;
  user_id: number;
  session_type: "memorization" | "review";
  duration: number;
  surah_number: number;
  start_ayah: number;
  end_ayah: number;
  score: number;
  mistakes: number;
  hearts_lost: number;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const { user, loading } = useUser();

  const [progress, setProgress] = useState<HifzProgress[]>([]);
  const [dailyProgress, setDailyProgress] =
    useState<DailyProgress | null>(null);
  const [sessions, setSessions] = useState<HifzSession[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        setLoadingDashboard(true);

        const response = await api.get("/app/dashboard");

        const {
          user,
          daily,
          progress,
          sessions,
        } = response.data;

        setProgress(progress ?? []);
        setDailyProgress(
          progress ??
            daily ??
            null,
        );

        setSessions(sessions ?? []);
      } catch (error) {
        console.error(
          "Failed to fetch dashboard data:",
          handleApiError(error),
        );
      } finally {
        setLoadingDashboard(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const todayCompleted = dailyProgress?.new_ayahs_count ?? 0;

  const dailyGoal = user?.daily_goal ?? 0;

  const dailyPercentage =
    dailyGoal > 0
      ? Math.min(Math.round((todayCompleted / dailyGoal) * 100), 100)
      : 0;

  const totalMemorizedAyahs = useMemo(() => {
    return progress.reduce((total, item) => {
      return total + (item.end_ayah - item.start_ayah + 1);
    }, 0);
  }, [progress]);

  const latestProgress = progress[progress.length - 1];

  const currentSurah = latestProgress?.surah_number ?? null;

  const currentStartAyah = latestProgress?.start_ayah ?? null;

  const currentEndAyah = latestProgress?.end_ayah ?? null;

  const hasSessions = sessions.length > 0;

  if (loading || !user || loadingDashboard) {
    return (
      <main className="min-h-screen bg-white px-5 py-8 text-black dark:bg-black dark:text-white">
        <div className="mx-auto max-w-6xl animate-pulse space-y-6">
          <div className="h-8 w-48 rounded-lg bg-neutral-200 dark:bg-neutral-800" />

          <div className="h-72 rounded-3xl bg-neutral-100 dark:bg-neutral-900" />

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-32 rounded-2xl bg-neutral-100 dark:bg-neutral-900"
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="px-5 py-8 sm:px-8 lg:px-10"
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-end justify-between">
          <div>
            <p className="mb-2 text-sm text-neutral-500 dark:text-neutral-400">
              {getGreeting()}
            </p>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {user.name}
            </h1>
          </div>

          <div className="hidden text-left sm:block">
            <p className="text-xs text-neutral-400">
              هدفك اليومي
            </p>

            <p className="mt-1 text-lg font-semibold">
              {user.daily_goal} آية
            </p>
          </div>
        </header>

        <section className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-50 p-7 dark:border-neutral-800 dark:bg-neutral-950 sm:p-10">
          <div className="relative z-10 max-w-2xl">
            <p className="mb-3 text-sm font-medium text-neutral-500 dark:text-neutral-400">
              وِرد الحفظ اليومي
            </p>

            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {todayCompleted >= dailyGoal && dailyGoal > 0
                ? "أتممت وِردك اليوم"
                : "أكمل وِردك اليوم"}
            </h2>

            <p className="mt-3 text-neutral-500 dark:text-neutral-400">
              {currentSurah
                ? `سورة ${currentSurah} — الآيات ${currentStartAyah} إلى ${currentEndAyah}`
                : "لم تبدأ الحفظ بعد."}
            </p>

            <div className="mt-8">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-neutral-500 dark:text-neutral-400">
                  التقدم اليومي
                </span>

                <span className="font-semibold">
                  {todayCompleted} / {dailyGoal}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                <div
                  className="h-full rounded-full bg-black transition-all duration-500 dark:bg-white"
                  style={{
                    width: `${dailyPercentage}%`,
                  }}
                />
              </div>
            </div>

            <button
              type="button"
              className="mt-8 rounded-xl bg-black px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98] dark:bg-white dark:text-black"
            >
              {todayCompleted > 0
                ? "استكمل الحفظ"
                : "بدأ حصة جديدة"}
            </button>
          </div>

          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-neutral-200/50 blur-3xl dark:bg-neutral-800/30" />
        </section>
      </div>

      <div className="mx-auto mt-4 max-w-6xl space-y-6">
        <section className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-50 p-7 dark:border-neutral-800 dark:bg-neutral-950 sm:p-10">
          <div className="relative z-10 max-w-2xl">
            <p className="mb-3 text-sm font-medium text-neutral-500 dark:text-neutral-400">
              الحصص
            </p>

            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              الحصص السابقة
            </h2>

            <p className="mt-3 text-neutral-500 dark:text-neutral-400">
              جميع الحصص التي أنجزتها والحصص السابقة.
            </p>

            <div className="mt-8">
              {!hasSessions ? (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  لا توجد حصص حتى الآن
                </p>
              ) : (
                <div className="space-y-3">
                  {sessions.slice(0, 3).map((session) => (
                    <Session
                      key={session.id}
                      session={session}
                    />
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              className="mt-8 rounded-xl bg-black px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98] dark:bg-white dark:text-black"
            >
              عرض جميع الحصص
            </button>
          </div>

          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-neutral-200/50 blur-3xl dark:bg-neutral-800/30" />
        </section>
      </div>

      <div className="mx-auto mt-4 max-w-6xl">
        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label="السلسلة"
            value={String(user.streak)}
            suffix="يوم"
          />

          <StatCard
            label="القلوب"
            value={String(user.hearts)}
            suffix=""
          />

          <StatCard
            label="المحفوظ"
            value={String(totalMemorizedAyahs)}
            suffix="آية"
          />

          <StatCard
            label="هدف اليوم"
            value={String(user.daily_goal)}
            suffix="آية"
          />
        </section>
      </div>

      <div className="mx-auto mt-4 max-w-6xl">
        <section>
          <div className="mb-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              الوصول السريع
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              استمر في رحلتك
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <QuickAction
              title="المصحف الشريف"
              description="تصفح السور والآيات وابدأ الحفظ."
            />

            <QuickAction
              title="خطة الحفظ"
              description={`هدفك الحالي ${user.daily_goal} آية يوميًا.`}
            />
          </div>
        </section>
      </div>

      <div className="mx-auto mt-4 max-w-6xl">
        <section className="rounded-3xl border border-neutral-200 p-6 dark:border-neutral-800 sm:p-8">
          <div className="mb-6">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              رحلتك في القرآن
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              السور التي بدأت حفظها
            </h2>
          </div>

          <div className="space-y-3">
            {progress.length === 0 ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                لم تبدأ حفظ أي سورة بعد.
              </p>
            ) : (
              progress.map((item) => (
                <Surah
                  key={item.id}
                  number={item.surah_number}
                  name={`السورة رقم ${item.surah_number}`}
                  status="progress"
                  progress={calculateProgress(item)}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        {label}
      </p>

      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-2xl font-semibold">
          {value}
        </span>

        {suffix && (
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function QuickAction({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      className="group rounded-2xl border border-neutral-200 p-6 text-right transition-all hover:border-neutral-400 hover:shadow-sm dark:border-neutral-800 dark:hover:border-neutral-600"
    >
      <h3 className="text-lg font-semibold transition-transform group-hover:-translate-x-1">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
        {description}
      </p>
    </button>
  );
}

function Surah({
  number,
  name,
  status,
  progress,
}: {
  number: number;
  name: string;
  status: "completed" | "progress" | "locked";
  progress?: number;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-neutral-100 p-4 dark:border-neutral-900">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-sm font-semibold dark:bg-neutral-900">
        {number}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-medium">
            {name}
          </h3>

          {status === "completed" && (
            <span className="text-xs font-medium text-neutral-500">
              مكتملة
            </span>
          )}

          {status === "progress" && (
            <span className="text-xs font-medium">
              {progress}%
            </span>
          )}

          {status === "locked" && (
            <span className="text-xs text-neutral-400">
              لم تبدأ
            </span>
          )}
        </div>

        {status === "progress" && (
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
            <div
              className="h-full rounded-full bg-black dark:bg-white"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function Session({
  session,
}: {
  session: HifzSession;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
      <div>
        <p className="font-medium">
          {session.session_type === "memorization"
            ? "جلسة حفظ"
            : "جلسة مراجعة"}
        </p>

        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          سورة {session.surah_number} — الآيات{" "}
          {session.start_ayah} إلى {session.end_ayah}
        </p>
      </div>

      <div className="text-left">
        <p className="text-sm font-semibold">
          {session.score}%
        </p>

        <p className="mt-1 text-xs text-neutral-400">
          {formatDate(session.created_at)}
        </p>
      </div>
    </div>
  );
}

function calculateProgress(
  item: HifzProgress,
): number {
  
  return Math.min(
    Math.max(item.mastery_level * 20, 0),
    100,
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ar-DZ", {
    day: "numeric",
    month: "short",
  }).format(new Date(date));
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "صباح الخير";
  }

  return "مساء الخير";
}