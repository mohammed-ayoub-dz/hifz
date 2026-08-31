"use client";

import { Button } from "@/components/ui/button";
import gsap from "gsap";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

type Ayah = {
  id: number;
  surah_number: number;
  ayah_number: number;
  verse_key: string;
  words_count: number;
  text: string;
};

type Block = {
  id: number;
  text: string;
};

type WordBlock = {
  id: number;
  words: string[];
};

type ShuffledWord = {
  id: number;
  word: string;
  wordIndex: number;
};

type Result = "success" | "failed" | null;

const normalizeArabic = (text: string) => {
  return text
    .replace(/[\u064B-\u0652]/g, "") 
    .replace(/[أإآ]/g, "ا") 
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ء/g, ""); 
};

export default function TestStage({
  currentAyah,
  id,
}: {
  currentAyah: Ayah[];
  id: string;
}) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [dividedBlocks, setDividedBlocks] = useState<WordBlock[]>([]);
  const [userInput, setUserInput] = useState<ShuffledWord[]>([]);
  const [result, setResult] = useState<Result>(null);
  const [wordInput, setWordInput] = useState("");
  const router = useRouter();
  const inputRefs = useRef<(HTMLDivElement | null)[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);
  const [heartLosts, setHeartLost] = useState(0);
  const [Mistakes, setMistakes] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    setBlocks(
      currentAyah.map((ayah) => ({
        id: ayah.id,
        text: ayah.text,
      }))
    );

    setUserInput([]);
    setResult(null);
    setWordInput("");
  }, [currentAyah]);

  useEffect(() => {
    setDividedBlocks(
      blocks.map((block) => ({
        id: block.id,
        words: block.text.split(" "),
      }))
    );
  }, [blocks]);

  const shuffledWords = useMemo(() => {
    return dividedBlocks
      .flatMap((block) =>
        block.words.map((word, index) => ({
          id: block.id,
          word,
          wordIndex: index,
        }))
      )
      .sort(() => Math.random() - 0.5);
  }, [dividedBlocks]);

  const addUserInput = (word: ShuffledWord) => {
    if (result) return;
    setUserInput((current) => [...current, word]);
  };

  // const Check = async () => {
  //   const correctOrder = dividedBlocks.flatMap((block) =>
  //     block.words.map((_, index) => ({
  //       id: block.id,
  //       wordIndex: index,
  //     }))
  //   );

  //   const isCorrect =
  //     userInput.length === correctOrder.length &&
  //     userInput.every(
  //       (word, index) =>
  //         word.id === correctOrder[index].id &&
  //         word.wordIndex === correctOrder[index].wordIndex
  //     );

  //   const newResult = isCorrect ? "success" : "failed";
  //   setResult(newResult);

  //   if (!isCorrect) {
  //     setMistakes((m) => m + 1);
  //     setHeartLost((h) => h + 1);

  //     setTimeout(() => {
  //       setUserInput([]);
  //       setResult(null);
  //       setWordInput(""); 
  //     }, 2000);

  //     return;
  //   }

  //   try {
  //     await api.post(`/app/sessions/${id}/complete`, {
  //       mistakes: Mistakes,
  //       hearts_lost: heartLosts,
  //     });

  //     setTimeout(() => {
  //       router.push("/app");
  //     }, 2000);
  //   } catch (error) {
  //     console.error("Failed to complete session:", error);
  //   }
  // };

  useEffect(() => {
    if (userInput.length === 0) return;
    const element = inputRefs.current[userInput.length - 1];
    if (!element) return;

    gsap.fromTo(
      element,
      { y: 20, opacity: 0, scale: 0.8 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.45,
        ease: "back.out(1.7)",
      }
    );
  }, [userInput]);

  useEffect(() => {
    if (!result || !resultRef.current) return;

    gsap.fromTo(
      resultRef.current,
      { opacity: 0, y: 20, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: "back.out(1.5)",
      }
    );
  }, [result]);

  const removeUserInput = (word: ShuffledWord) => {
    if (result) return;

    const index = userInput.findIndex(
      (item) =>
        item.id === word.id && item.wordIndex === word.wordIndex
    );

    if (index === -1) return;

    const element = inputRefs.current[index];

    if (element) {
      gsap.to(element, {
        y: -10,
        opacity: 0,
        scale: 0.8,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          setUserInput((current) =>
            current.filter(
              (item) =>
                !(item.id === word.id && item.wordIndex === word.wordIndex)
            )
          );
        },
      });
    } else {
      setUserInput((current) =>
        current.filter(
          (item) =>
            !(item.id === word.id && item.wordIndex === word.wordIndex)
        )
      );
    }
  };

  const availableWords = useMemo(() => {
    return shuffledWords.filter((word) => {
      const alreadySelected = userInput.some(
        (selected) =>
          selected.id === word.id && selected.wordIndex === word.wordIndex
      );
      return !alreadySelected;
    });
  }, [shuffledWords, userInput]);

  const filteredWords = useMemo(() => {
    const query = wordInput.trim();
    if (!query) return [];

    const normalizedQuery = normalizeArabic(query);
    if (!normalizedQuery) return [];

    return availableWords.filter((word) => {
      const normalizedWord = normalizeArabic(word.word);
      return normalizedWord.includes(normalizedQuery); 
    });
  }, [availableWords, wordInput]);

  const Check = async () => {
    const correctOrder = dividedBlocks.flatMap((block) =>
      block.words.map((_, index) => ({
        id: block.id,
        wordIndex: index,
      }))
    );

    const isCorrect =
      userInput.length === correctOrder.length &&
      userInput.every(
        (word, index) =>
          word.id === correctOrder[index].id &&
          word.wordIndex === correctOrder[index].wordIndex
      );

    const newResult = isCorrect ? "success" : "failed";
    setResult(newResult);

    if (!isCorrect) {
      setMistakes((m) => m + 1);
      setHeartLost((h) => h + 1);

      setTimeout(() => {
        setUserInput([]);
        setResult(null);
        setWordInput(""); 
      }, 2000);

      return;
    }

    try {
      await api.post(`/app/sessions/${id}/complete`, {
        mistakes: Mistakes,
        hearts_lost: heartLosts,
      });

      setTimeout(() => {
        router.push("/app");
      }, 2000);
    } catch (error) {
      console.error("Failed to complete session:", error);
    }
  };


  if (show) {
    return (
      <div
        dir="rtl"
        className="flex p-3 flex-col items-center justify-center gap-10"
      >
        <div className="w-full max-w-3xl space-y-4">
          <div className="text-center">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              مراجعة الحفظ
            </p>
            <h2 className="mt-2 text-3xl font-semibold">
              راجع ما حفظته قبل الاختبار
            </h2>
          </div>

          <div className="space-y-4">
            {currentAyah.map((ayah) => (
              <div
                key={ayah.id}
                className="
                  group rounded-2xl border
                  border-neutral-200
                  p-6
                  transition-all
                  duration-300
                  hover:border-green-500/50
                  hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]
                  dark:border-neutral-800
                  dark:hover:border-green-500/50
                  dark:hover:shadow-[0_0_30px_rgba(34,197,94,0.12)]
                "
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs text-neutral-400">
                    سورة {ayah.surah_number} — الآية {ayah.ayah_number}
                  </span>
                </div>

                <p
                  className="
                    text-right
                    text-3xl
                    leading-[2.2]
                    transition-all
                    duration-300
                    font-[QuranCommon]
                    group-hover:text-green-500
                    group-hover:drop-shadow-[0_0_8px_rgba(34,197,94,0.35)]
                  "
                >
                  {ayah.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShow(false)}
          className="
            rounded-xl
            bg-black
            px-8
            py-3.5
            text-sm
            font-semibold
            text-white
            transition-all
            duration-300
            hover:scale-[1.02]
            hover:shadow-[0_0_25px_rgba(34,197,94,0.25)]
            active:scale-[0.98]
            dark:bg-white
            dark:text-black
          "
        >
          أنا جاهز للاختبار
        </button>

       
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        الاخطاء : {Mistakes}
        القلوب المفقودة لهذه الحصة : {heartLosts}
      </div>

      <div className="min-h-16 flex flex-wrap gap-3 justify-center">
        {userInput.map((word, index) => (
          <div
            key={`${word.id}-${word.wordIndex}-${index}`}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            onClick={() => removeUserInput(word)}
            className="rounded-xl font-[QuranCommon] text-5xl border px-4 py-2 cursor-pointer select-none"
          >
            {word.word}
          </div>
        ))}
      </div>

      {result && (
        <div
          ref={resultRef}
          className="flex flex-col items-center gap-4"
        >
          <h2 className="text-3xl font-bold">
            {result === "success" ? "أحسنت، نجحت" : "لم تنجح"}
          </h2>
          <p className="text-muted-foreground">
            {result === "success"
              ? "رتبت الآيات بالشكل الصحيح."
              : "الترتيب غير صحيح."}
          </p>
        </div>
      )}

      {!result && (
        <Button
          className="w-1/2 mx-auto"
          disabled={userInput.length === 0}
          onClick={Check}
        >
          تحقق
        </Button>
      )}

       <button onClick={() => {
          Check();
          }}>
          d
        </button>

      {!result && (
        <div className="flex flex-col items-center gap-4 w-full max-w-2xl mx-auto">
          <div className="w-full relative">
            <input
              type="text"
              value={wordInput}
              onChange={(e) => setWordInput(e.target.value)}
              placeholder="اكتب حروفًا للبحث عن كلمة..."
              className="
                w-full
                text-center
                text-2xl
                py-4
                px-6
                rounded-2xl
                border-2
                border-neutral-300
                dark:border-neutral-700
                bg-transparent
                focus:outline-none
                focus:ring-2
                focus:ring-green-500
                focus:border-transparent
                transition-all
                duration-300
                placeholder:text-neutral-400
                dark:placeholder:text-neutral-500
                font-[QuranCommon]
              "
              dir="rtl"
              autoFocus
            />
          </div>
          {wordInput.trim() && (
            <div className="flex flex-wrap gap-3 justify-center mt-2 max-h-48 overflow-y-auto p-2">
              {filteredWords.length > 0 ? (
                filteredWords.map((word) => (
                  <div
                    key={`${word.id}-${word.wordIndex}`}
                    className="
                      rounded-xl
                      font-[QuranCommon]
                      text-3xl
                      border
                      px-5
                      py-2
                      cursor-pointer
                      select-none
                      hover:bg-green-500/20
                      dark:hover:bg-green-500/20
                      transition-all
                      duration-200
                      hover:scale-105
                      active:scale-95
                    "
                    onClick={() => {
                      addUserInput(word);
                      setWordInput(""); 
                    }}
                  >
                    {word.word}
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral-500 animate-pulse">
                  لا توجد كلمات مطابقة
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}