import React, { useRef, useState } from 'react';
import Tesseract from 'tesseract.js';

const OCRScanner = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [recognizedText, setRecognizedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // 🎥 Open Camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      alert("Camera access denied. Please enable camera permissions.");
    }
  };

  // 📸 Capture Image
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Draw the current video frame onto the canvas
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Convert canvas to image URL
    const imageUrl = canvas.toDataURL('image/png');
    setCapturedImage(imageUrl);
  };

  // 🟢 Perform OCR
  const recognizeText = async () => {
    if (!capturedImage) return;

    setIsProcessing(true);

    try {
      const { data: { text } } = await Tesseract.recognize(capturedImage, 'eng', {
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        logger: (m) => console.log(m),
      });

      console.log("Recognized Text:", text);
      setRecognizedText(text);
      alert(`Recognized Text: ${text}`);
    } catch (err) {
      console.error('OCR Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      Capture Image

      {/* 🎥 Open Camera */}
      <button onClick={startCamera}>Open Camera</button>

      {/* 📸 Capture Image */}
      <button onClick={captureImage} disabled={!videoRef.current?.srcObject}>
        Capture Image
      </button>

      {/* 🟢 Run OCR on Captured Image */}
      <button onClick={recognizeText} disabled={!capturedImage || isProcessing}>
        {isProcessing ? 'Processing...' : 'Extract Text'}
      </button>

      {/* Video Feed */}
      <video ref={videoRef} autoPlay playsInline style={{ width: '100%' }}></video>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="480"></canvas>

      {/* Display Captured Image */}
      {capturedImage && (
        <div>
          <h3>Captured Image:</h3>
          <img src={capturedImage} alt="Captured" style={{ width: '100%', maxWidth: '400px' }} />
        </div>
      )}

      {/* Display Extracted Text */}
      {recognizedText && <p>📝 Recognized Text: {recognizedText}</p>}
    </div>
  );
};

export default OCRScanner;
