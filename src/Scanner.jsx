import React, { useState } from 'react';
import Tesseract from 'tesseract.js';

const OCRUploader = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [recognizedText, setRecognizedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // 📂 Handle Image Upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setRecognizedText('');
    }
  };

  // 🟢 Perform OCR on Uploaded Image
  const recognizeText = async () => {
    if (!selectedImage) return;
    
    setIsProcessing(true);
    setRecognizedText('');

    try {
      const { data: { text } } = await Tesseract.recognize(selectedImage, 'eng', {
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        logger: (m) => console.log(m),
      });

      console.log("Recognized Text:", text);
      setRecognizedText(text);
      alert(`Recognized Text: ${text}`);
    } catch (err) {
      console.error('OCR Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      {/* 📂 Upload Image */}
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      
      {/* 🟢 Run OCR on Uploaded Image */}
      <button onClick={recognizeText} disabled={!selectedImage || isProcessing}>
        {isProcessing ? 'Processing...' : 'Extract Text'}
      </button>

      {/* Display Uploaded Image */}
      {selectedImage && (
        <div>
          <h3>Uploaded Image:</h3>
          <img src={selectedImage} alt="Uploaded Preview" style={{ width: '100%', maxWidth: '400px' }} />
        </div>
      )}

      {/* Display Extracted Text */}
      {recognizedText && <p>📝 Recognized Text: {recognizedText}</p>}
    </div>
  );
};

export default OCRUploader;
