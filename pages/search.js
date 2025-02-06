import { useRouter } from 'next/router';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from '../styles/Search.module.css';

export default function Search() {
    const router = useRouter();
    const { color, colors } = router.query;
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const selectedColors = colors ? decodeURIComponent(colors).split('|').map(color => color.trim()) : [];

    useEffect(() => {
        if (!colors) {
            router.push('/color-schemes'); // Redirect if no colors are selected
        }
    }, [colors, router]);

    const handleSearch = async () => {
      if (!query) return alert('Please enter a search query.');
  
      setLoading(true);
      try {
          const response = await fetch('/api/ebay-search', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ query, colors: selectedColors }),
          });
  
          console.log("API Response Status:", response.status);
          const data = await response.json();
          console.log("API Response Data:", data);
  
          if (!response.ok) {
              throw new Error(`API Error: ${data.error || "Unknown error"}`);
          }
  
          setSearchResults(data || []);
      } catch (error) {
          console.error('Error:', error);
          alert(error.message);
      } finally {
          setLoading(false);
      }
  };
  

    return (
        <div className={styles.container}>
            <div className={styles.topBar}>
                <div className={styles.backButton}>
                    <Link href={`/color-schemes?color=${encodeURIComponent(color)}&colors=${encodeURIComponent(selectedColors.join('|'))}`}>
                        <button className={styles.backButtonText}>← BACK</button>
                    </Link>
                </div>
                <h1 className={styles.title}>SEARCH COLORS</h1>
            </div>

            <div className={styles.selectedColors}>
                {selectedColors.map((color, index) => (
                    <div
                        key={index}
                        className={styles.colorBox}
                        style={{ backgroundColor: color }}
                    ></div>
                ))}
            </div>

            <input
                type="text"
                className={styles.searchInput}
                placeholder="Type the item you're looking for (e.g., hat, shoes)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />

            <button className={styles.searchButton} onClick={handleSearch} disabled={loading}>
                {loading ? "Searching..." : "SEARCH"}
            </button>

            {searchResults.length > 0 ? (
                <div className={styles.searchResults}>
                    <h2>Search Results:</h2>
                    <div className={styles.productGrid}>
                        {searchResults.map((product, index) => (
                            <a key={index} href={product.link} target="_blank" rel="noopener noreferrer" className={styles.productItem}>
                                <img src={product.image} alt={product.title} className={styles.productImage} />
                                <p className={styles.productName}>{product.title}</p>
                            </a>
                        ))}
                    </div>
                </div>
            ) : (
                loading ? <p className={styles.loading}>Searching for products...</p> : <p className={styles.noResults}>No results found.</p>
            )}
        </div>
    );
}
