import React, { useRef, useState } from 'react';
import Tesseract from 'tesseract.js';

const Scanner = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [recognizedText, setRecognizedText] = useState('');
  const [isOcrActive, setIsOcrActive] = useState(false);

  // 🔵 Start Camera for OCR
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

  // 📷 Capture Image for OCR with Preprocessing
  const captureImageForOCR = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsOcrActive(true);

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Draw video frame to canvas
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Convert image to grayscale
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let pixels = imageData.data;
    for (let i = 0; i < pixels.length; i += 4) {
      let gray = 0.3 * pixels[i] + 0.59 * pixels[i + 1] + 0.11 * pixels[i + 2];
      pixels[i] = pixels[i + 1] = pixels[i + 2] = gray > 128 ? 255 : 0; // Apply thresholding
    }
    context.putImageData(imageData, 0, 0);

    // Convert canvas to Blob and send to OCR
    canvas.toBlob((blob) => {
      recognizeText(blob);
    });
  };

  // 🟢 Perform OCR
  const recognizeText = async (imageBlob) => {
    try {
      const { data: { text } } = await Tesseract.recognize(imageBlob, 'eng', {
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        logger: (m) => console.log(m),
      });

      console.log("Recognized Text:", text);
      setRecognizedText(text);
      alert(`Recognized Text: ${text}`);
      setIsOcrActive(false);
    } catch (err) {
      console.error('OCR Error:', err);
      setIsOcrActive(false);
    }
  };

  return (
    <div>
      {/* 🔵 Open Camera */}
      <button onClick={startCamera}>Open Camera</button>

      {/* 🟢 OCR Text Recognition */}
      <button onClick={captureImageForOCR} disabled={isOcrActive}>
        {isOcrActive ? 'Processing...' : 'Recognize Text (OCR)'}
      </button>

      {/* Video Feed for OCR */}
      <video ref={videoRef} autoPlay playsInline style={{ width: '100%' }}></video>
      <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="480"></canvas>

      {/* Display Results */}
      {recognizedText && <p>📝 Recognized Text: {recognizedText}</p>}
    </div>
  );
};

export default Scanner;
