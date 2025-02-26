import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ColorWheel from '@uiw/react-color-wheel';
import { hexToHsl, hslToHex } from '../utils/colorUtils'; // Ensure this exists
import styles from '../styles/ManualEntry.module.css';

export default function Home() {
  const router = useRouter();

  // State for color selection
  const [color, setColor] = useState('#ffffff');
  const [inputValue, setInputValue] = useState(color);
  const [error, setError] = useState('');

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

  // Navigate to the color schemes page
  const handleCook = () => {
    if (!hexPattern.test(color)) {
      setError('Please enter a valid hex color before proceeding.');
      return;
    }
    router.push(`/color-schemes?color=${encodeURIComponent(color)}&source=manual-entry`);
  };

  return (
    <div className={styles.container}>
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
          <div className={styles.panHandle}></div> {/* Move handle before the pan */}
          <div
            className={styles.colorPan}
            style={{ backgroundColor: color }}
          ></div>
        </div>
      </div>


      {/* Cook Button */}
      <button onClick={handleCook} className={styles.ovenButton}>
        <div className={styles.indicatorLight}></div>
        <span className={styles.ovenText}>COOK</span>
      </button>
    </div>
  );
}
