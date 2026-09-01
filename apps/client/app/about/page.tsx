"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  BookOpen,
  Brain,
  Check,
  Heart,
  Infinity,
  Lock,
  Sparkles,
  Target,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const principles = [
  {
    number: "01",
    icon: Brain,
    title: "الحفظ ليس سباقًا",
    description:
      "حفظ القرآن يحتاج إلى الاستمرار أكثر من السرعة. صُمم حفظ ليجعل المراجعة جزءًا أساسيًا من رحلة الحفظ.",
  },
  {
    number: "02",
    icon: Target,
    title: "تقدم واضح",
    description:
      "تعرف دائمًا أين وصلت، ماذا حفظت، وما الذي يحتاج إلى مراجعة دون تعقيد أو جداول مشتتة.",
  },
  {
    number: "03",
    icon: Heart,
    title: "الثبات قبل الكثرة",
    description:
      "الهدف ليس أن تحفظ أكبر عدد ممكن من الآيات في يوم واحد، بل أن تبني حفظًا ثابتًا تستطيع المحافظة عليه.",
  },
];

const features = [
  "متابعة الحفظ والمراجعة",
  "جلسات حفظ منظمة",
  "أهداف يومية",
  "تتبع الاستمرارية",
  "إحصائيات واضحة",
  "واجهة بسيطة بدون تشتيت",
];

export default function About() {
  const rootRef = useRef<HTMLDivElement>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null);

  const cinematicRef = useRef<HTMLDivElement>(null);
  const scenesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current || !cinematicRef.current || !scenesRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      /*
       * =========================================================
       * HERO
       * =========================================================
       */

      const heroTl = gsap.timeline({
        defaults: {
          ease: "power4.out",
        },
      });

      heroTl
        .fromTo(
          heroTitleRef.current,
          {
            y: 100,
            opacity: 0,
            scale: 0.95,
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1.4,
          },
        )
        .fromTo(
          heroSubtitleRef.current,
          {
            y: 40,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 1,
          },
          "-=0.7",
        );

      gsap.to(heroRef.current, {
        yPercent: -20,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      /*
       * =========================================================
       * CINEMATIC SCROLL
       * =========================================================
       */

      const scenes = gsap.utils.toArray<HTMLElement>(".cinematic-scene");

      /*
       * كل المشاهد تبدأ مخفية،
       * باستثناء المشهد الأول.
       */

      gsap.set(scenes, {
        opacity: 0,
        scale: 0.96,
        y: 40,
        pointerEvents: "none",
      });

      gsap.set(scenes[0], {
        opacity: 1,
        scale: 1,
        y: 0,
        pointerEvents: "auto",
      });

      /*
       * Timeline واحد مربوط بالـ Scroll.
       *
       * كلما تحرك المستخدم:
       *
       * Scene 1
       *   ↓
       * Scene 2
       *   ↓
       * Scene 3
       *   ↓
       * ...
       */

      const cinematicTl = gsap.timeline({
        scrollTrigger: {
          trigger: cinematicRef.current,
          start: "top top",
          end: `+=${scenes.length * 100}%`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      scenes.forEach((scene, index) => {
        if (index === 0) {
          /*
           * المشهد الأول يبقى ظاهرًا قليلًا
           * قبل الانتقال.
           */
          cinematicTl.to({}, { duration: 0.8 });

          cinematicTl.to(scene, {
            opacity: 0,
            scale: 0.94,
            y: -40,
            duration: 0.8,
            ease: "power2.inOut",
          });

          return;
        }

        /*
         * دخول المشهد الجديد
         */

        cinematicTl.fromTo(
          scene,
          {
            opacity: 0,
            scale: 1.06,
            y: 60,
          },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            onStart: () => {
              scene.style.pointerEvents = "auto";
            },
          },
        );

        /*
         * المشهد الأخير لا نخرجه.
         */

        if (index !== scenes.length - 1) {
          cinematicTl.to({}, { duration: 0.7 });

          cinematicTl.to(scene, {
            opacity: 0,
            scale: 0.94,
            y: -50,
            duration: 0.8,
            ease: "power2.inOut",
            onComplete: () => {
              scene.style.pointerEvents = "none";
            },
          });
        }
      });

      /*
       * =========================================================
       * PRINCIPLES CARDS
       * =========================================================
       */

      scenes.forEach((scene) => {
        const cards = scene.querySelectorAll(".principle");
        const features = scene.querySelectorAll(".feature");

        if (cards.length) {
          gsap.fromTo(
            cards,
            {
              opacity: 0,
              y: 50,
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.12,
              ease: "power3.out",
              scrollTrigger: {
                trigger: scene,
                start: "top 70%",
                toggleActions: "play none none reverse",
              },
            },
          );
        }

        if (features.length) {
          gsap.fromTo(
            features,
            {
              opacity: 0,
              x: -30,
            },
            {
              opacity: 1,
              x: 0,
              duration: 0.5,
              stagger: 0.08,
              ease: "power2.out",
              scrollTrigger: {
                trigger: scene,
                start: "top 70%",
                toggleActions: "play none none reverse",
              },
            },
          );
        }
      });

      /*
       * =========================================================
       * BACKGROUND WORDS
       * =========================================================
       */

      gsap.utils
        .toArray<HTMLElement>(".background-word")
        .forEach((word) => {
          gsap.to(word, {
            xPercent:
              word.dataset.direction === "left" ? -15 : 15,
            ease: "none",
            scrollTrigger: {
              trigger: word,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
        });

      /*
       * =========================================================
       * FINAL TEXT
       * =========================================================
       */

      const finalTitle = cinematicRef.current.querySelector(
        ".final-title",
      );

      if (finalTitle) {
        gsap.fromTo(
          finalTitle,
          {
            scale: 0.8,
            opacity: 0,
          },
          {
            scale: 1,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: finalTitle,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }

      /*
       * =========================================================
       * REFRESH
       * =========================================================
       */

      ScrollTrigger.refresh();
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <main
      ref={rootRef}
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-background text-foreground"
    >
      {/* ========================================================= */}
      {/* HERO */}
      {/* ========================================================= */}

      <section
        ref={heroRef}
        className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-6"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]" />

          <div
            data-direction="left"
            className="background-word absolute -left-[15%] top-[20%] whitespace-nowrap text-[18vw] font-black leading-none text-foreground/[0.025]"
          >
            حفظ
          </div>

          <div
            data-direction="right"
            className="background-word absolute -right-[20%] bottom-[10%] whitespace-nowrap text-[18vw] font-black leading-none text-foreground/[0.025]"
          >
            قرآن
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="mb-8 flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <span className="h-px w-12 bg-border" />
            <span>عن حفظ</span>
            <span className="h-px w-12 bg-border" />
          </div>

          <h1
            ref={heroTitleRef}
            className="text-7xl font-black tracking-[-0.06em] sm:text-8xl md:text-[10rem]"
          >
            احفظ.
          </h1>

          <p
            ref={heroSubtitleRef}
            className="mx-auto mt-8 max-w-2xl text-lg leading-9 text-muted-foreground sm:text-xl"
          >
            منصة صُممت لتساعدك على حفظ القرآن الكريم،
            <br className="hidden sm:block" />
            ومراجعته، والاستمرار فيه يومًا بعد يوم.
          </p>

          <div className="mt-16 flex justify-center">
            <div className="flex h-14 w-14 animate-bounce items-center justify-center rounded-full border border-border">
              <span className="text-xs">↓</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* CINEMATIC SECTION */}
      {/* ========================================================= */}

      <section
        ref={cinematicRef}
        className="relative h-screen overflow-hidden"
      >
        <div
          ref={scenesRef}
          className="relative h-full w-full"
        >
          {/* ===================================================== */}
          {/* SCENE 01 — INTRO */}
          {/* ===================================================== */}

          <div className="cinematic-scene absolute inset-0 flex h-full w-full items-center px-6">
            <div className="mx-auto w-full max-w-6xl">
              <div className="grid gap-16 md:grid-cols-[0.35fr_1fr] md:gap-24">
                <div className="text-sm text-muted-foreground">
                  <span className="font-mono">01</span>

                  <p className="mt-3">
                    لماذا حفظ؟
                  </p>
                </div>

                <div>
                  <h2 className="text-4xl font-bold leading-[1.35] tracking-tight sm:text-5xl md:text-6xl">
                    لأن حفظ القرآن
                    <br />

                    <span className="text-muted-foreground">
                      رحلة تحتاج إلى نظام.
                    </span>
                  </h2>

                  <p className="mt-10 max-w-3xl text-lg leading-9 text-muted-foreground">
                    كثير من الناس يبدأون الحفظ بحماس، ثم تتراكم الأجزاء التي
                    تحتاج إلى مراجعة، ويصبح من الصعب معرفة ما يجب فعله بعد ذلك.
                  </p>

                  <p className="mt-6 max-w-3xl text-lg leading-9 text-muted-foreground">
                    حفظ يحاول حل هذه المشكلة ببساطة: مكان واحد تتابع فيه حفظك،
                    مراجعتك، أهدافك، واستمراريتك.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================== */}
          {/* SCENE 02 — PRINCIPLES */}
          {/* ===================================================== */}

          <div className="cinematic-scene absolute inset-0 flex h-full w-full items-center border-y border-border/60 px-6">
            <div className="mx-auto w-full max-w-6xl">
              <div className="mb-12">
                <p className="mb-4 text-sm text-muted-foreground">
                  فلسفة حفظ
                </p>

                <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  ثلاث أفكار
                  <br />

                  <span className="text-muted-foreground">
                    نبني عليها كل شيء.
                  </span>
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {principles.map((item) => {
                  const Icon = item.icon;

                  return (
                    <article
                      key={item.number}
                      className="principle group relative overflow-hidden rounded-3xl border border-border bg-card p-6 transition-colors duration-500 hover:bg-accent sm:p-8"
                    >
                      <div className="mb-10 flex items-start justify-between">
                        <span className="font-mono text-sm text-muted-foreground">
                          {item.number}
                        </span>

                        <Icon
                          size={24}
                          strokeWidth={1.5}
                          className="text-muted-foreground transition-transform duration-500 group-hover:scale-110 group-hover:text-foreground"
                        />
                      </div>

                      <h3 className="text-xl font-bold sm:text-2xl">
                        {item.title}
                      </h3>

                      <p className="mt-4 leading-7 text-muted-foreground">
                        {item.description}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ===================================================== */}
          {/* SCENE 03 — FEATURES */}
          {/* ===================================================== */}

          <div className="cinematic-scene absolute inset-0 flex h-full w-full items-center px-6">
            <div className="mx-auto w-full max-w-6xl">
              <div className="grid gap-12 md:grid-cols-2 md:items-center">
                <div>
                  <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl border border-border">
                    <BookOpen
                      size={24}
                      strokeWidth={1.5}
                    />
                  </div>

                  <h2 className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
                    كل ما تحتاجه.
                    <br />

                    <span className="text-muted-foreground">
                      ولا شيء يشتتك.
                    </span>
                  </h2>

                  <p className="mt-7 max-w-lg text-lg leading-9 text-muted-foreground">
                    حفظ ليس محاولة لبناء شبكة اجتماعية جديدة أو إضافة عشرات
                    الميزات التي لا تحتاجها. التركيز على الحفظ والمراجعة هو
                    الأساس.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {features.map((feature) => (
                    <div
                      key={feature}
                      className="feature flex items-center gap-4 rounded-2xl border border-border p-5"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                        <Check
                          size={15}
                          strokeWidth={2.5}
                        />
                      </div>

                      <span className="font-medium">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================== */}
          {/* SCENE 04 — FREE */}
          {/* ===================================================== */}

          <div className="cinematic-scene absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden border-y border-border/60 px-6">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="whitespace-nowrap text-[25vw] font-black leading-none text-foreground/[0.025]">
                مجاني
              </div>
            </div>

            <div className="relative mx-auto max-w-4xl text-center">
              <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-full border border-border">
                <Infinity
                  size={28}
                  strokeWidth={1.5}
                />
              </div>

              <h2 className="text-5xl font-black tracking-tight sm:text-7xl">
                سيبقى مجانيًا.
              </h2>

              <p className="mx-auto mt-8 max-w-2xl text-lg leading-9 text-muted-foreground">
                حفظ مشروع هدفه تسهيل حفظ القرآن، وليس وضع حاجز مالي أمام من
                يريد استخدامه. الميزات الأساسية للحفظ والمراجعة متاحة مجانًا.
              </p>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
                <span className="rounded-full border border-border px-5 py-2.5">
                  بدون اشتراك
                </span>

                <span className="rounded-full border border-border px-5 py-2.5">
                  بدون إعلانات مزعجة
                </span>

                <span className="rounded-full border border-border px-5 py-2.5">
                  بدون دفع للوصول الأساسي
                </span>
              </div>
            </div>
          </div>

          {/* ===================================================== */}
          {/* SCENE 05 — PRIVACY */}
          {/* ===================================================== */}

          <div className="cinematic-scene absolute inset-0 flex h-full w-full items-center px-6">
            <div className="mx-auto w-full max-w-6xl">
              <div className="mb-14">
                <p className="mb-4 text-sm text-muted-foreground">
                  ما يهمنا
                </p>

                <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  تجربة هادئة.
                  <br />

                  <span className="text-muted-foreground">
                    بلا تعقيد.
                  </span>
                </h2>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-3xl border border-border bg-card p-8 sm:p-12">
                  <Lock
                    size={26}
                    strokeWidth={1.5}
                    className="mb-14 text-muted-foreground"
                  />

                  <h3 className="text-3xl font-bold">
                    الخصوصية
                  </h3>

                  <p className="mt-5 leading-8 text-muted-foreground">
                    بيانات حفظك تخصك. نسعى إلى بناء تجربة تحفظ بيانات المستخدم
                    وتتعامل معها بأقل قدر ممكن من التعقيد.
                  </p>
                </div>

                <div className="rounded-3xl border border-border bg-card p-8 sm:p-12">
                  <Sparkles
                    size={26}
                    strokeWidth={1.5}
                    className="mb-14 text-muted-foreground"
                  />

                  <h3 className="text-3xl font-bold">
                    الاستمرار
                  </h3>

                  <p className="mt-5 leading-8 text-muted-foreground">
                    النجاح في الحفظ ليس جلسة واحدة مثالية. النجاح هو أن تعود
                    غدًا، وبعد غد، وتستمر.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================== */}
          {/* SCENE 06 — FINAL */}
          {/* ===================================================== */}

          <div className="cinematic-scene absolute inset-0 flex h-full w-full items-center justify-center px-6">
            <div className="relative z-10 text-center">
              <p className="mb-8 text-sm text-muted-foreground">
                الهدف بسيط
              </p>

              <h2 className="final-title text-6xl font-black tracking-[-0.05em] sm:text-8xl md:text-[9rem]">
                احفظ.
              </h2>

              <p className="mx-auto mt-8 max-w-xl text-lg leading-9 text-muted-foreground">
                آية بعد آية.
                <br />
                يومًا بعد يوم.
              </p>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-border" />
          </div>
        </div>
      </section>
    </main>
  );
}
