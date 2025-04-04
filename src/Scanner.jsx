import React, { useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import Tesseract from 'tesseract.js';

const Scanner = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scannedData, setScannedData] = useState(null);
  const [recognizedText, setRecognizedText] = useState('');
  const [scannerActive, setScannerActive] = useState(false);

  let codeReader = new BrowserMultiFormatReader();

  // Start Barcode/QR Code Scanning
  const startScanner = async () => {
    setScannerActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
        if (result) {
          console.log('Scanned Code:', result.getText());
          alert(`Scanned Code: ${result.getText()}`);
          setScannedData(result.getText());
          stopScanner(); // Stop scanning after detecting a code
        }
        if (err) {
          console.error('Scanning Error:', err);
        }
      });

    } catch (err) {
      console.error('Camera access denied:', err);
      alert("Camera access denied. Please enable camera permissions.");
    }
  };

  // Stop the scanner and close the camera
  const stopScanner = () => {
    setScannerActive(false);
    codeReader.reset();
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  // Capture Image for OCR
  const captureImageForOCR = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      recognizeText(blob);
    });
  };

  // Recognize Text using OCR
  const recognizeText = async (imageBlob) => {
    try {
      const { data: { text } } = await Tesseract.recognize(imageBlob, 'eng');
      console.log("Recognized Text:", text);
      setRecognizedText(text);
      alert(`Recognized Text: ${text}`);
    } catch (err) {
      console.error('OCR Error:', err);
    }
  };

  return (
    <div>
      <button onClick={scannerActive ? stopScanner : startScanner}>
        {scannerActive ? 'Stop Scanner' : 'Open Camera'}
      </button>
      <button onClick={captureImageForOCR}>Recognize Text</button>

      <video ref={videoRef} autoPlay playsInline style={{ width: '100%', display: scannerActive ? 'block' : 'none' }}></video>
      <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="480"></canvas>

      {scannedData && <p>Scanned Code: {scannedData}</p>}
      {recognizedText && <p>Recognized Text: {recognizedText}</p>}
    </div>
  );
};

export default Scanner;
