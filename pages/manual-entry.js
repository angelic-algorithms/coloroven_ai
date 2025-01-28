import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ColorWheel from '@uiw/react-color-wheel';
import styles from '../styles/ManualEntry.module.css';

export default function ManualEntry() {
  const router = useRouter();

  // State for color selection
  const [color, setColor] = useState('#ffffff');

  const [inputValue, setInputValue] = useState(color);
  const [error, setError] = useState('');
  // Regular expression for valid hex color codes
  const hexPattern = /^#([0-9A-Fa-f]{6})$/;

  useEffect(() => {
    // Read color from URL query if available
    if (router.query.color && /^#([0-9A-Fa-f]{6})$/.test(router.query.color)) {
      setColor(router.query.color);
      setInputValue(router.query.color);
    }
  }, [router.query.color]);

  // Handle color change from the color wheel
  const handleColorChange = (newColor) => {
    setColor(newColor.hex);
    setInputValue(newColor.hex);
    setError('');
  };

  // Handle manual hex input and update the color wheel
  const handleHexInputChange = (e) => {
    const newHex = e.target.value.toUpperCase();
    setInputValue(newHex);

    if (hexPattern.test(newHex)) {
      setColor(newHex);
      setError('');
    } else {
      setError('Invalid HEX format. Please use #RRGGBB');
    }
  };

  // Navigate to the color schemes page with the selected color
  const handleCook = () => {
    if (!hexPattern.test(color)) {
      setError('Please enter a valid hex color before proceeding.');
      return;
    }
    router.push(`/color-schemes?color=${encodeURIComponent(color)}&source=manual-entry`);
  };
  

  return (
    <div className={styles.container}>
      {/* Back Button */}
      <div className={styles.backButton}>
        <Link href="/">
          <button className={styles.backButtonText}>← BACK</button>
        </Link>
      </div>

      {/* Title */}
      <h1 className={styles.title}>COLOR OVEN</h1>

      {/* Circular Color Wheel */}
      <div className={styles.colorWheelContainer}>
        <ColorWheel color={color} onChange={handleColorChange} />
      </div>

      {/* Spacer */}
      <div className={styles.spacer}></div>

      {/* Hex Input */}
      <input
        type="text"
        value={inputValue}
        onChange={handleHexInputChange}
        className={styles.hexInput}
        placeholder="Hex Input... i.e. #FFFFFF"
      />
      {error && <p className={styles.error}>{error}</p>}

      {/* Divider Line */}
      <hr className={styles.divider} />

      {/* Color Display */}
      <div className={styles.colorDisplayContainer}>
        <p className={styles.colorDisplayText}>Input Color</p>
        <div
          className={styles.colorDisplayBox}
          style={{ backgroundColor: color }}
        ></div>
      </div>

      {/* Cook Button */}
      <button onClick={handleCook} className={styles.cookButton}>
        COOK
      </button>
    </div>
  );
}
