import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Content, 
  Grid, 
  Column, 
  ContainedList, 
  ContainedListItem, 
  Theme, 
  Button, 
  Breadcrumb, 
  BreadcrumbItem, 
  ProgressIndicator, 
  ProgressStep, 
  Tag,
  Layer,
  OverflowMenu,
  OverflowMenuItem
} from '@carbon/react';
import AppHeader from '../components/AppHeader';
import CaseHeader from '../components/CaseHeader';
import casesData from '../cases.json';
import taskConfig from '../data/task-config.json';
import { getDisplayStatus } from '../utils/caseStatusUtils';
import './CaseInformation.css';
import '@carbon/styles/css/styles.css';

function TaskList() {
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

  const getStatusTag = (status) => {
    switch (status) {
      case 'completed':
        return <span style={{ fontWeight: 600, color: 'var(--cds-text-primary)' }}>Completed</span>;
      case 'in-progress':
        return <Tag type="blue" size="md">In progress</Tag>;
      case 'not-started':
      default:
        return <Tag type="gray" size="md">Not started</Tag>;
    }
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

  const getStageProgress = (stage) => {
    const tasks = stage.tasks || [];
    const completedTasks = tasks.filter(task => 
      getTaskStatus(stage.id, task.id) === 'completed'
    ).length;
    return { completed: completedTasks, total: tasks.length };
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
      <Theme theme="g100" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
    <Theme theme="g100" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <Content style={{ width: '100%', margin: '0 auto', flex: 1, padding: 0, paddingTop: '1em' }}>
        <Grid fullWidth columns={16} mode="narrow" gutter={16}>
          <Column sm={4} md={4} lg={3}>
            {/* Left nav: hidden on small screens, visible on md/lg */}
            <div style={{ position: 'sticky', top: '2rem', zIndex: 1 }} className="case-nav-list case-nav-lg">
              <ContainedList kind="interactive" style={{ marginTop: '2rem' }}>
                <ContainedListItem onClick={() => navigate(`/case/${caseId}`)}>Case information</ContainedListItem>
                <ContainedListItem onClick={() => {}} className="case-nav-active">Tasks</ContainedListItem>
                <ContainedListItem onClick={() => {}}>Messages</ContainedListItem>
                <ContainedListItem onClick={() => {}}>Timeline</ContainedListItem>
              </ContainedList>
            </div>
            {/* Menu button for nav on small screens */}
            <div className="case-nav-sm" style={{ display: 'none', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <OverflowMenu aria-label="Open navigation menu" flipped>
                <OverflowMenuItem itemText="Case information" onClick={() => navigate(`/case/${caseId}`)} />
                <OverflowMenuItem itemText="Tasks" onClick={() => {}} />
                <OverflowMenuItem itemText="Messages" onClick={() => {}} />
                <OverflowMenuItem itemText="Timeline" onClick={() => {}} />
              </OverflowMenu>
            </div>
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
              currentPageTitle="Tasks"
              currentCaseStatus={currentCaseStatus}
            />
          </Column>
          <Column sm={4} md={8} lg={8} className="cds--lg:col-start-4">
            {/* Task stages */}
            {taskConfigToUse.stages.map(stage => {
              const stageProgress = getStageProgress(stage);
              return (
                <div key={stage.id} style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.25rem', margin: 0, marginRight: '1rem' }}>
                      {stage.name}
                    </h2>
                    <Tag type="outline" size="md">
                      {stageProgress.completed} of {stageProgress.total} completed
                    </Tag>
                  </div>
                  <ContainedList kind="interactive">
                    {stage.tasks.map(task => {
                      const status = getTaskStatus(stage.id, task.id);
                      return (
                        <ContainedListItem 
                          key={task.id}
                          onClick={() => handleTaskClick(stage.id, task.id)}
                          style={{ cursor: 'pointer' }}
                          aria-label={`${task.name} - ${status.replace('-', ' ')}`}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <span style={{ flexGrow: 1, textAlign: 'left' }}>{task.name}</span>
                            <div style={{ marginLeft: '1rem' }}>
                              {getStatusTag(status)}
                            </div>
                          </div>
                        </ContainedListItem>
                      );
                    })}
                  </ContainedList>
                </div>
              );
            })}


          </Column>
        </Grid>
      </Content>
    </Theme>
  );
}

export default TaskList;
