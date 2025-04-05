import React, { useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

const BarcodeScanner = () => {
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const [scannedValue, setScannedValue] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const startScanner = async () => {
    try {
      setIsScanning(true);
      setScannedValue('');
      codeReaderRef.current = new BrowserMultiFormatReader();

      const videoDevices = await BrowserMultiFormatReader.listVideoInputDevices();
      if (!videoDevices.length) {
        alert('No camera found');
        return;
      }

      const backCamera = videoDevices.find(device =>
        device.label.toLowerCase().includes('back')
      ) || videoDevices[0];

      codeReaderRef.current.decodeFromVideoDevice(backCamera.deviceId, videoRef.current, (result, err) => {
        if (result) {
          setScannedValue(result.getText());
          stopScanner(); // auto-close camera after successful scan
        }
      });
    } catch (error) {
      alert('Please allow camera access');
      console.error('Error starting scanner:', error);
    }
  };

  const stopScanner = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    setIsScanning(false);
  };

  const handleNewScan = () => {
    startScanner();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📦 Barcode / QR Code Scanner</h2>

      {!isScanning && (
        <button onClick={startScanner}>
          {scannedValue ? 'Scan New Barcode' : 'Open Camera'}
        </button>
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

      {scannedValue && (
        <div style={{ marginTop: 20 }}>
          <h3>✅ Scanned Result:</h3>
          <pre>{scannedValue}</pre>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
