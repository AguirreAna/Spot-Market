// Pin flotante con ícono/emoji de producto, animado con framer-motion.
import { motion } from 'framer-motion';

export default function ProductPin({ label, className = '', delay = 0 }) {
  return (
    <motion.div
      className={`absolute flex items-center gap-1 px-2 py-1 rounded-full bg-[#0a1222]/80 border border-amber-400/30 text-xs text-amber-100 backdrop-blur ${className}`}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <span className="h-2 w-2 rounded-full bg-amber-400 inline-block" />
      {label}
    </motion.div>
  );
}
