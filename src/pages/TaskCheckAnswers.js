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
  InlineNotification,
  Link
} from '@carbon/react';
import AppHeader from '../components/AppHeader';
import CaseHeader from '../components/CaseHeader';
import CaseNavigation from '../components/CaseNavigation';
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
      case 'text':
        // For text inputs, preserve line breaks if any
        if (typeof value === 'string' && value.includes('\n')) {
          return (
            <div style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
              {value}
            </div>
          );
        }
        return value;
      case 'textarea':
        // For textarea inputs, always preserve line breaks and formatting
        return (
          <div style={{ 
            whiteSpace: 'pre-wrap', 
            wordWrap: 'break-word',
            maxWidth: '100%',
            lineHeight: '1.5'
          }}>
            {value}
          </div>
        );
      case 'select':
        // Find the option label for the selected value
        const selectedOption = question.options?.find(opt => opt.value === value);
        return selectedOption ? selectedOption.label : value;
      case 'radio':
        // Find the option label for the selected value
        const selectedRadioOption = question.options?.find(opt => opt.value === value);
        return selectedRadioOption ? selectedRadioOption.label : value;
      case 'date':
        // Format date as DD/MM/YYYY
        try {
          if (!value) return value;
          
          // Handle different date formats
          let dateObj;
          if (value instanceof Date) {
            dateObj = value;
          } else if (typeof value === 'string') {
            // Handle YYYY-MM-DD format or other ISO formats
            dateObj = new Date(value);
          } else {
            return value;
          }
          
          if (isNaN(dateObj.getTime())) {
            return value; // Return original if invalid date
          }
          
          return dateObj.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        } catch (error) {
          console.error('Error formatting date:', error);
          return value;
        }
      default:
        // For any other type, check if it's a string with line breaks
        if (typeof value === 'string' && value.includes('\n')) {
          return (
            <div style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
              {value}
            </div>
          );
        }
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
            <CaseNavigation caseId={caseId} activePage="tasks" />
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
              flexWrap: 'wrap',
              justifyContent: 'flex-end'
            }}>
                            
              <Button
                kind="secondary"
                size="lg"
                onClick={() => navigate(-1)}
              >
                Back
              </Button>

              <Button
                kind="primary"
                size="lg"
                onClick={handleSave}
              >
                Save and continue
              </Button>
            </div>
          </Column>
        </Grid>
      </Content>
    </Theme>
  );
}

export default TaskCheckAnswers;
