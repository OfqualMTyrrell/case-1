


import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Theme } from '@carbon/react';
import CaseList from './pages/CaseList';
import CaseInformation from './pages/CaseInformation';
import CaseListV2 from './pages/CaseListV2';
import TaskList from './pages/TaskList';
import TaskDetail from './pages/TaskDetail';
import TaskCheckAnswers from './pages/TaskCheckAnswers';
import AdminDataSeeding from './pages/AdminDataSeeding';
import { loadSeededDataIfEmpty } from './utils/seededDataLoader';
import '@carbon/styles/css/styles.css';
import './App.css';

function App() {
  useEffect(() => {
    // Load seeded data on app startup if session storage is empty
    loadSeededDataIfEmpty();
  }, []);

  return (
    <Theme theme="g100">
      <div className="App">
        <Router>
          <Routes>
            <Route path="/cases" element={<CaseList />} />
            <Route path="/case/:id" element={<CaseInformation />} />
            <Route path="/cases-v2" element={<CaseListV2 />} />
            <Route path="/case/:caseId/tasks" element={<TaskList />} />
            <Route path="/case/:caseId/tasks/:stageId/:taskId" element={<TaskDetail />} />
            <Route path="/case/:caseId/tasks/:stageId/:taskId/edit" element={<TaskDetail />} />
            <Route path="/case/:caseId/tasks/:stageId/:taskId/check" element={<TaskCheckAnswers />} />
            <Route path="/admin/seed-data" element={<AdminDataSeeding />} />
            <Route path="/" element={<Navigate to="/cases-v2" replace />} />
          </Routes>
        </Router>
      </div>
    </Theme>
  );
}

export default App;
