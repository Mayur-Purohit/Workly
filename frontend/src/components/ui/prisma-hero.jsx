import React, { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Search, Sparkles } from "lucide-react";

/* ---------------- WordsPullUp ---------------- */
export const WordsPullUp = ({ text, className = "", showAsterisk = false, style }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const words = text.split(" ");

  return (
    <div ref={ref} className={`inline-flex flex-wrap ${className}`} style={style}>
      {words.map((word, i) => {
        const isLast = i === words.length - 1;
        return (
          <motion.span
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="inline-block relative"
            style={{ marginRight: isLast ? 0 : "0.25em" }}
          >
            {word}
            {showAsterisk && isLast && (
              <span className="absolute top-[0.55em] -right-[0.3em] text-[0.3em] text-[#E1E0CC]">*</span>
            )}
          </motion.span>
        );
      })}
    </div>
  );
};

/* ---------------- WordsPullUpMultiStyle ---------------- */
export const WordsPullUpMultiStyle = ({ segments, className = "", style }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const words = [];
  segments.forEach((seg) => {
    seg.text.split(" ").forEach((w) => {
      if (w) words.push({ word: w, className: seg.className });
    });
  });

  return (
    <div ref={ref} className={`inline-flex flex-wrap justify-center ${className}`} style={style}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          className={`inline-block ${w.className ?? ""}`}
          style={{ marginRight: "0.25em" }}
        >
          {w.word}
        </motion.span>
      ))}
    </div>
  );
};

/* ---------------- Hero ---------------- */
const navItems = ["Browse Jobs", "Market Trends", "Resume Matcher", "Salaries", "Company Directory"];

export const PrismaHero = ({
  onUploadClick,
  onExploreClick,
  title = "Workly",
  subtitle = "Connecting global talent with industry-leading companies through AI-powered matching, real-time verification, and intelligent career insights."
}) => {
  const containerRef = useRef(null);
  const { scrollY } = useScroll();

  // Scroll animation transforms (0px to 500px scroll range)
  const bgOpacity = useTransform(scrollY, [0, 500], [1, 0.15]);
  const bgScale = useTransform(scrollY, [0, 500], [1, 1.08]);
  const bgY = useTransform(scrollY, [0, 500], [0, 60]);

  return (
    <section ref={containerRef} className="relative h-[85vh] min-h-[580px] max-h-[850px] w-full mb-12">
      <div className="relative h-full w-full overflow-hidden rounded-3xl md:rounded-[2.5rem] border border-white/10 shadow-2xl">
        
        {/* Background video with scroll-linked opacity, scale, and parallax Y */}
        <motion.div
          style={{
            opacity: bgOpacity,
            scale: bgScale,
            y: bgY,
          }}
          className="absolute inset-0 h-full w-full"
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover filter saturate-[1.1]"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4"
          />
        </motion.div>

        {/* High-contrast crisp gradient overlays to ensure text is never washed out or faded */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/50 z-10" />

        {/* Floating Top Pill Nav */}
        <nav className="absolute left-1/2 top-4 z-20 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-full bg-black/80 backdrop-blur-md border border-white/10 px-5 py-2.5 sm:gap-6 md:gap-8 shadow-lg">
            {navItems.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-xs sm:text-sm font-medium transition-colors text-[#E1E0CC]/80 hover:text-[#E1E0CC]"
              >
                {item}
              </a>
            ))}
          </div>
        </nav>

        {/* Hero Bottom Content */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-6 pb-8 sm:px-8 md:px-12 lg:pb-12">
          <div className="grid grid-cols-12 items-end gap-6">
            
            {/* Title Column */}
            <div className="col-span-12 lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-xs font-semibold text-[#E1E0CC] mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> AI Candidate Portal
              </div>
              <h1
                className="font-bold leading-[0.88] tracking-[-0.06em] text-[20vw] sm:text-[18vw] md:text-[15vw] lg:text-[12vw] xl:text-[10vw]"
                style={{ color: "#E1E0CC" }}
              >
                <WordsPullUp text={title} showAsterisk />
              </h1>
            </div>

            {/* Description & Action Button Column */}
            <div className="col-span-12 flex flex-col gap-6 pb-2 lg:col-span-5 lg:pb-4">
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="text-sm sm:text-base md:text-lg font-normal text-[#E1E0CC]/90 leading-relaxed max-w-lg drop-shadow-sm"
              >
                {subtitle}
              </motion.p>

              <div className="flex flex-wrap items-center gap-3">
                <motion.button
                  onClick={onUploadClick}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="group inline-flex items-center gap-3 rounded-full bg-[#E1E0CC] hover:bg-white px-6 py-3 text-sm sm:text-base font-semibold text-black transition-all hover:gap-4 shadow-xl cursor-pointer"
                >
                  Upload Resume
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black transition-transform group-hover:scale-110">
                    <ArrowRight className="h-4 w-4 text-[#E1E0CC]" />
                  </span>
                </motion.button>

                {onExploreClick && (
                  <motion.button
                    onClick={onExploreClick}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md px-5 py-3 text-sm sm:text-base font-medium text-[#E1E0CC] transition-all cursor-pointer"
                  >
                    <Search className="h-4 w-4" /> Explore Roles
                  </motion.button>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrismaHero;
