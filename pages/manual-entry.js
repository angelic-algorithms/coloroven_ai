import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ColorWheel from '@uiw/react-color-wheel';
import { hexToHsl, hslToHex } from '../utils/colorUtils'; // Ensure this exists
import styles from '../styles/ManualEntry.module.css';

export default function ManualEntry() {
  const router = useRouter();

  // State for color selection
  const [color, setColor] = useState('#ffffff');
  const [hsl, setHsl] = useState({ h: 0, s: 100, l: 50 }); // Default HSL
  const [inputValue, setInputValue] = useState(color);
  const [error, setError] = useState('');

  const hexPattern = /^#([0-9A-Fa-f]{6})$/;

  useEffect(() => {
    if (router.query.color && hexPattern.test(router.query.color)) {
      setColor(router.query.color);
      setInputValue(router.query.color);

      // Convert HEX to HSL and update state
      const hslValue = hexToHsl(router.query.color);
      setHsl(hslValue);
    }
  }, [router.query.color]);

  // Handle color change from the Color Wheel
  const handleColorChange = (newColor) => {
    const hslValue = hexToHsl(newColor.hex); // Convert selected color to HSL
    setColor(newColor.hex);
    setInputValue(newColor.hex);
    setHsl(hslValue); // Sync full HSL from color wheel
    setError('');
  };

  // Handle Saturation change
  const handleSaturationChange = (e) => {
    const newSaturation = parseInt(e.target.value, 10);
    setHsl((prev) => ({ ...prev, s: newSaturation }));

    const adjustedColor = hslToHex(hsl.h, newSaturation, hsl.l);
    setColor(adjustedColor);
    setInputValue(adjustedColor);
  };

  // Handle Lightness change
  const handleLightnessChange = (e) => {
    const newLightness = parseInt(e.target.value, 10);
    setHsl((prev) => ({ ...prev, l: newLightness }));

    const adjustedColor = hslToHex(hsl.h, hsl.s, newLightness);
    setColor(adjustedColor);
    setInputValue(adjustedColor);
  };

  // Handle manual hex input
  const handleHexInputChange = (e) => {
    const newHex = e.target.value.toUpperCase();
    setInputValue(newHex);

    if (hexPattern.test(newHex)) {
      setColor(newHex);
      const hslValue = hexToHsl(newHex);
      setHsl(hslValue);
      setError('');
    } else {
      setError('Invalid HEX format. Please use #RRGGBB');
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
      {/* Back Button */}
      <div className={styles.backButton}>
        <Link href="/">
          <button className={styles.backButtonText}>← BACK</button>
        </Link>
      </div>

      {/* Title */}
      <h1 className={styles.title}>COLOR OVEN</h1>

      {/* Color Selection Section */}
      <div className={styles.colorSelectionContainer}>
        {/* Saturation & Lightness Sliders */}
        <div className={styles.slidersContainer}>
          {/* Saturation Slider */}
          <div className={styles.sliderContainer}>
            <label className={styles.sliderLabel}>Saturation</label>
            <input
              type="range"
              min="0"
              max="100"
              value={hsl.s}
              onChange={handleSaturationChange}
              className={styles.saturationSlider}
              orient="vertical"
            />
          </div>

          {/* Lightness Slider */}
          <div className={styles.sliderContainer}>
            <label className={styles.sliderLabel}>Lightness</label>
            <input
              type="range"
              min="0"
              max="100"
              value={hsl.l}
              onChange={handleLightnessChange}
              className={styles.lightnessSlider}
              orient="vertical"
            />
          </div>
        </div>

        {/* Circular Color Wheel */}
        <div className={styles.colorWheelContainer}>
          <ColorWheel color={color} onChange={handleColorChange} />
        </div>
      </div>

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
