import Link from 'next/link';
import styles from '../styles/Home.module.css';
import { useState, useRef } from 'react';

export default function Home() {
  const [cameraAccess, setCameraAccess] = useState(false);
  const [checkingCamera, setCheckingCamera] = useState(false);
  let mediaStream = useRef(null);

  const requestCameraAccess = async () => {
    setCheckingCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      mediaStream.current = stream;
      if (stream) {
        setCameraAccess(true);
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      alert('Camera access is required to use this feature.');
    }
    setCheckingCamera(false);
  };

  // Function to stop camera stream
  const stopCameraStream = () => {
    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach((track) => track.stop());
      mediaStream.current = null;
    }
  };


  return (
    <div className={styles.container}>
      <h1 className={styles.title}>COLOR OVEN</h1>

      {/* Manual Entry Button */}
      <Link href="/manual-entry">
        <button className={`${styles.button} ${styles.colorPicker}`}
                onClick={stopCameraStream}
        >
          MANUAL ENTRY
          <span className="ml-3">
          </span>
        </button>
      </Link>

      {/* Camera Button - dynamically updates based on access */}
      {cameraAccess ? (
        <Link href="/camera-scan">
          <button className={`${styles.button} ${styles.cameraEnabled}`}>
            USE CAMERA
          </button>
        </Link>
      ) : (
        <button
          className={`${styles.button} ${styles.cameraDisabled}`}
          onClick={requestCameraAccess}
          disabled={checkingCamera}
        >
          {checkingCamera ? 'CHECKING CAMERA...' : 'REQUEST CAMERA'}
        </button>
      )}
    </div>
  );
}
