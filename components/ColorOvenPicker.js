import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ColorWheel from '@uiw/react-color-wheel';
import { hexToHsl, hslToHex } from '../utils/colorUtils';
import OvenKnob from './OvenKnob';
import styles from '../styles/ColorOvenPicker.module.css';

const HEX_PATTERN = /^#([0-9A-Fa-f]{6})$/;
const DOOR_OPEN_DELAY = 380;

export default function ColorOvenPicker({ color, onChange, onCook }) {
  const [inputValue, setInputValue] = useState(color);
  const [error, setError] = useState('');
  const [isCooking, setIsCooking] = useState(false);
  const cookTimeoutRef = useRef(null);
  const hsl = hexToHsl(color);

  useEffect(() => () => clearTimeout(cookTimeoutRef.current), []);

  const commitColor = (hex) => {
    setInputValue(hex);
    setError('');
    onChange(hex);
  };

  const handleWheelChange = (newColor) => {
    commitColor(newColor.hex.toUpperCase());
  };

  const handleHexInputChange = (e) => {
    const raw = e.target.value;
    const newHex = raw.startsWith('#') ? raw.toUpperCase() : `#${raw.toUpperCase()}`;
    setInputValue(newHex);

    if (HEX_PATTERN.test(newHex)) {
      setError('');
      onChange(newHex);
    } else {
      setError('bad hex');
    }
  };

  const handleHueChange = (h) => {
    commitColor(hslToHex(h, hsl.s, hsl.l).toUpperCase());
  };

  const handleSaturationChange = (s) => {
    commitColor(hslToHex(hsl.h, s, hsl.l).toUpperCase());
  };

  const handleLightnessChange = (l) => {
    commitColor(hslToHex(hsl.h, hsl.s, l).toUpperCase());
  };

  const handleCook = () => {
    if (!HEX_PATTERN.test(color)) {
      setError('bad hex');
      return;
    }
    setIsCooking(true);
    cookTimeoutRef.current = setTimeout(onCook, DOOR_OPEN_DELAY);
  };

  const handleRandomize = () => {
    const randomHex = `#${Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, '0')
      .toUpperCase()}`;
    commitColor(randomHex);
  };

  return (
    <div className={styles.layout}>
      <div className={styles.ovenColumn}>
        <div className={styles.ovenFrame}>
          <div className={styles.controlPanel}>
            <div className={styles.ledDisplay}>
              <span className={styles.ledDot} style={{ backgroundColor: color }} />
              <input
                id="hex-input"
                className={styles.ledInput}
                value={inputValue}
                onChange={handleHexInputChange}
                spellCheck={false}
                aria-label="Hex code"
                style={{ color, textShadow: `0 0 6px ${color}` }}
              />
              {error && <span className={styles.ledError}>ERR</span>}
            </div>
          </div>

          <div
            className={`${styles.doorGlow} ${isCooking ? styles.doorFlash : ''}`}
            style={{ '--glow-color': color }}
          >
            <div className={styles.doorBezel}>
              <div className={styles.wheelWell}>
                <ColorWheel color={color} onChange={handleWheelChange} width={220} height={220} />
              </div>
            </div>
          </div>

          <div className={styles.doorHandle} aria-hidden="true" />

          <div className={styles.knobRow}>
            <OvenKnob label="Hue" min={0} max={360} value={hsl.h} onChange={handleHueChange} accent={color} />
            <OvenKnob
              label="Sat"
              min={0}
              max={100}
              value={hsl.s}
              onChange={handleSaturationChange}
              accent={color}
            />
            <OvenKnob
              label="Light"
              min={0}
              max={100}
              value={hsl.l}
              onChange={handleLightnessChange}
              accent={color}
            />
          </div>

          <div className={styles.actionRow}>
            <motion.button
              onClick={handleCook}
              className={styles.cookButton}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.94, y: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              <span className={styles.indicatorLight} />
              Cook
            </motion.button>
            <div className={styles.surpriseWrap}>
              <motion.button
                type="button"
                onClick={handleRandomize}
                className={styles.surpriseButton}
                aria-label="Surprise me with a random color"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9, rotate: -15 }}
                transition={{ type: 'spring', stiffness: 400, damping: 12 }}
              >
                <span className={styles.surpriseCore} />
              </motion.button>
              <p className={styles.surpriseLabel}>Surprise</p>
            </div>
          </div>

          <div className={styles.feet} aria-hidden="true">
            <span />
            <span />
          </div>
        </div>
      </div>

      <div className={styles.manual}>
        <div className={styles.manualHoles} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p className={styles.manualSection}>Section 01</p>
        <h1 className={styles.manualTitle}>Operating Instructions</h1>
        <hr className={styles.manualRule} />
        <ol className={styles.manualSteps}>
          <li>
            <span className={styles.stepNumber}>1</span>
            <span>
              Turn the door wheel, or the <strong>HUE</strong>, <strong>SAT</strong> and{' '}
              <strong>LIGHT</strong> knobs, to mix your base color.
            </span>
          </li>
          <li>
            <span className={styles.stepNumber}>2</span>
            <span>Watch the display and the oven glow follow along as you dial it in.</span>
          </li>
          <li>
            <span className={styles.stepNumber}>3</span>
            <span>
              Press <strong>COOK</strong> when it looks right — or hit{' '}
              <strong>SURPRISE</strong> for a random batch.
            </span>
          </li>
        </ol>
        <hr className={styles.manualRule} />
        <p className={styles.manualCaption}>Fig. 1 — Color Oven, Model CO&#8209;1</p>
      </div>
    </div>
  );
}
