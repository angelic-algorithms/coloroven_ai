import { useRouter } from 'next/router';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from '../styles/Search.module.css';

export default function Search() {
  const router = useRouter();
  const { color, colors } = router.query;
  const [query, setQuery] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Decode color query parameter and ensure they are valid
  const selectedColors = colors ? decodeURIComponent(colors).split('|').map(color => color.trim()) : [];

  const isValidColor = (color) => {
    const hexPattern = /^#[0-9A-Fa-f]{6}$/;
    const rgbPattern = /^rgb\(\d{1,3},\d{1,3},\d{1,3}\)$/;
    return hexPattern.test(color) || rgbPattern.test(color);
  };

useEffect(() => {
  if (!colors) {
      router.push('/color-schemes'); // Redirect if no colors are selected
    }
  }, [colors, router]);

  const handleSearch = async () => {
    if (!query) return alert('Please enter a search query.');

    try {
      const response = await fetch('/api/gpt-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, colors: colors.split('|') }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch AI response');
      }

      const data = await response.json();
      setChatResponse(data.response);

      // Extracting formatted results from AI response
      const parsedResults = data.response.match(/\[(.*?)\]\((.*?)\)/g) || [];
      const formattedResults = parsedResults.map((item) => {
        const match = item.match(/\[(.*?)\]\((.*?)\)/);
        return { name: match[1], link: match[2] };
      });

      setSearchResults(formattedResults);
    } catch (error) {
      console.error('Error:', error);
      alert('Error fetching AI response');
    }
  };
    
    
    
  return (
    <div className={styles.container}>
      <div className={styles.backButton}>
        <Link href={`/color-schemes?color=${encodeURIComponent(color)}&colors=${encodeURIComponent(selectedColors.join('|'))}`}>
          <button className={styles.backButtonText}>← BACK</button>
        </Link>;
      </div>

      <h1 className={styles.title}>SEARCH COLORS</h1>

      <div className={styles.selectedColors}>
        {selectedColors.map((color, index) => {
          const validColor = isValidColor(color) ? color : '#CCCCCC';
          return(
          <div
            key={index}
            className={styles.colorBox}
            style={{
              backgroundColor: validColor,
            }}
          ></div>
          );
        })}
      </div>

      <input
        type="text"
        className={styles.searchInput}
        placeholder="Type your color query"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <button className={styles.searchButton} onClick={handleSearch}>
        SEARCH
      </button>

      {searchResults.length > 0 ? (
        <div className={styles.searchResults}>
          <h2>Search Results:</h2>
          <ul>
            {searchResults.map((item, index) => (
              <li key={index}>
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        chatResponse && <p className={styles.response}>{chatResponse}</p>
      )}
    </div>
  );
}
