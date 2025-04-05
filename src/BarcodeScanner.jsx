import React, { useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

const BarcodeScanner = () => {
  const videoRef = useRef(null);
  const streamRef = useRef(null); // save the stream manually
  const codeReaderRef = useRef(new BrowserMultiFormatReader());
  const [scannedValue, setScannedValue] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const startScanner = async () => {
    try {
      setScannedValue('');
      setIsScanning(true);

      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      if (!devices.length) {
        alert('No camera devices found');
        setIsScanning(false);
        return;
      }

      const backCamera = devices.find(d => d.label.toLowerCase().includes('back')) || devices[0];

      // start the camera
      const selectedDeviceId = backCamera.deviceId;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: selectedDeviceId } },
        audio: false,
      });

      videoRef.current.srcObject = stream;
      videoRef.current.setAttribute('playsinline', true); // for iOS
      videoRef.current.play();
      streamRef.current = stream;

      codeReaderRef.current.decodeFromVideoElement(videoRef.current, (result, err) => {
        if (result) {
          setScannedValue(result.getText());
          stopScanner(); // stop after successful scan
        }
      });

    } catch (err) {
      console.error(err);
      alert('Please allow camera access.');
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    // stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    codeReaderRef.current?.reset?.(); // safety check
    setIsScanning(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📦 QR / Barcode Scanner</h2>

      {!isScanning && !scannedValue && (
        <button onClick={startScanner}>Open Camera</button>
      )}

      {isScanning && (
        <>
          <video
            ref={videoRef}
            style={{ width: '100%', maxWidth: 400, marginTop: 10 }}
            muted
            playsInline
          />
          <button onClick={stopScanner} style={{ marginTop: 10 }}>
            Close Camera
          </button>
        </>
      )}

      {scannedValue && !isScanning && (
        <div style={{ marginTop: 20 }}>
          <h3>✅ Scanned Result:</h3>
          <pre>{scannedValue}</pre>
          <button onClick={startScanner} style={{ marginTop: 10 }}>
            Scan Again
          </button>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
