import React, { useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

const BarcodeScanner = () => {
  const videoRef = useRef(null);
  const [codeReader] = useState(new BrowserMultiFormatReader()); // initialize once
  const [scannedValue, setScannedValue] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const startScanner = async () => {
    try {
      setScannedValue('');
      setIsScanning(true);

      const videoDevices = await BrowserMultiFormatReader.listVideoInputDevices();
      if (!videoDevices.length) {
        alert('No camera found');
        setIsScanning(false);
        return;
      }

      const backCamera = videoDevices.find(device =>
        device.label.toLowerCase().includes('back')
      ) || videoDevices[0];

      // Reset scanner before starting a new scan
      codeReader.reset();

      codeReader.decodeFromVideoDevice(backCamera.deviceId, videoRef.current, (result, err) => {
        if (result) {
          setScannedValue(result.getText());
          stopScanner(); // auto stop after successful scan
        }
      });
    } catch (error) {
      console.error('Camera error:', error);
      alert('Please allow camera access.');
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    try {
      codeReader.reset();
    } catch (e) {
      console.warn('Error while stopping scanner:', e);
    }
    setIsScanning(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📦 Barcode / QR Code Scanner</h2>

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
