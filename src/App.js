import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalTheme } from '@carbon/react';
import CaseList from './pages/CaseList';
import CaseInformation from './pages/CaseInformation';
import CaseListV2 from './pages/CaseListV2';
import TaskList from './pages/TaskList';
import TaskListStructuredDemo from './pages/TaskListStructuredDemo';
import TaskDetail from './pages/TaskDetail';
import TaskCheckAnswers from './pages/TaskCheckAnswers';
import RecordCaseNote from './pages/RecordCaseNote';
import CaseMessages from './pages/CaseMessages';
import MessageReply from './pages/MessageReply';
import MessageCompose from './pages/MessageCompose';
import AdminDataSeeding from './pages/AdminDataSeeding';
import History from './pages/History';
import AddCaseNote from './pages/AddCaseNote';
import Dashboard from './pages/Dashboard';
import TeamDashboard from './pages/TeamDashboard';
import RegulatedOrganisations from './pages/RegulatedOrganisations';
import ProspectiveOrganisations from './pages/ProspectiveOrganisations';
import SubjectMatterSpecialists from './pages/SubjectMatterSpecialists';
import OrganisationInformation from './pages/OrganisationInformation';
import OrganisationCases from './pages/OrganisationCases';
import OrganisationMessages from './pages/OrganisationMessages';
import OrganisationMessageReplyRedirect from './pages/OrganisationMessageReplyRedirect';
import OrganisationConditions from './pages/OrganisationConditions';
import OrganisationActivity from './pages/OrganisationActivity';
import OrganisationScope from './pages/OrganisationScope';
import OrganisationQualifications from './pages/OrganisationQualifications';
import OrganisationQualificationDetail from './pages/OrganisationQualificationDetail';
import OrganisationRisks from './pages/OrganisationRisks';
import OrganisationRiskDetail from './pages/OrganisationRiskDetail';
import OrganisationUnits from './pages/OrganisationUnits';
import OrganisationUsers from './pages/OrganisationUsers';
import { loadSeededDataIfEmpty } from './utils/seededDataLoader';
import GraphPage from './pages/GraphPage';
import '@carbon/styles/css/styles.css';
import './App.css';
import Footer from './components/Footer';

function App() {
  useEffect(() => {
    // Load seeded data on app startup if session storage is empty
    loadSeededDataIfEmpty();
    
    // Set the theme attribute on the document root for portaled components
    document.documentElement.setAttribute('data-carbon-theme', 'white');
    
    // Also add the theme class to the document root
    document.documentElement.classList.add('cds--white');
  }, []);

  return (
    <GlobalTheme theme="white">
      <div className="App">
        <Router>
          <Routes>
            <Route path="/cases" element={<CaseList />} />
            <Route path="/case/:id" element={<CaseInformation />} />
            <Route path="/case/:caseId/record-note" element={<RecordCaseNote />} />
            <Route path="/case/:caseId/history" element={<History />} />
            <Route path="/case/:caseId/add-note" element={<AddCaseNote />} />
            <Route path="/case/:caseId/messages" element={<CaseMessages />} />
            <Route path="/case/:caseId/messages/reply/:messageId" element={<MessageReply />} />
            <Route path="/case/:caseId/messages/compose" element={<MessageCompose />} />
            <Route path="/cases-v2" element={<CaseListV2 />} />
            <Route path="/case/:caseId/tasks" element={<TaskList />} />
            <Route path="/case/:caseId/tasks-structured" element={<TaskListStructuredDemo />} />
            <Route path="/case/:caseId/tasks/:stageId/:taskId" element={<TaskDetail />} />
            <Route path="/case/:caseId/tasks/:stageId/:taskId/edit" element={<TaskDetail />} />
            <Route path="/case/:caseId/tasks/:stageId/:taskId/check" element={<TaskCheckAnswers />} />
            <Route path="/profiles/regulated-organisations" element={<RegulatedOrganisations />} />
            <Route path="/profiles/prospective-organisations" element={<ProspectiveOrganisations />} />
            <Route path="/profiles/subject-matter-specialists" element={<SubjectMatterSpecialists />} />
            <Route path="/organisations/:rnNumber" element={<OrganisationInformation />} />
            <Route path="/organisations/:rnNumber/cases" element={<OrganisationCases />} />
            <Route path="/organisations/:rnNumber/messages" element={<OrganisationMessages />} />
            <Route path="/organisations/:rnNumber/messages/reply/:messageId" element={<OrganisationMessageReplyRedirect />} />
            <Route path="/organisations/:rnNumber/activity" element={<OrganisationActivity />} />
            <Route path="/organisations/:rnNumber/conditions" element={<OrganisationConditions />} />
            <Route path="/organisations/:rnNumber/scope" element={<OrganisationScope />} />
            <Route path="/organisations/:rnNumber/qualifications" element={<OrganisationQualifications />} />
            <Route path="/organisations/:rnNumber/qualifications/:accreditationNumber" element={<OrganisationQualificationDetail />} />
            <Route path="/organisations/:rnNumber/risks" element={<OrganisationRisks />} />
            <Route path="/organisations/:rnNumber/risks/:riskId" element={<OrganisationRiskDetail />} />
            <Route path="/organisations/:rnNumber/units" element={<OrganisationUnits />} />
            <Route path="/organisations/:rnNumber/users" element={<OrganisationUsers />} />
            <Route path="/admin/seed-data" element={<AdminDataSeeding />} />
            <Route path="/graph" element={<GraphPage />} />
            <Route path="/" element={<Navigate to="/cases-v2" replace />} />
          </Routes>
        </Router>
        <Footer />
      </div>
    </GlobalTheme>
  );
}

export default App;
