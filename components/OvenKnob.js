import { useCallback, useEffect, useRef } from 'react';
import styles from '../styles/OvenKnob.module.css';

const SWEEP = 270;
const START_ANGLE = -135;

function angleFromCenter(cx, cy, x, y) {
  const dx = x - cx;
  const dy = y - cy;
  return Math.atan2(dx, -dy) * (180 / Math.PI); // 0deg = up, clockwise positive
}

function clampAngle(angle) {
  if (angle >= 135 && angle <= 180) return 135;
  if (angle <= -135 && angle >= -180) return -135;
  return angle;
}

export default function OvenKnob({ value, min, max, onChange, label, accent, size = 60 }) {
  const knobRef = useRef(null);
  const draggingRef = useRef(false);

  const fraction = (value - min) / (max - min);
  const angle = START_ANGLE + fraction * SWEEP;
  const arcDeg = fraction * SWEEP;

  const updateFromPointer = useCallback(
    (clientX, clientY) => {
      const el = knobRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const clamped = clampAngle(angleFromCenter(cx, cy, clientX, clientY));
      const frac = (clamped - START_ANGLE) / SWEEP;
      onChange(Math.round(min + frac * (max - min)));
    },
    [min, max, onChange]
  );

  useEffect(() => {
    const handleMove = (e) => {
      if (!draggingRef.current) return;
      updateFromPointer(e.clientX, e.clientY);
    };
    const handleUp = () => {
      draggingRef.current = false;
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [updateFromPointer]);

  const handlePointerDown = (e) => {
    draggingRef.current = true;
    updateFromPointer(e.clientX, e.clientY);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(Math.min(max, value + 1));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(Math.max(min, value - 1));
    }
  };

  return (
    <div className={styles.wrap} style={{ width: size, height: size }}>
      <div
        ref={knobRef}
        className={styles.knob}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        style={{ '--arc-deg': `${arcDeg}deg`, '--accent': accent }}
      >
        <span className={styles.ticks} aria-hidden="true" />
        <span className={styles.arc} aria-hidden="true" />
        <div className={styles.face}>
          <span
            className={styles.pointer}
            style={{ transform: `translate(-50%, -100%) rotate(${angle}deg)` }}
          />
        </div>
      </div>
      <p className={styles.label}>{label}</p>
    </div>
  );
}
