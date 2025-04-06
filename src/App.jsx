import { useState } from "react";
import "./App.css";
// import CameraOCR from './CameraOCR'
// import Scanner from './Scanner'
import SmartScanner from "./SmartScanner";
// import HtmlQrCode from './HtmlQrCode'
import BarcodeScanner from "./BarcodeScanner";

function App() {
  const [showBarCodeScanner, setShowBarCodeScanner] = useState(true);

  return (
    <>
      <div>
        {/* <Scanner />    */}

        {/* <CameraOCR /> */}
        {/* <SmartScanner /> */}
        {/* <HtmlQrCode /> */}

        <button onClick={() => setShowBarCodeScanner((prev) => !prev)}>
          {!showBarCodeScanner ? "Open BarCodeScanner" : "Open SmartScanner"}
        </button>

        {showBarCodeScanner ? <BarcodeScanner /> : <SmartScanner />}
      </div>
    </>
  );
}

export default App;
