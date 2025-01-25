import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/color-schemes.module.css';

export default function ColorSchemes() {
  const router = useRouter();
  const { color, colors } = router.query; // Get color from query params
  const [colorSchemes, setColorSchemes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColors, setSelectedColors] = useState([]);

  const capitalizeWords = (str) => {
    return str
      .split(' ')               // Split string into words by spaces
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
      .join(' ');               // Join the words back into a single string
  };

  //color-oven/apiCall
  useEffect(() => {
    if (color) {
      const cachedSchemes = localStorage.getItem(`colorSchemes-${color}`);
      console.log('Checking localStorage for:', `colorSchemes-${color}`);
      
      if (cachedSchemes) {
        console.log('Retrieved from localStorage:', JSON.parse(cachedSchemes));
        setColorSchemes(JSON.parse(cachedSchemes));
        setLoading(false);
      } else {
        console.log('Fetching data from API...');
        setLoading(true);
        fetch(`/api/color-schemes-api?r=${parseInt(color.slice(1, 3), 16)}&g=${parseInt(color.slice(3, 5), 16)}&b=${parseInt(color.slice(5, 7), 16)}`)
          .then((res) => res.json())
          .then((data) => {
            console.log('API response:', data);
            setColorSchemes(data);
            localStorage.setItem(`colorSchemes-${color}`, JSON.stringify(data));
            setLoading(false);
          })
          .catch((error) => {
            console.error('Error fetching color schemes:', error);
            setLoading(false);
          });
      }
    } else {
      console.log('No color provided');
      setLoading(false);
    }
  }, [color]);
  
  

    // Restore selected colors from the query parameter if they exist
  useEffect(() => {
    console.log('URL query parameter colors:', colors);
    if (colors) {
      const decodedColors = decodeURIComponent(colors).split('|');
      setSelectedColors(decodedColors);
    }
  }, [colors]);

  useEffect(() => {
    console.log('Current selected colors state:', selectedColors);
  }, [selectedColors]);
  
  

  // Toggle color selection
  const handleColorSelect = (color) => {
    if (selectedColors.includes(color)) {
      setSelectedColors((prevColors) => prevColors.filter(c => c !== color));
    } else {
      setSelectedColors((prevColors) => [...prevColors, color]);
    }
  };

    // Navigate to search page with selected colors
    const handleCook = () => {
      if (selectedColors.length > 0) {
        const encodedColors = encodeURIComponent(selectedColors.join('|'));
        router.push(`/search?color=${encodeURIComponent(color)}&colors=${encodedColors}`);
      } else {
        alert('Please select at least one color.');
      }
    };

  return (
    <div className={styles.container}>
      <div className={styles.backButton}>
        <Link href={`/manual-entry?color=${encodeURIComponent(color)}`}>
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
            <p className={styles.schemeTitle}>
              <strong>{capitalizeWords(schemeName.replace(/([A-Z])/g, ' $1').trim())}</strong>
            </p>
            <div className={styles.colorBoxes}>
              {colors.map((col, index) => {
                const colorString = `rgb(${col.r},${col.g},${col.b})`;
                return (
                  <div
                    key={index}
                    className={`${styles.colorBox} ${
                      selectedColors.includes(colorString) ? styles.selected : ''
                    }`}
                    style={{ backgroundColor: colorString }}
                    onClick={() => handleColorSelect(colorString)}
                  >
                    {selectedColors.includes(colorString) && (
                      <span className={styles.checkmark}>✔</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      ) : (
        <p>No color schemes found. Try again.</p>
      )}

      {/* Cook Button */}
      <button className={styles.cookButton} onClick={handleCook}>
        COOK
      </button>
    </div>
  );
}
