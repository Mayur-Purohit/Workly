import React from "react";
import { motion } from "framer-motion";
import {
  Code2,
  Palette,
  LineChart,
  Megaphone,
  HeartPulse,
  Wrench,
  GraduationCap,
  Building2,
} from "lucide-react";

// Default Category Data
const DEFAULT_CATEGORIES = [
  { id: "eng", title: "Engineering", count: "2,840 open", icon: Code2, color: "#1a73e8" },
  { id: "des", title: "Design", count: "1,120 open", icon: Palette, color: "#ea4335" },
  { id: "ai", title: "Data & AI", count: "960 open", icon: LineChart, color: "#34a853" },
  { id: "mkt", title: "Marketing", count: "740 open", icon: Megaphone, color: "#fbbc05" },
  { id: "health", title: "Healthcare", count: "510 open", icon: HeartPulse, color: "#ea4335" },
  { id: "ops", title: "Operations", count: "430 open", icon: Wrench, color: "#1a73e8" },
  { id: "edu", title: "Education", count: "280 open", icon: GraduationCap, color: "#34a853" },
  { id: "fin", title: "Finance", count: "640 open", icon: Building2, color: "#fbbc05" },
];

// Motion Animation Variants
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.215, 0.61, 0.355, 1.0] },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function ExploreCategories({
  categories = DEFAULT_CATEGORIES,
  categoryCounts,
  onCategoryClick,
  onViewAllClick,
}) {
  return (
    <motion.section
      className="mx-auto max-w-7xl px-6 py-16"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={containerVariants}
    >
      {/* Header Bar */}
      <motion.div variants={headerVariants} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--google-blue)]">
            BROWSE
          </span>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl font-display">
            Explore by category
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick a path. We'll surface roles, salaries and companies in your field.
          </p>
        </div>

        <button
          onClick={onViewAllClick}
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-foreground shadow-sm transition hover:border-slate-300 hover:bg-muted"
        >
          All categories
        </button>
      </motion.div>

      {/* Grid of Cards */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const liveCount = categoryCounts?.[cat.title];
          const countText = liveCount !== undefined && liveCount !== null ? `${Number(liveCount).toLocaleString()} open` : "0 open";

          return (
            <motion.div key={cat.id || cat.title} variants={itemVariants} className="flex">
              <div
                onClick={() => onCategoryClick && onCategoryClick(cat)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onCategoryClick && onCategoryClick(cat)}
                className="group flex flex-1 cursor-pointer items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:border-slate-300 hover:shadow-md hover:google-shadow"
              >
                {/* Icon Container with dynamic translucent background */}
                <div
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-transform duration-200 group-hover:scale-105"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${cat.color} 14%, transparent)`,
                  }}
                >
                  <Icon className="h-5 w-5" style={{ color: cat.color }} />
                </div>

                {/* Text Content */}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                    {cat.title}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {countText}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
