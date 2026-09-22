import { motion } from "framer-motion";

/** 每个区块统一的抬头：细线 + 编号 + 名称（+ 右侧小注） */
export function SectionHead({
  index,
  label,
  meta,
}: {
  index: string;
  label: string;
  meta?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-baseline justify-between border-t border-[color:var(--line)] pt-5"
    >
      <p className="eyebrow flex items-center gap-3">
        <span className="tnum text-[color:var(--accent)]">{index}</span>
        <span className="inline-block h-px w-5 bg-[color:var(--fg-subtle)]" />
        {label}
      </p>
      {meta && <p className="eyebrow hidden text-[10px] md:block">{meta}</p>}
    </motion.div>
  );
}
