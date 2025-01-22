import Link from 'next/link';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>COLOR OVEN</h1>

      {/* Manual Entry Button */}
      <Link href="/manual-entry">
        <button className={`${styles.button} ${styles.colorPicker}`}>
          MANUAL ENTRY
          <span className="ml-3">
          </span>
        </button>
      </Link>

      {/* Disabled Camera Button */}
      <button className={`${styles.button} ${styles.cameraDisabled}`} disabled>
        CAMERA NOT FOUND
        <span className="ml-3">
        </span>
      </button>
    </div>
  );
}
