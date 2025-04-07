import React, { useRef, useState } from "react";
import styled from "styled-components";

const SmartScanner = () => {
  return (
    <div style={{ padding: 20 }}>
      <h2>📱 Smart Scanner</h2>

      <TextScanner />
    </div>
  );
};

const TextScanner = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [text, setText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const startCamera = async () => {
    try {
      setIsCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: "environment" } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      alert("Please allow camera access.");
      setIsCameraOpen(false);
      console.error(err);
    }
  };

  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const dataURL = canvas.toDataURL("image/jpeg");
    setImageSrc(dataURL);

    const stream = video.srcObject;
    if (stream) stream.getTracks().forEach((track) => track.stop());
  };

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const extractText = async () => {
    if (!imageSrc) return;
    setIsProcessing(true);
    setText("");

    try {
      const base64 = imageSrc.replace(/^data:image\/(png|jpeg);base64,/, "");
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=AIzaSyA_C5AAyv3LRliBmdZAzzmbCK5Quev2Jak`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requests: [
              {
                image: { content: base64 },
                features: [{ type: "TEXT_DETECTION" }],
              },
            ],
          }),
        }
      );
      const result = await response.json();
      const detectedText =
        result.responses[0]?.fullTextAnnotation?.text || "No text detected";
      setText(detectedText);
    } catch (err) {
      console.error("OCR error:", err);
      alert("Something went wrong with OCR.");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setImageSrc(null);
    setText("");
    startCamera();
  };

  return (
    <div>
      {!imageSrc && (
        <>
          <button onClick={startCamera}>Open Camera</button>
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            style={{ marginLeft: 10 }}
          />
          {isCameraOpen && (
            <VideoWrapper>
              <video
                ref={videoRef}
                autoPlay
                style={{ width: "100%", maxWidth: 400, marginTop: 10 }}
              />
              <ScannerOverlay />
            </VideoWrapper>
          )}
          <button onClick={captureImage} style={{ marginTop: 10 }}>
            Capture
          </button>
        </>
      )}

      {imageSrc && (
        <>
          <img
            src={imageSrc}
            alt="Captured"
            style={{ width: "100%", maxWidth: 400 }}
          />
          <div style={{ marginTop: 10 }}>
            <button onClick={extractText} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Extract Text"}
            </button>
            <button onClick={reset} style={{ marginLeft: 10 }}>
              Capture New
            </button>
          </div>
        </>
      )}

      {text && (
        <div style={{ marginTop: 20 }}>
          <h3>📝 Extracted Text:</h3>
          <pre style={{ whiteSpace: "pre-wrap" }}>{text}</pre>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default SmartScanner;

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
