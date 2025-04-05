import React, { useState } from 'react';
import {QrReader} from 'react-qr-reader';

const CameraScan = () => {
  const [scanResult, setScanResult] = useState(null);
  const [hasCameraAccess, setHasCameraAccess] = useState(false);

  // Function to handle the button click to request camera access
  const handleCameraClick = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraAccess(true);
    } catch (err) {
      alert('Camera access denied. Please enable the camera.');
      setHasCameraAccess(false);
    }
  };

  // Function to handle scanned data
  const handleScan = (data) => {
    if (data) {
      console.log('Scanned Data:', data);
      alert(`Scanned Barcode: ${data}`);
      setScanResult(data);
    }
  };

  // Function to handle errors
  const handleError = (err) => {
    console.error('Error scanning barcode:', err);
  };

  return (
    <div>
      <button onClick={handleCameraClick}>Open Camera</button>

      {hasCameraAccess && (
        <QrReader
          delay={300}
          style={{ width: '100%' }}
          onError={handleError}
          onScan={handleScan}
        />
      )}

      {scanResult && <p>Scanned Value: {scanResult}</p>}
    </div>
  );
};

export default CameraScan;
