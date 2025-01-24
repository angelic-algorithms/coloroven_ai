import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/color-schemes.module.css';

export default function ColorSchemes() {
  const router = useRouter();
  const { color } = router.query; // Get color from query params
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
        .catch((error) => console.error('Error fetching color schemes:', error));
    }
  }, [color]);

  return (
    <div className={styles.container}>
      {/* Back Button */}
      <div className={styles.backButton}>
        <Link href="/manual-entry">
          <button className={styles.backButtonText}>← BACK</button>
        </Link>
      </div>

      <h1 className={styles.title}>COLOR SCHEMES</h1>

      {loading ? (
        <p>Loading color schemes...</p>
      ) : colorSchemes ? (
        <div className={styles.schemeContainer}>
          {Object.entries(colorSchemes).map(([schemeName, colors]) => (
            <div key={schemeName} className={styles.schemeItem}>
              <p>{schemeName.replace(/([A-Z])/g, ' $1').trim()}</p>
              <div className={styles.colorBoxes}>
                {colors.map((col, index) => (
                  <div
                    key={index}
                    className={styles.colorBox}
                    style={{ backgroundColor: `rgb(${col.r},${col.g},${col.b})` }}
                  ></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No color schemes found. Try again.</p>
      )}

      {/* Cook Button */}
      <button className={styles.cookButton} onClick={() => alert('Feature coming soon!')}>
        COOK
      </button>
    </div>
  );
}
