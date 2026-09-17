import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styles from '../styles/ColorSchemesResult.module.css';

const SCHEME_LABELS = {
  original: 'Your Color',
  complementary: 'Complementary',
  analogous: 'Analogous',
  splitComplementary: 'Split Complementary',
  triadic: 'Triadic',
  tetradic: 'Tetradic',
  monochromatic: 'Monochromatic',
};

const SCHEME_ORDER = [
  'complementary',
  'analogous',
  'splitComplementary',
  'triadic',
  'tetradic',
  'monochromatic',
];

const TILTS = [-3, 2, -2, 3, -2.5, 1.5];

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

function Swatch({ rgb }) {
  const hex = rgbToHex(rgb);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      className={styles.swatch}
      style={{ backgroundColor: hex }}
      onClick={handleCopy}
      title={`Copy ${hex}`}
    >
      <span className={styles.swatchLabel}>{copied ? 'Copied!' : hex}</span>
    </button>
  );
}

function Plate({ schemeKey, colors, tilt, angle }) {
  return (
    <div className={styles.settingSlot} style={{ '--angle': `${angle}deg` }}>
      <motion.div
        className={styles.setting}
        variants={{
          hidden: { opacity: 0, y: 70, scale: 0.82, rotate: tilt * 2 },
          visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            rotate: 0,
            transition: { type: 'spring', stiffness: 260, damping: 20 },
          },
        }}
      >
        <div className={styles.tentCard} style={{ transform: `rotate(${tilt}deg)` }}>
          {SCHEME_LABELS[schemeKey]}
        </div>

        <div className={styles.plate}>
          <motion.span
            className={styles.steam}
            initial={{ opacity: 0, y: 0, scale: 0.6 }}
            animate={{ opacity: [0, 0.55, 0], y: -30, scale: 1.2 }}
            transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
          />
          <motion.span
            className={`${styles.steam} ${styles.steamRight}`}
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: [0, 0.45, 0], y: -24, scale: 1 }}
            transition={{ duration: 1.3, delay: 0.7, ease: 'easeOut' }}
          />
          <div className={styles.swatchCluster}>
            {colors.map((rgb, idx) => (
              <Swatch key={idx} rgb={rgb} />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ColorSchemesResult({ color, onBack }) {
  const [schemes, setSchemes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!color) return;

    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    fetch(`/api/color-schemes-api?r=${r}&g=${g}&b=${b}`)
      .then((res) => res.json())
      .then((data) => {
        setSchemes(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching color schemes:', error);
        setFailed(true);
        setLoading(false);
      });
  }, [color]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <button type="button" onClick={onBack} className={styles.backButton}>
          ← Back
        </button>
        <div className={styles.headerText}>
          <p className={styles.eyebrow}>Step 2</p>
          <h1 className={styles.heading}>Fresh out of the oven</h1>
        </div>
        <div className={styles.baseColor}>
          <span className={styles.baseSwatch} style={{ backgroundColor: color }} />
          <span className={styles.baseHex}>{color}</span>
        </div>
      </div>

      {loading && (
        <div className={styles.grid}>
          {SCHEME_ORDER.map((key, idx) => (
            <div
              key={key}
              className={styles.settingSlot}
              style={{ '--angle': `${(idx * 360) / SCHEME_ORDER.length}deg` }}
            >
              <div className={`${styles.plate} ${styles.plateSkeleton}`} />
            </div>
          ))}
        </div>
      )}

      {!loading && failed && (
        <p className={styles.errorText}>Couldn&apos;t cook up your schemes. Please try again.</p>
      )}

      {!loading && !failed && schemes && (
        <motion.div
          className={styles.grid}
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
          }}
        >
          {SCHEME_ORDER.map((key, idx) => (
            <Plate
              key={key}
              schemeKey={key}
              colors={schemes[key]}
              tilt={TILTS[idx % TILTS.length]}
              angle={(idx * 360) / SCHEME_ORDER.length}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
