import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styles from '../styles/CameraScan.module.css';

export default function CameraScan() {
  const router = useRouter();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);

  // Initialize the camera when the component mounts
  useEffect(() => {
    getCameraDevices();
    return () => stopCamera();
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

  const handleColorSelection = (event) => {
    if (!videoRef.current || !canvasRef.current) return;
  
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
  
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  
    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
    // Get bounding rect & correct position
    const rect = video.getBoundingClientRect();
    const scaleX = video.videoWidth / rect.width; // Scaling factor for width
    const scaleY = video.videoHeight / rect.height; // Scaling factor for height
  
    // Get accurate x, y positions
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
  
    // Get pixel data
    const pixelData = ctx.getImageData(x, y, 1, 1).data;
    const hexColor = `#${pixelData[0].toString(16).padStart(2, "0")}${pixelData[1].toString(16).padStart(2, "0")}${pixelData[2].toString(16).padStart(2, "0")}`;
  
    setSelectedColor(hexColor);
  };
  

  // Proceed to the next page when the "Cook" button is clicked
  const handleCook = () => {
    if (selectedColor) {
      router.push(`/color-schemes?color=${encodeURIComponent(selectedColor)}&source=camera-scan`);
    } else {
      alert("Please select a color first.");
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

      <strong><p className={styles.subtitle}>Click to Select a Color</p></strong>

     <select className={styles.cameraSelect} onChange={handleDeviceChange} value={selectedDeviceId}>
        {devices.map((device, index) => (
          <option key={device.deviceId} value={device.deviceId}>
            Camera {index + 1}
          </option>
        ))}
      </select>

      {/* Camera Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={styles.cameraView}
        onClick={handleColorSelection}
      ></video>

      {/* Hidden Canvas for Color Processing */}
      <canvas ref={canvasRef} className={styles.hiddenCanvas}></canvas>

      {/* Color Display Box */}
      {selectedColor && (
        <div className={styles.colorDisplayContainer}>
          <p>Selected Color:</p>
          <div
            className={styles.colorDisplay}
            style={{ backgroundColor: selectedColor }}
          ></div>
          <p>{selectedColor}</p>
        </div>
      )}

      {/* Cook Button */}
      <button
        className={styles.cookButton}
        onClick={handleCook}
        disabled={!selectedColor} // Prevents clicking without selecting a color
      >
        COOK
      </button>
    </div>
  );
}
