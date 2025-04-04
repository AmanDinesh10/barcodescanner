import React, { useRef, useState } from 'react';
import Tesseract from 'tesseract.js';

const OCRScanner = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // 📷 Start Camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('Please allow camera permissions.');
      console.error(err);
    }
  };

  // 📸 Capture from Camera
  const captureFromCamera = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Preprocess image
    preprocessImage(ctx, canvas);
  };

  // 📂 Upload from Device
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        extractText(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 🧠 Preprocess + Extract
  const preprocessImage = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    // Grayscale + threshold
    for (let i = 0; i < pixels.length; i += 4) {
      const avg = 0.3 * pixels[i] + 0.59 * pixels[i + 1] + 0.11 * pixels[i + 2];
      const bin = avg > 150 ? 255 : 0;
      pixels[i] = pixels[i + 1] = pixels[i + 2] = bin;
    }

    ctx.putImageData(imageData, 0, 0);
    const dataURL = canvas.toDataURL('image/png');
    setImageSrc(dataURL);
    extractText(dataURL);
  };

  // 🔍 OCR Extraction
  const extractText = async (imgSrc: string) => {
    setIsProcessing(true);
    try {
      const { data: { text } } = await Tesseract.recognize(imgSrc, 'eng', {
        logger: m => console.log(m),
      });
      setText(text);
      alert(`Extracted Text: ${text}`);
    } catch (err) {
      console.error('OCR error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>📄 OCR Scanner</h2>

      {/* 🔘 Camera Controls */}
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={startCamera}>Start Camera</button>
        <button onClick={captureFromCamera}>Capture from Camera</button>
        <input type="file" accept="image/*" onChange={handleUpload} />
      </div>

      {/* 🎥 Video Preview */}
      <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxWidth: 400 }} />

      {/* 🖼 Canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* 📷 Image Preview */}
      {imageSrc && <img src={imageSrc} alt="Captured" style={{ maxWidth: '100%', marginTop: '1rem' }} />}

      {/* 📝 Extracted Text */}
      {text && (
        <div style={{ marginTop: '1rem' }}>
          <h3>🧾 Recognized Text:</h3>
          <pre>{text}</pre>
        </div>
      )}

      {isProcessing && <p>🔄 Processing...</p>}
    </div>
  );
};

export default OCRScanner;
