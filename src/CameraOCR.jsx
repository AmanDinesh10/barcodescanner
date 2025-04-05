import React, { useRef, useState } from 'react';

const CameraOCR = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Camera access error:', error);
      alert('Please allow camera access.');
    }
  };

  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataURL = canvas.toDataURL('image/jpeg');
    setImageSrc(dataURL);

    // Stop video stream
    const stream = video.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const extractText = async () => {
    if (!imageSrc) return;

    setIsProcessing(true);
    setText('');

    try {
      const base64 = imageSrc.replace(/^data:image\/(png|jpeg);base64,/, '');

      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=AIzaSyA_C5AAyv3LRliBmdZAzzmbCK5Quev2Jak`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              {
                image: {
                  content: base64,
                },
                features: [
                  {
                    type: 'TEXT_DETECTION',
                  },
                ],
              },
            ],
          }),
        }
      );

      const result = await response.json();
      const detectedText =
        result.responses[0]?.fullTextAnnotation?.text || 'No text detected';
      setText(detectedText);
    } catch (error) {
      console.error('OCR error:', error);
      alert('Something went wrong with OCR.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📸 Camera OCR using Google Vision</h2>

      {!imageSrc && (
        <>
          <button onClick={startCamera}>Open Camera</button>
          <video ref={videoRef} autoPlay style={{ width: '100%', maxWidth: 400, marginTop: 10 }} />
          <button onClick={captureImage} style={{ marginTop: 10 }}>
            Capture
          </button>
        </>
      )}

      {imageSrc && (
        <>
          <img src={imageSrc} alt="Captured" style={{ width: '100%', maxWidth: 400 }} />
          <button onClick={extractText} disabled={isProcessing} style={{ marginTop: 10 }}>
            {isProcessing ? 'Processing...' : 'Extract Text'}
          </button>
        </>
      )}

      {text && (
        <div style={{ marginTop: 20 }}>
          <h3>📝 Extracted Text:</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{text}</pre>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default CameraOCR;
