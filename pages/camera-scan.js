import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styles from '../styles/CameraScan.module.css';

export default function CameraScan() {
  const router = useRouter();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const holdTimeout = useRef(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [circlePos, setCirclePos] = useState({ x: 0, y: 0 });

  // Initialize the camera when the component mounts
  useEffect(() => {
    getCameraDevices();
    return () => stopCamera(); // Cleanup to stop the camera when the component unmounts
  }, []);

  // Fetch available camera devices
  const getCameraDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      if (videoDevices.length > 0) {
        setSelectedDeviceId(videoDevices[0].deviceId);
        startCamera(videoDevices[0].deviceId);
      }
    } catch (error) {
      console.error('Error accessing camera devices:', error);
      alert('Failed to access cameras.');
    }
  };

  // Start camera stream
  const startCamera = async (deviceId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to start the camera.');
    }
  };

  // Stop the camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Handle device selection
  const handleDeviceChange = (e) => {
    setSelectedDeviceId(e.target.value);
    startCamera(e.target.value);
  };

  // Capture color on long press
  const handleMouseDown = (event) => {
    setIsHolding(true);
    setCirclePos({ x: event.clientX, y: event.clientY });

    let progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          captureColor(event);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    holdTimeout.current = progressInterval;
  };

  // Cancel long press if released early
  const handleMouseUp = () => {
    clearInterval(holdTimeout.current);
    setIsHolding(false);
    setProgress(0);
  };

  // Capture color from video
  const captureColor = (event) => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const rect = videoRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const pixelData = ctx.getImageData(x, y, 1, 1).data;
      const hexColor = `#${pixelData[0].toString(16).padStart(2, '0')}${pixelData[1].toString(16).padStart(2, '0')}${pixelData[2].toString(16).padStart(2, '0')}`;

      setSelectedColor(hexColor);

      // Use router.push for navigation
      router.push(`/color-schemes?color=${encodeURIComponent(hexColor)}&source=camera-scan`);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.backButton}>
        <Link href="/">
          <button className={styles.backButtonText}>← BACK</button>
        </Link>
      </div>

      <h1 className={styles.title}>CAMERA SCAN</h1>

      <strong><p className={styles.subtitle}>Click and Hold to Capture a Color</p></strong>

      {/* Camera Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={styles.cameraView}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      ></video>

      {isHolding && (
        <div
          className={styles.colorCircle}
          style={{
            left: `${circlePos.x}px`,
            top: `${circlePos.y}px`,
            backgroundColor: selectedColor || 'transparent',
          }}
        >
          <div className={styles.progressCircle} style={{ strokeDashoffset: 314 - (progress / 100) * 314 }}></div>
        </div>
      )}

      <select className={styles.cameraSelect} onChange={handleDeviceChange} value={selectedDeviceId}>
        {devices.map((device, index) => (
          <option key={device.deviceId} value={device.deviceId}>
            Camera {index + 1}
          </option>
        ))}
      </select>
    </div>
  );
}
