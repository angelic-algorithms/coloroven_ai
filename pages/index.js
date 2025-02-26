import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import ColorWheel from '@uiw/react-color-wheel';
import { hexToHsl, hslToHex } from '../utils/colorUtils'; // Ensure this exists
import ColorSchemes from './color-schemes'; // Import ColorSchemes directly
import styles from '../styles/ManualEntry.module.css';

export default function Home() {
  const router = useRouter();
  const scrollRef = useRef(null);

  // State for color selection and transitions
  const [color, setColor] = useState('#ffffff');
  const [inputValue, setInputValue] = useState(color);
  const [error, setError] = useState('');
  const [isCooking, setIsCooking] = useState(false); // Track if "cooking" is happening
  const [showScrollIndicator, setShowScrollIndicator] = useState(false); // For bounce indicator

  const hexPattern = /^#([0-9A-Fa-f]{6})$/;

  useEffect(() => {
    if (router.query.color && hexPattern.test(router.query.color)) {
      setColor(router.query.color);
      setInputValue(router.query.color);
    }
  }, [router.query.color]);

  // Handle color change from the Color Wheel
  const handleColorChange = (newColor) => {
    setColor(newColor.hex);
    setInputValue(newColor.hex.toUpperCase());
    setError('');
  };

  // Handle manual hex input
  const handleHexInputChange = (e) => {
    const newHex = e.target.value.toUpperCase();
    setInputValue(newHex);

    if (hexPattern.test(newHex)) {
      setColor(newHex);
      setError('');
    } else {
      setError('Invalid HEX format. Use #RRGGBB');
    }
  };

  // Seamless transition to Color Schemes with animation
  const handleCook = () => {
    if (!hexPattern.test(color)) {
      setError('Please enter a valid hex color before proceeding.');
      return;
    }
    setIsCooking(true); // Trigger the animated transition

    // Show scroll indicator after entering ColorSchemes
    setTimeout(() => setShowScrollIndicator(true), 1000);
  };

  // Scroll Detection for Returning to Index
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY === 0 && isCooking) {
        setIsCooking(false); // Scroll back to color selection
        setShowScrollIndicator(false); // Hide indicator on return
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isCooking]);

  return (
    <div className={styles.container} ref={scrollRef}>
      <AnimatePresence exitBeforeEnter>
        {!isCooking ? (
          <motion.div
            key="cooking"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.8 }}
            className={styles.cookingArea}
          >
            {/* Centering Wrapper */}
            <div className={styles.centerWrapper}>
              {/* Title */}
              <h1 className={styles.title}>COLOR OVEN</h1>

              {/* Color Wheel */}
              <div className={styles.ovenFrame}>
                <div className={styles.colorWheelContainer}>
                  <ColorWheel color={color} onChange={handleColorChange} />
                </div>
              </div>

              <div className={styles.knobsContainer}>
                <div className={styles.knob}></div>
                <div className={styles.knob}></div>
                <div className={styles.knob}></div>
              </div>

              {/* Hex Input */}
              <input
                type="text"
                value={inputValue}
                onChange={handleHexInputChange}
                className={`${styles.hexInput} ${error ? styles.inputError : ''}`}
                placeholder="#FFFFFF"
              />
              {error && <p className={styles.error}>{error}</p>}

              {/* Color Preview */}
              <div className={styles.colorDisplayContainer}>
                <p className={styles.colorDisplayText}>Selected Color</p>
                <div className={styles.panContainer}>
                  <div className={styles.panHandle}></div>
                  <div className={styles.colorPan} style={{ backgroundColor: color }}></div>
                </div>
              </div>

              {/* Cook Button */}
              <button onClick={handleCook} className={styles.ovenButton}>
                <div className={styles.indicatorLight}></div>
                <span className={styles.ovenText}>COOK</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="colorSchemes"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <ColorSchemes color={color} /> {/* Pass selected color to ColorSchemes */}

            {/* Bouncing Scroll Indicator */}
            {showScrollIndicator && (
              <motion.div
                className={styles.scrollIndicator}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <p>Scroll Up to Return</p>
                <span className={styles.arrowUp}>⬆️</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>

  );
}
