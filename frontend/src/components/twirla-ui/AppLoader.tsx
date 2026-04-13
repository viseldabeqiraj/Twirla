import { motion, useReducedMotion } from 'framer-motion';
import './AppLoader.css';

export interface AppLoaderProps {
  message?: string;
  /** full = viewport-centered; inline = block in section */
  variant?: 'full' | 'inline';
}

export default function AppLoader({ message, variant = 'full' }: AppLoaderProps) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={`tw-app-loader tw-app-loader--${variant}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="tw-app-loader__inner">
        <div className="tw-app-loader__ring" aria-hidden />
        {message ? <p className="tw-app-loader__label">{message}</p> : null}
      </div>
    </motion.div>
  );
}
