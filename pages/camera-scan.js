import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useDrag } from '@use-gesture/react';
import styles from '../styles/CameraScan.module.css';

export default function CameraScan() {
  const router = useRouter();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [colorMagnifier, setColorMagnifier] = useState(null); // For magnified color effect

  useEffect(() => {
    getCameraDevices();
    return () => stopCamera();
  }, []);

  const getCameraDevices = async () => {
    try {
      // ✅ Request camera permission first (ensures MacBook & Safari show device labels)
      await navigator.mediaDevices.getUserMedia({ video: true });
  
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === "videoinput");
  
      if (videoDevices.length === 0) {
        console.error("No video devices found.");
        alert("No cameras detected.");
        return;
      }
  
      let frontCamera = null;
      let backCamera = null;
      let otherCameras = [];
  
      videoDevices.forEach(device => {
        const label = device.label.toLowerCase();
        if (label.includes("front") || label.includes("selfie")) {
          frontCamera = device;
        } else if (label.includes("back") || label.includes("rear")) {
          backCamera = device;
        } else {
          otherCameras.push(device);
        }
      });
  
      // Create labeled device list
      let filteredDevices = [];
      if (frontCamera) filteredDevices.push({ ...frontCamera, customLabel: "Front Camera" });
      if (backCamera) filteredDevices.push({ ...backCamera, customLabel: "Back Camera" });
  
      // If no front/back cameras, use available cameras with original labels
      if (filteredDevices.length === 0) {
        filteredDevices = otherCameras.map(device => ({
          ...device,
          customLabel: device.label || "Default Camera",
        }));
      }
  
      setDevices(filteredDevices);
  
      // ✅ Force the **front camera** as the default
      const defaultCameraMode = "user"; // Always start with the front camera
      setSelectedDeviceId(frontCamera?.deviceId || filteredDevices[0]?.deviceId);
      startCamera(defaultCameraMode); // Now using `facingMode: "user"`
  
    } catch (error) {
      console.error("Error accessing camera devices:", error);
      alert("Failed to access cameras. Please allow camera permissions.");
    }
  };
  
  const startCamera = async (facingMode) => {
    try {
      const constraints = {
        video: { facingMode: facingMode }, // Now always starts with "user"
      };
  
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to start the camera.");
    }
  };
  

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleDeviceChange = (e) => {
    const selectedId = e.target.value;
    const selectedCamera = devices.find(device => device.deviceId === selectedId);
    
    if (selectedCamera) {
      setSelectedDeviceId(selectedId);
      startCamera(selectedId, selectedCamera.customLabel); // ✅ Now updates label properly
    }
  };

  const handleColorSelection = (event) => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const rect = video.getBoundingClientRect();
    const scaleX = video.videoWidth / rect.width;
    const scaleY = video.videoHeight / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    const pixelData = ctx.getImageData(x, y, 1, 1).data;
    const hexColor = `#${pixelData[0].toString(16).padStart(2, "0")}${pixelData[1].toString(16).padStart(2, "0")}${pixelData[2].toString(16).padStart(2, "0")}`;

    setSelectedColor(hexColor);

    // Show magnifier with selected color
    setColorMagnifier({
      color: hexColor,
      x: event.pageX,
      y: event.pageY
    });
    // // Hide magnifier after 1 second
    // setTimeout(() => setColorMagnifier(null), 1000);
  };

  const bind = useDrag(({ event }) => handleColorSelection(event));

  const handlePointerDown = (event) => {
    handleColorSelection(event);
  };

  const handleCook = () => {
    if (selectedColor) {
      router.push(`/color-schemes?color=${encodeURIComponent(selectedColor)}&source=camera-scan`);
    } else {
      alert("Please select a color first.");
    }
  };

  return (
    <div className={styles.container}>
      {/* TOP BAR */}
      <div className={styles.topBar}>
        <div className={styles.backButtonContainer}>
          <Link href="/">
            <button className={styles.backButtonText}>← BACK</button>
          </Link>
        </div>

       {/* Camera Selector - Right */}
        <div className={styles.cameraSelectContainer}>
          <label className={styles.cameraLabel}>Select a Camera:</label>
          <select className={styles.cameraSelect} onChange={handleDeviceChange} value={selectedDeviceId}>
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.customLabel}
              </option>
            ))}
          </select>
        </div>
      </div>

      <h1 className={styles.title}>CAMERA SCAN</h1>

      <strong><p className={styles.subtitle}>Drag your finger or cursor to select a color</p></strong>

      <div className={styles.videoContainer} {...bind()} onPointerDown={handlePointerDown}>
        <video ref={videoRef} autoPlay playsInline className={styles.cameraView} />
      </div>

      <canvas ref={canvasRef} className={styles.hiddenCanvas}></canvas>
      
      {/* Color Display Box */}
      {selectedColor && (
        <div className={styles.colorDisplayContainer}>
          <strong><p>Selected Color:</p></strong>
          <div
            className={styles.colorDisplay}
            style={{ backgroundColor: selectedColor }}
          ></div>
          <p>{selectedColor}</p>
        </div>
      )}

      {/* Magnifier Effect */}
      {colorMagnifier && (
        <div
          className={styles.colorMagnifier}
          style={{
            left: `${colorMagnifier.x}px`,
            top: `${colorMagnifier.y}px`,
            backgroundColor: colorMagnifier.color,
          }}
        ></div>
      )}

      <button className={styles.cookButton} onClick={handleCook} disabled={!selectedColor}>
        COOK
      </button>
    </div>
  );
}
