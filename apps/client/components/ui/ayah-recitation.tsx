"use client";

import { useEffect, useRef, useState } from "react";

type Segment = [number, number, number];

type AyahRecitationProps = {
  text: string;
  segments: Segment[];
  audioUrl: string;
  repetitions?: number;
  autoPlay?: boolean;
  onComplete?: () => void;
  className?: string;
};

export default function AyahRecitation({
  text,
  segments,
  audioUrl,
  repetitions = 10,
  autoPlay = true,
  onComplete,
  className = "",
}: AyahRecitationProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const repetitionRef = useRef(0);
  const autoPlayRef = useRef(autoPlay);
  const rafRef = useRef<number | null>(null);

  const [currentWord, setCurrentWord] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [repetition, setRepetition] = useState(0);

  const words = text.trim().split(/\s+/);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    audio.src = audioUrl;
    audio.load();

    repetitionRef.current = 0;
    setRepetition(0);
    setCurrentWord(-1);
    setIsPlaying(false);

    if (!autoPlay) return;

    autoPlayRef.current = true;

    const play = async () => {
      try {
        repetitionRef.current = 1;
        setRepetition(1);
        await audio.play();
      } catch (error) {
        console.error("Failed to autoplay:", error);
        autoPlayRef.current = false;
        setIsPlaying(false);
      }
    };

    if (audio.readyState >= 3) {
      play();
    } else {
      audio.addEventListener("canplay", play, { once: true });
      return () => {
        audio.removeEventListener("canplay", play);
      };
    }
  }, [audioUrl, autoPlay]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateCurrentWord = () => {
      if (!audio || audio.paused) return;

      const currentTimeMs = audio.currentTime * 1000;
      const durationMs = audio.duration * 1000;

      if (!durationMs || Number.isNaN(durationMs)) {
        rafRef.current = requestAnimationFrame(updateCurrentWord);
        return;
      }

      let activeSegmentIndex = -1;
      for (let i = 0; i < segments.length; i++) {
        const [, start] = segments[i];
        if (currentTimeMs >= start) {
          activeSegmentIndex = i;
        } else {
          break; 
        }
      }

      if (activeSegmentIndex === -1) {
        setCurrentWord(-1);
      } else {
        const [wordIndex] = segments[activeSegmentIndex];
        setCurrentWord(wordIndex - 1);
      }

      if (!audio.paused) {
        rafRef.current = requestAnimationFrame(updateCurrentWord);
      }
    };

    const startTracking = () => {
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(updateCurrentWord);
      }
    };

    const stopTracking = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      startTracking();
    };

    const handlePause = () => {
      setIsPlaying(false);
      stopTracking();
    };

    const handleEnded = async () => {
      setCurrentWord(-1);
      stopTracking();

      if (!autoPlayRef.current) {
        setIsPlaying(false);
        return;
      }

      if (repetitionRef.current < repetitions) {
        repetitionRef.current += 1;
        setRepetition(repetitionRef.current);
        audio.currentTime = 0;
        try {
          await audio.play();
        } catch (error) {
          console.error("Failed to replay:", error);
          autoPlayRef.current = false;
          setIsPlaying(false);
        }
        return;
      }

      autoPlayRef.current = false;
      setIsPlaying(false);
      setRepetition(repetitions);
      onComplete?.();
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      stopTracking();
    };
  }, [segments, repetitions, onComplete]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      autoPlayRef.current = true;
      if (repetitionRef.current === 0) {
        repetitionRef.current = 1;
        setRepetition(1);
      }
      try {
        await audio.play();
      } catch (error) {
        console.error("Failed to play:", error);
      }
      return;
    }

    autoPlayRef.current = false;
    audio.pause();
  };

  return (
    <div className={`flex flex-col items-center gap-5 ${className}`}>
      <div className="max-w-5xl text-center">
        <div className="font-[QuranCommon] text-4xl leading-[2.3] sm:text-5xl sm:leading-[2.4] lg:text-6xl">
          {words.map((word, index) => {
            const isActive = currentWord === index;
            return (
              <span
                key={`${index}-${word}`}
                className={[
                  "mx-1 inline-block",
                  "transition-all duration-150",
                  isActive
                    ? [
                        "scale-[1.04]",
                        "text-green-500",
                        "drop-shadow-[0_0_18px_rgba(0,0,0,0.35)]",
                        "dark:text-white",
                        "dark:drop-shadow-[0_0_18px_rgba(255,255,255,0.45)]",
                      ].join(" ")
                    : "text-neutral-800 dark:text-neutral-200",
                ].join(" ")}
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>

      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        ياسر الدوسري
      </p>

      <div className="text-sm text-neutral-500 dark:text-neutral-400">
        التكرار{" "}
        <span className="font-semibold text-neutral-900 dark:text-white">
          {repetition}
        </span>{" "}
        من {repetitions}
      </div>

      <button
        type="button"
        onClick={togglePlay}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-white transition-transform hover:scale-105 active:scale-95 dark:bg-white dark:text-black"
      >
        {isPlaying ? "Ⅱ" : "▶"}
      </button>

      <audio ref={audioRef} />
    </div>
  );
}