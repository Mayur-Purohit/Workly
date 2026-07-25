import React, { useEffect, useState, useMemo, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

const defaultWords = [
  "Everything you need to screen at scale",
  "Intelligent Resume Parsing & AI Intake",
  "Three-Signal Automated Fraud Verification",
  "Vector Semantic Skill & Candidate Matching"
];

// 3D Flip-Fade Letter Component
const Letter = memo(function Letter({ char, letterDuration }) {
  return (
    <motion.span
      style={{ transformStyle: "preserve-3d" }}
      variants={{
        initial: {
          rotateX: 90,
          y: 25,
          opacity: 0,
          filter: "blur(8px)",
        },
        animate: {
          rotateX: 0,
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          transition: {
            duration: letterDuration,
            ease: [0.2, 0.65, 0.3, 0.9],
          },
        },
        exit: {
          rotateX: -90,
          y: -25,
          opacity: 0,
          filter: "blur(8px)",
          transition: {
            duration: letterDuration * 0.67,
            ease: "easeIn",
          },
        },
      }}
      className="inline-block origin-bottom"
    >
      {char}
    </motion.span>
  );
});

// Word Grouping to preserve whitespace & responsive wrapping
const Phrase = memo(function Phrase({
  text,
  staggerDelay,
  exitStaggerDelay,
  letterDuration,
  textClassName
}) {
  const wordsList = useMemo(() => text.split(" "), [text]);

  return (
    <motion.div
      className={cn(
        "flex flex-wrap justify-center gap-x-[0.3em] gap-y-2 font-display font-semibold tracking-tight text-foreground",
        textClassName
      )}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={{
        initial: { opacity: 1 },
        animate: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
        exit: {
          opacity: 1,
          transition: {
            staggerChildren: exitStaggerDelay,
          },
        },
      }}
    >
      {wordsList.map((word, wordIdx) => (
        <span key={`word-${wordIdx}`} className="inline-flex whitespace-nowrap">
          {word.split("").map((char, charIdx) => (
            <Letter
              key={`char-${wordIdx}-${charIdx}`}
              char={char}
              letterDuration={letterDuration}
            />
          ))}
        </span>
      ))}
    </motion.div>
  );
});

export function FlipFadeText({
  words = defaultWords,
  interval = 3500,
  className,
  textClassName,
  letterDuration = 0.55,
  staggerDelay = 0.035,
  exitStaggerDelay = 0.015,
}) {
  const [index, setIndex] = useState(0);

  const updateIndex = useCallback(() => {
    setIndex((prev) => (prev + 1) % words.length);
  }, [words.length]);

  useEffect(() => {
    if (!words || words.length <= 1) return;
    const timer = setInterval(updateIndex, interval);
    return () => clearInterval(timer);
  }, [updateIndex, interval, words]);

  const currentText = useMemo(() => words[index] || words[0], [words, index]);

  return (
    <div className={cn("flex items-center justify-center min-h-[60px] py-1", className)}>
      <div className="relative flex items-center justify-center w-full" style={{ perspective: "1200px" }}>
        <AnimatePresence mode="wait">
          <Phrase
            key={currentText}
            text={currentText}
            staggerDelay={staggerDelay}
            exitStaggerDelay={exitStaggerDelay}
            letterDuration={letterDuration}
            textClassName={textClassName}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}

export default FlipFadeText;
