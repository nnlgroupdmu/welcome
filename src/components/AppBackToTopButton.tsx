import { AnimatePresence, motion } from 'motion/react';
import { ArrowUp } from 'lucide-react';

type AppBackToTopButtonProps = {
  showScrollTop: boolean;
  scrollToTop: () => void;
};

export function AppBackToTopButton({ showScrollTop, scrollToTop }: AppBackToTopButtonProps) {
  return (
    <AnimatePresence>
      {showScrollTop && (
        <motion.button
          id="btn-back-to-top"
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.8, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 15 }}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 p-3.5 bg-teal-600 hover:bg-teal-500 text-white rounded-full shadow-lg hover:shadow-teal-650/20 hover:shadow-xl transition-all duration-300 group cursor-pointer border border-teal-500/30 flex items-center justify-center focus:outline-none"
          title="返回顶部"
        >
          <ArrowUp className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
