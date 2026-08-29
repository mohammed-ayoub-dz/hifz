"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Hero() {
  const curtainRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!curtainRef.current || !wordsRef.current) return;

    const words = Array.from(wordsRef.current.children);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      words.forEach((word) => {
        tl.fromTo(
          word,
          {
            y: 50,
            opacity: 0,
            filter: "blur(12px)",
          },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.9,
            ease: "power3.out",
          }
        )
        .to({}, { duration: 0.6 })
        .to(word, {
          y: -50,
          opacity: 0,
          filter: "blur(12px)",
          duration: 0.7,
          ease: "power3.in",
        });
      });

      tl.to(curtainRef.current, {
        yPercent: -100,
        duration: 1.4,
        ease: "power4.inOut",
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <section className="relative z-0 min-h-screen">
        <div className="flex min-h-screen items-center justify-center">
          <h1 className="text-7xl font-bold">Landing Page</h1>
        </div>
      </section>

      <div
        ref={curtainRef}
        className="
          fixed
          inset-0
          z-50
          flex
          items-center
          justify-center
          pointer-events-none
          bg-black
          dark:bg-white
        "
      >
        <div
          ref={wordsRef}
          className="
            relative
            flex
            h-32
            w-full
            items-center
            justify-center
            text-center
            text-white
            dark:text-black
          "
        >
          <span className="absolute text-6xl font-extrabold tracking-tight opacity-0 md:text-8xl">
            حفظ
          </span>
          <span className="absolute text-6xl font-extrabold tracking-tight opacity-0 md:text-8xl">
            تثبيت
          </span>
          <span className="absolute text-6xl font-extrabold tracking-tight opacity-0 md:text-8xl">
            إتقان
          </span>
        </div>
      </div>
    </main>
  );
}