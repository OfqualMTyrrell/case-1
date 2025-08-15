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
import casesData from '../cases.json';
import taskConfig from '../data/task-config.json';
import './CaseInformation.css';
import '@carbon/styles/css/styles.css';

function TaskList() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [taskStatuses, setTaskStatuses] = useState({});

  useEffect(() => {
    const foundCase = casesData.find(c => c.CaseID === caseId);
    setCaseData(foundCase);
    
    // Load task statuses from session storage
    const savedStatuses = sessionStorage.getItem(`taskStatuses_${caseId}`);
    if (savedStatuses) {
      setTaskStatuses(JSON.parse(savedStatuses));
    }
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
    navigate(`/case/${caseId}/tasks/${stageId}/${taskId}`);
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
            <Layer>
              <div style={{ background: 'var(--cds-layer)', padding: '1rem', marginTop: '1em', marginBottom: '1rem', paddingTop: '1em' }}>
                <Breadcrumb style={{ marginBottom: '1rem', paddingTop: '0.5em' }}>
                  <BreadcrumbItem href="#" onClick={() => navigate('/cases-v2')}>Cases</BreadcrumbItem>
                  <BreadcrumbItem href="#" onClick={() => navigate(`/case/${caseId}`)}>{caseData.Title}</BreadcrumbItem>
                  <BreadcrumbItem isCurrentPage>Tasks</BreadcrumbItem>
                </Breadcrumb>
                <h1 style={{ fontSize: '1.5rem', margin: '1rem 0' }}>Tasks for {caseData.Title}</h1>
                <ProgressIndicator currentIndex={(() => {
                  const statusFlow = ['Received', 'Triage', 'Review', 'Outcome'];
                  const status = caseData?.Status?.toLowerCase();
                  if (!status) return 0;
                  if (status === 'closed') return 4;
                  if (status === 'outcome') return 3;
                  if (status === 'review') return 2;
                  if (status === 'triage') return 1;
                  if (status === 'received') return 0;
                  return 0;
                })()}>
                  <ProgressStep label="Received" />
                  <ProgressStep label="Triage" />
                  <ProgressStep label="Review" />
                  <ProgressStep label="Outcome" />
                </ProgressIndicator>
              </div>
            </Layer>
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

            <Button 
              style={{ marginTop: '2rem' }} 
              onClick={() => navigate(`/case/${caseId}`)}
            >
              Back to Case Information
            </Button>
          </Column>
        </Grid>
      </Content>
    </Theme>
  );
}

export default TaskList;
