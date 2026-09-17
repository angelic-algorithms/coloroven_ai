import { useRouter } from 'next/router';
import ColorSchemesResult from '../components/ColorSchemesResult';
import { getReadableTextColor } from '../utils/colorUtils';
import styles from '../styles/App.module.css';

export default function ColorSchemesPage() {
  const router = useRouter();
  const { color } = router.query;

  if (!router.isReady || !color) {
    return null;
  }

  return (
    <div className={styles.page} style={{ '--live-color': color, '--on-color': getReadableTextColor(color) }}>
      <ColorSchemesResult key={color} color={color} onBack={() => router.push('/')} />
    </div>
  );
}
