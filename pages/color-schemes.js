import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styles from '../styles/color-schemes.module.css';

export default function ColorSchemes({ color }) {
  const [colorSchemes, setColorSchemes] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (color) {
      fetch(`/api/color-schemes-api?r=${parseInt(color.slice(1, 3), 16)}&g=${parseInt(color.slice(3, 5), 16)}&b=${parseInt(color.slice(5, 7), 16)}`)
        .then((res) => res.json())
        .then((data) => {
          setColorSchemes(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching color schemes:', error);
          setLoading(false);
        });
    }
  }, [color]);

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className={styles.title}>COLOR SCHEMES</h1>
      {loading ? (
        <p>Loading color schemes...</p>
      ) : colorSchemes ? (
        <div className={styles.schemeContainer}>
          {Object.entries(colorSchemes).map(([schemeName, colors]) => (
            <div key={schemeName} className={styles.schemeItem}>
              <p className={styles.schemeTitle}>{schemeName}</p>
              <div className={styles.colorBoxes}>
                {colors.map((col, idx) => (
                  <div
                    key={idx}
                    className={styles.colorBox}
                    style={{ backgroundColor: `rgb(${col.r},${col.g},${col.b})` }}
                  ></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No color schemes found.</p>
      )}
    </motion.div>
  );
}
