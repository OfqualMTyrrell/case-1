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
  Form,
  FormGroup,
  Checkbox,
  OverflowMenu,
  OverflowMenuItem,
  InlineNotification,
  Link
} from '@carbon/react';
import AppHeader from '../components/AppHeader';
import CaseHeader from '../components/CaseHeader';
import casesData from '../cases.json';
import taskConfig from '../data/task-config.json';
import { getDisplayStatus } from '../utils/caseStatusUtils';
import './CaseInformation.css';
import '@carbon/styles/css/styles.css';

function TaskCheckAnswers() {
  const { caseId, stageId, taskId } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [taskData, setTaskData] = useState(null);
  const [stageData, setStageData] = useState(null);
  const [formData, setFormData] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [notification, setNotification] = useState(null);
  const [currentCaseStatus, setCurrentCaseStatus] = useState('');

  useEffect(() => {
    const foundCase = casesData.find(c => c.CaseID === caseId);
    setCaseData(foundCase);
    
    // Set initial case status
    if (foundCase) {
      setCurrentCaseStatus(getDisplayStatus(caseId, foundCase.Status));
    }
    
    // Get case type specific configuration or fall back to default
    const caseTypeConfig = foundCase ? taskConfig.caseTypes[foundCase.CaseType] : null;
    const configToUse = caseTypeConfig || taskConfig.caseTypes.default;
    
    // Find stage and task data
    const stage = configToUse.stages.find(s => s.id === stageId);
    setStageData(stage);
    
    if (stage) {
      const task = stage.tasks.find(t => t.id === taskId);
      setTaskData(task);
    }
    
    // Load saved form data and completion status
    const savedData = sessionStorage.getItem(`taskData_${caseId}_${stageId}_${taskId}`);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setFormData(parsed.formData || {});
      setIsCompleted(parsed.isCompleted || false);
    }
  }, [caseId, stageId, taskId]);

  // Update case status when task statuses change
  useEffect(() => {
    if (caseData) {
      const updatedStatus = getDisplayStatus(caseId, caseData.Status);
      setCurrentCaseStatus(updatedStatus);
    }
  }, [isCompleted, caseId, caseData]);

  // Listen for storage changes to refresh case status
  useEffect(() => {
    const handleStorageChange = () => {
      if (caseData) {
        const updatedStatus = getDisplayStatus(caseId, caseData.Status);
        setCurrentCaseStatus(updatedStatus);
      }
    };

    const handleFocus = () => {
      handleStorageChange();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [caseId, caseData]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [caseId, stageId, taskId]);

  const handleCompletionChange = (event, data) => {
    const checked = event.target.checked;
    setIsCompleted(checked);
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    // Ensure isCompleted is a boolean value
    const completionStatus = Boolean(isCompleted);
    
    // If trying to mark as complete, validate required fields
    if (completionStatus) {
      const requiredFields = taskData.questions.filter(q => q.required);
      const missingFields = requiredFields.filter(q => !formData[q.id] || formData[q.id] === '');
      
      if (missingFields.length > 0) {
        const fieldNames = missingFields.map(f => f.label).join(', ');
        setNotification({
          kind: 'error',
          title: 'Required fields missing',
          subtitle: `Please complete the following required fields: ${fieldNames}`
        });
        return;
      }
    }
    
    // Reset validation errors if saving successfully
    setNotification(null);
    
    // Clean form data to ensure only primitive values are saved
    const cleanFormData = {};
    Object.keys(formData).forEach(key => {
      const value = formData[key];
      // Only save primitive values (string, number, boolean)
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        cleanFormData[key] = value;
      } else if (value && typeof value === 'object' && value.value !== undefined) {
        // Handle objects with value property (like Select components)
        cleanFormData[key] = value.value;
      }
    });

    // Save form data to session storage
    const dataToSave = {
      formData: cleanFormData,
      isCompleted: completionStatus,
      lastSaved: new Date().toISOString()
    };
    
    try {
      sessionStorage.setItem(`taskData_${caseId}_${stageId}_${taskId}`, JSON.stringify(dataToSave));
      
      // Update task status
      const statusKey = `${stageId}_${taskId}`;
      const currentStatuses = JSON.parse(sessionStorage.getItem(`taskStatuses_${caseId}`) || '{}');
      currentStatuses[statusKey] = completionStatus ? 'completed' : 'in-progress';
      sessionStorage.setItem(`taskStatuses_${caseId}`, JSON.stringify(currentStatuses));
      
      // Update case status immediately after task status changes
      if (caseData) {
        const updatedStatus = getDisplayStatus(caseId, caseData.Status);
        setCurrentCaseStatus(updatedStatus);
      }
      
      setHasUnsavedChanges(false);
      
      // Always navigate back to task list after saving
      navigate(`/case/${caseId}/tasks`);
    } catch (error) {
      console.error('Error saving task data:', error);
      // Could add error notification here if needed
    }
  };

  const handleEditAnswer = (questionId) => {
    navigate(`/case/${caseId}/tasks/${stageId}/${taskId}/edit?question=${questionId}`);
  };

  const getAnswerDisplay = (question) => {
    const value = formData[question.id];
    
    if (!value || value === '') {
      if (question.required) {
        return (
          <Link 
            onClick={() => navigate(`/case/${caseId}/tasks/${stageId}/${taskId}/edit?question=${question.id}`)}
            style={{ cursor: 'pointer' }}
          >
            Enter {question.label.toLowerCase()}
          </Link>
        );
      } else {
        return <span style={{ color: 'var(--cds-text-secondary)' }}>Not provided</span>;
      }
    }
    
    // Format the answer based on question type
    switch (question.type) {
      case 'select':
        // Find the option label for the selected value
        const selectedOption = question.options?.find(opt => opt.value === value);
        return selectedOption ? selectedOption.label : value;
      case 'radio':
        // Find the option label for the selected value
        const selectedRadioOption = question.options?.find(opt => opt.value === value);
        return selectedRadioOption ? selectedRadioOption.label : value;
      default:
        return value;
    }
  };

  const getNextTask = () => {
    if (!caseData) return null;
    
    const caseTypeConfig = taskConfig.caseTypes[caseData.CaseType] || taskConfig.caseTypes.default;
    const allStages = caseTypeConfig.stages;
    const currentStageIndex = allStages.findIndex(s => s.id === stageId);
    const currentStage = allStages[currentStageIndex];
    const currentTaskIndex = currentStage.tasks.findIndex(t => t.id === taskId);
    
    // Try next task in current stage
    if (currentTaskIndex < currentStage.tasks.length - 1) {
      return {
        stageId: stageId,
        taskId: currentStage.tasks[currentTaskIndex + 1].id,
        name: currentStage.tasks[currentTaskIndex + 1].name
      };
    }
    
    // Try first task in next stage
    if (currentStageIndex < allStages.length - 1) {
      const nextStage = allStages[currentStageIndex + 1];
      if (nextStage.tasks && nextStage.tasks.length > 0) {
        return {
          stageId: nextStage.id,
          taskId: nextStage.tasks[0].id,
          name: nextStage.tasks[0].name
        };
      }
    }
    
    return null;
  };

  const getPreviousTask = () => {
    if (!caseData) return null;
    
    const caseTypeConfig = taskConfig.caseTypes[caseData.CaseType] || taskConfig.caseTypes.default;
    const allStages = caseTypeConfig.stages;
    const currentStageIndex = allStages.findIndex(s => s.id === stageId);
    const currentStage = allStages[currentStageIndex];
    const currentTaskIndex = currentStage.tasks.findIndex(t => t.id === taskId);
    
    // Try previous task in current stage
    if (currentTaskIndex > 0) {
      return {
        stageId: stageId,
        taskId: currentStage.tasks[currentTaskIndex - 1].id,
        name: currentStage.tasks[currentTaskIndex - 1].name
      };
    }
    
    // Try last task in previous stage
    if (currentStageIndex > 0) {
      const prevStage = allStages[currentStageIndex - 1];
      if (prevStage.tasks && prevStage.tasks.length > 0) {
        const lastTask = prevStage.tasks[prevStage.tasks.length - 1];
        return {
          stageId: prevStage.id,
          taskId: lastTask.id,
          name: lastTask.name
        };
      }
    }
    
    return null;
  };

  if (!caseData || !taskData || !stageData) {
    return (
      <Theme theme="g100" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppHeader />
        <Content style={{ width: '100%', margin: '0 auto', flex: 1, padding: 0, paddingTop: '1em' }}>
          <Grid fullWidth columns={16} mode="narrow" gutter={16}>
            <Column sm={4} md={8} lg={16}>
              <div style={{ background: 'var(--cds-layer)', padding: '1rem', marginTop: '1em' }}>
                <p>Task not found.</p>
                <Button onClick={() => navigate(`/case/${caseId}/tasks`)}>Cancel</Button>
              </div>
            </Column>
          </Grid>
        </Content>
      </Theme>
    );
  }

  const nextTask = getNextTask();
  const previousTask = getPreviousTask();

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
                <ContainedListItem onClick={() => navigate(`/case/${caseId}/tasks`)} className="case-nav-active">Tasks</ContainedListItem>
                <ContainedListItem onClick={() => {}}>Messages</ContainedListItem>
                <ContainedListItem onClick={() => {}}>Timeline</ContainedListItem>
              </ContainedList>
            </div>
            {/* Menu button for nav on small screens */}
            <div className="case-nav-sm" style={{ display: 'none', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <OverflowMenu aria-label="Open navigation menu" flipped>
                <OverflowMenuItem itemText="Case information" onClick={() => navigate(`/case/${caseId}`)} />
                <OverflowMenuItem itemText="Tasks" onClick={() => navigate(`/case/${caseId}/tasks`)} />
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
                  title: caseData?.Title, 
                  path: `/case/${caseId}` 
                },
                { 
                  title: 'Tasks', 
                  path: `/case/${caseId}/tasks` 
                },
                { 
                  title: taskData?.name, 
                  path: `/case/${caseId}/tasks/${stageId}/${taskId}` 
                }
              ]}
              currentPageTitle="Check your answers"
              currentCaseStatus={currentCaseStatus}
            />
          </Column>
          <Column sm={4} md={8} lg={8} className="cds--lg:col-start-4">
            {notification && (
              <InlineNotification
                kind={notification.kind}
                title={notification.title}
                subtitle={notification.subtitle}
                onCloseButtonClick={() => setNotification(null)}
                style={{ marginBottom: '1rem' }}
              />
            )}
            <h2 style={{ fontSize: '1.5rem', margin: '1rem 0' }}>Check your answers</h2>

            <ContainedList style={{ marginBottom: '2rem' }}>
              {taskData.questions.map((question) => (
                <ContainedListItem key={question.id}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    width: '100%',
                    gap: '1rem'
                  }}>
                    <div style={{ flex: '0 0 30%', minWidth: 0 }}>
                      <strong>{question.label}</strong>
                      {question.required && (
                        <span style={{ marginLeft: '4px' }}>*</span>
                      )}
                    </div>
                    <div style={{ flex: '1', minWidth: 0 }}>
                      {getAnswerDisplay(question)}
                    </div>
                    <div style={{ flex: '0 0 auto' }}>
                      {(!question.required || (formData[question.id] && formData[question.id] !== '')) && (
                        <Link 
                          onClick={() => handleEditAnswer(question.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          Edit
                        </Link>
                      )}
                    </div>
                  </div>
                </ContainedListItem>
              ))}
            </ContainedList>

            <Form style={{ marginBottom: '2rem' }}>
              <FormGroup style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                <Checkbox
                  id="task-completion"
                  labelText="Have you completed this task?"
                  checked={isCompleted}
                  onChange={handleCompletionChange}
                />
              </FormGroup>
            </Form>

            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              marginBottom: '2rem',
              flexWrap: 'wrap'
            }}>
              <Button
                kind="primary"
                size="lg"
                onClick={handleSave}
              >
                Save and continue
              </Button>
              
              <Button
                kind="secondary"
                size="lg"
                onClick={() => navigate(`/case/${caseId}/tasks/${stageId}/${taskId}`)}
              >
                Back
              </Button>
            </div>

            {/* Task navigation */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginTop: '2rem',
              padding: '1rem',
              background: 'var(--cds-layer-accent)',
              borderRadius: '4px'
            }}>
              <div>
                {previousTask ? (
                  <Button
                    kind="ghost"
                    size="sm"
                    onClick={() => navigate(`/case/${caseId}/tasks/${previousTask.stageId}/${previousTask.taskId}`)}
                  >
                    ← Previous: {previousTask.name}
                  </Button>
                ) : (
                  <span style={{ color: 'var(--cds-text-disabled)' }}>← Previous task</span>
                )}
              </div>
              
              <div>
                {nextTask ? (
                  <Button
                    kind="ghost"
                    size="sm"
                    onClick={() => navigate(`/case/${caseId}/tasks/${nextTask.stageId}/${nextTask.taskId}`)}
                  >
                    Next: {nextTask.name} →
                  </Button>
                ) : (
                  <span style={{ color: 'var(--cds-text-disabled)' }}>Next task →</span>
                )}
              </div>
            </div>
          </Column>
        </Grid>
      </Content>
    </Theme>
  );
}

export default TaskCheckAnswers;
