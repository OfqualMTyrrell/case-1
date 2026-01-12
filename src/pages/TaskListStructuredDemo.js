import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Content, 
  Grid, 
  Column, 
  Theme, 
  Button
} from '@carbon/react';
import AppHeader from '../components/AppHeader';
import CaseHeader from '../components/CaseHeader';
import CaseNavigation from '../components/CaseNavigation';
import TaskListStructured from '../components/TaskListStructured';
import casesData from '../cases.json';
import taskConfig from '../data/task-config.json';
import { getDisplayStatus } from '../utils/caseStatusUtils';
import './CaseInformation.css';

function TaskListStructuredDemo() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [taskStatuses, setTaskStatuses] = useState({});
  const [currentCaseStatus, setCurrentCaseStatus] = useState('');

  useEffect(() => {
    const foundCase = casesData.find(c => c.CaseID === caseId);
    setCaseData(foundCase);
    
    // Load task statuses from session storage
    const savedStatuses = sessionStorage.getItem(`taskStatuses_${caseId}`);
    if (savedStatuses) {
      setTaskStatuses(JSON.parse(savedStatuses));
    }
    
    // Set initial case status
    if (foundCase) {
      setCurrentCaseStatus(getDisplayStatus(caseId, foundCase.Status));
    }
  }, [caseId]);

  // Update case status when task statuses change
  useEffect(() => {
    if (caseData) {
      const updatedStatus = getDisplayStatus(caseId, caseData.Status);
      setCurrentCaseStatus(updatedStatus);
    }
  }, [taskStatuses, caseId, caseData]);

  // Listen for storage changes to refresh task statuses
  useEffect(() => {
    const handleStorageChange = () => {
      const savedStatuses = sessionStorage.getItem(`taskStatuses_${caseId}`);
      if (savedStatuses) {
        setTaskStatuses(JSON.parse(savedStatuses));
      }
    };

    // Listen for focus events (when user returns from task pages)
    const handleFocus = () => {
      handleStorageChange();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [caseId]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [caseId]);

  const getTaskStatus = (stageId, taskId) => {
    const key = `${stageId}_${taskId}`;
    return taskStatuses[key] || 'not-started';
  };

  const handleTaskClick = (stageId, taskId) => {
    const status = getTaskStatus(stageId, taskId);
    
    if (status === 'not-started') {
      // Navigate to the question page (TaskDetail)
      navigate(`/case/${caseId}/tasks/${stageId}/${taskId}`);
    } else {
      // Navigate to the check your answers page
      navigate(`/case/${caseId}/tasks/${stageId}/${taskId}/check`);
    }
  };

  const getTaskConfig = () => {
    // Check if there's a specific configuration for this case type
    const caseTypeConfig = taskConfig.caseTypes[caseData?.CaseType];
    if (caseTypeConfig) {
      return caseTypeConfig;
    }
    // Fall back to default configuration
    return taskConfig.caseTypes.default;
  };

  if (!caseData) {
    return (
      <Theme theme="white" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppHeader />
        <Content style={{ width: '100%', margin: '0 auto', flex: 1, padding: 0, paddingTop: '1em' }}>
          <Grid fullWidth columns={16} mode="narrow" gutter={16}>
            <Column sm={4} md={8} lg={16}>
              <div style={{ background: 'var(--cds-layer)', padding: '1rem', marginTop: '1em' }}>
                <p>Case not found.</p>
                <Button onClick={() => navigate(-1)}>Back to Cases</Button>
              </div>
            </Column>
          </Grid>
        </Content>
      </Theme>
    );
  }

  const taskConfigToUse = getTaskConfig();

  return (
    <Theme theme="white" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <Content style={{ width: '100%', margin: '0 auto', flex: 1, padding: 0, paddingTop: '1em' }}>
        <Grid fullWidth columns={16} mode="narrow" gutter={16}>
          <Column sm={4} md={4} lg={3}>
            <CaseNavigation caseId={caseId} activePage="tasks" />
          </Column>
          <Column sm={4} md={8} lg={13}>
            <CaseHeader 
              caseData={caseData}
              breadcrumbs={[
                { 
                  title: caseData.Title, 
                  path: `/case/${caseId}` 
                }
              ]}
              currentPageTitle="Tasks (Structured List Demo)"
              currentCaseStatus={currentCaseStatus}
            />
          </Column>
          <Column sm={4} md={8} lg={8} className="cds--lg:col-start-4">
            <TaskListStructured 
              stages={taskConfigToUse.stages}
              getTaskStatus={getTaskStatus}
              onTaskClick={handleTaskClick}
            />
          </Column>
        </Grid>
      </Content>
    </Theme>
  );
}

export default TaskListStructuredDemo;
