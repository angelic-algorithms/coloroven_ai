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
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === "videoinput");
  
      let frontCamera = null;
      let backCamera = null;
      let otherCameras = [];
      videoDevices.forEach(device => {
        const label = device.label.toLowerCase();
        if ((label.includes("front") || label.includes("selfie")) && !frontCamera) {
          frontCamera = device;
        } else if ((label.includes("back") || label.includes("rear")) && !backCamera) {
          backCamera = device;
        } else {
          otherCameras.push(device); // Store other cameras as they are
        }
      });
  
      // If front & back cameras exist, show only them with labels
      let filteredDevices = [];
      if (frontCamera) filteredDevices.push({ ...frontCamera, customLabel: "Front Camera" });
      if (backCamera) filteredDevices.push({ ...backCamera, customLabel: "Back Camera" });
  
      filteredDevices = [...filteredDevices, ...otherCameras];
  
      setDevices(filteredDevices);
    
      const isMobile = /iPhone|iPad|iPod|Android/.test(navigator.userAgent);
      const defaultDevice = isMobile ? backCamera || frontCamera || filteredDevices[0] : filteredDevices[0];
  
      if (defaultDevice) {
        setSelectedDeviceId(defaultDevice.deviceId);
        startCamera(defaultDevice.deviceId);
      }  
    } catch (error) {
      console.error("Error accessing camera devices:", error);
      alert("Failed to access cameras.");
    }
  };
  

  const startCamera = async (deviceId) => {
    try {
      const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
      const isMobile = /iPhone|iPad|iPod|Android/.test(navigator.userAgent);

      // If no specific camera was chosen, default to the back camera
      let selectedDevice = devices.find((device) => device.deviceId === deviceId);
      if (!selectedDevice && isMobile) {
        selectedDevice = devices.find((device) => device.customLabel === "Back Camera") || devices[0];
      }

      if (!selectedDevice) {
        console.error("No valid camera found.");
        return;
      }

      setSelectedDeviceId(selectedDevice.deviceId);

      let constraints = {
        video: { deviceId: { exact: selectedDevice.deviceId } },
      };
  
      if (isIOS) {
        constraints.video.facingMode = selectedDevice.customLabel === "Back Camera" ? "environment" : "user";
      }
  
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
    setSelectedDeviceId(e.target.value);
    startCamera(e.target.value);
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
