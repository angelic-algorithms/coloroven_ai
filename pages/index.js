import { useState } from 'react';
import Head from 'next/head';
import { AnimatePresence, motion } from 'framer-motion';
import ColorOvenPicker from '../components/ColorOvenPicker';
import ColorSchemesResult from '../components/ColorSchemesResult';
import { getReadableTextColor } from '../utils/colorUtils';
import styles from '../styles/App.module.css';

export default function Home() {
  const [color, setColor] = useState('#FF7A45');
  const [step, setStep] = useState('pick'); // 'pick' | 'cooked'
  const onColor = getReadableTextColor(color);

  return (
    <>
      <Head>
        <title>Color Oven</title>
        <meta name="description" content="Cook up a color palette from any hue." />
      </Head>
      <div className={styles.page} style={{ '--live-color': color, '--on-color': onColor }}>
        <header className={styles.brand}>
          <span className={styles.brandMark} style={{ backgroundColor: color }} />
          <span className={styles.brandName}>Color Oven</span>
        </header>

        <div className={styles.stage}>
          <AnimatePresence mode="wait">
            {step === 'pick' ? (
              <motion.div
                key="pick"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className={styles.stagePanel}
              >
                <ColorOvenPicker
                  color={color}
                  onChange={setColor}
                  onCook={() => setStep('cooked')}
                />
              </motion.div>
            ) : (
              <motion.div
                key="cooked"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className={styles.stagePanel}
              >
                <ColorSchemesResult key={color} color={color} onBack={() => setStep('pick')} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
