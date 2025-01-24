import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ColorWheel from '@uiw/react-color-wheel';
import styles from '../styles/ManualEntry.module.css';

export default function ManualEntry() {
  const router = useRouter();

  // State for color selection
  const [color, setColor] = useState('#ffffff');

  // Handle color change from the color wheel
  const handleColorChange = (newColor) => {
    setColor(newColor.hex);
  };

  // Handle manual hex input and update the color wheel
  const handleHexInputChange = (e) => {
    setColor(e.target.value);
  };

  // Navigate to the color schemes page with the selected color
  const handleCook = () => {
    router.push(`/color-schemes?color=${encodeURIComponent(color)}`);
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
        value={color}
        onChange={handleHexInputChange}
        className={styles.hexInput}
        placeholder="Hex Input... i.e. #FFFFFF"
      />

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
