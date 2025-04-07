// ScannerTabs.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import BarcodeScanner from './BarcodeScanner';
import SmartScanner from './SmartScanner';

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

const Tab = styled.button`
  padding: 10px 20px;
  margin: 0 5px;
  background-color: ${props => (props.active ? '#333' : '#eee')};
  color: ${props => (props.active ? '#fff' : '#000')};
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const TabContent = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const ScannerTabs = () => {
  const [activeTab, setActiveTab] = useState('barcode');

  return (
    <div>
      <TabContainer>
        <Tab active={activeTab === 'barcode'} onClick={() => setActiveTab('barcode')}>
          📦 Barcode Scanner
        </Tab>
        <Tab active={activeTab === 'ocr'} onClick={() => setActiveTab('ocr')}>
          📝 Text Recognition
        </Tab>
      </TabContainer>

      <TabContent>
        {activeTab === 'barcode' ? <BarcodeScanner /> : <SmartScanner />}
      </TabContent>
    </div>
  );
};

export default ScannerTabs;
