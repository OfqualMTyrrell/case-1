


import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CaseList from './pages/CaseList';
import CaseInformation from './pages/CaseInformation';
import CaseListV2 from './pages/CaseListV2';
import '@carbon/styles/css/styles.css';
import './App.css';

function App() {
  return (
    <div className="cds-theme--g100">
      <Router>
        <Routes>
          <Route path="/cases" element={<CaseList />} />
          <Route path="/case/:id" element={<CaseInformation />} />
          <Route path="/cases-v2" element={<CaseListV2 />} />
          <Route path="/" element={<Navigate to="/cases" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
