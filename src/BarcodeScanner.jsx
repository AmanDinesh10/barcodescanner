import React, { useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import styled from "styled-components";

const BarcodeScanner = () => {
  const videoRef = useRef(null);
  const streamRef = useRef(null); // save the stream manually
  const codeReaderRef = useRef(new BrowserMultiFormatReader());
  const [scannedValue, setScannedValue] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const startScanner = async () => {
    try {
      setScannedValue("");
      setIsScanning(true);

      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      if (!devices.length) {
        alert("No camera devices found");
        setIsScanning(false);
        return;
      }

      const backCamera =
        devices.find((d) => d.label.toLowerCase().includes("back")) ||
        devices[0];

      // start the camera
      const selectedDeviceId = backCamera.deviceId;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: selectedDeviceId } },
        audio: false,
      });

      videoRef.current.srcObject = stream;
      videoRef.current.setAttribute("playsinline", true); // for iOS
      videoRef.current.play();
      streamRef.current = stream;

      codeReaderRef.current.decodeFromVideoElement(
        videoRef.current,
        (result, err) => {
          if (result) {
            setScannedValue(result.getText());
            stopScanner(); // stop after successful scan
          }
        }
      );
    } catch (err) {
      console.error(err);
      alert("Please allow camera access.");
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    // stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
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
          <VideoWrapper>
            <video ref={videoRef} style={{ width: "100%" }} muted playsInline />
            <ScannerOverlay />
          </VideoWrapper>
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

const ScannerOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 60%;
  height: 40%;
  transform: translate(-50%, -50%);
  border: 2px solid rgba(76, 175, 80, 0.8);
  border-radius: 8px;
  z-index: 10;
  pointer-events: none;
  box-shadow: 0 0 10px 2px rgba(76, 175, 80, 0.5);
`;

const VideoWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
  margin-top: 10px;
`;
