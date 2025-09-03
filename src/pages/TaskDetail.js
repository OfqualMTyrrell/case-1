import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Content, 
  Grid, 
  Column, 
  Theme, 
  Button, 
  Form,
  FormGroup,
  TextInput,
  TextArea,
  Select,
  SelectItem,
  RadioButton,
  RadioButtonGroup,
  DatePicker,
  DatePickerInput,
  InlineNotification
} from '@carbon/react';
import AppHeader from '../components/AppHeader';
import CaseHeader from '../components/CaseHeader';
import CaseNavigation from '../components/CaseNavigation';
import casesData from '../cases.json';
import taskConfig from '../data/task-config.json';
import { getDisplayStatus } from '../utils/caseStatusUtils';
import './CaseInformation.css';
import '@carbon/styles/css/styles.css';

function TaskDetail() {
  const { caseId, stageId, taskId } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [taskData, setTaskData] = useState(null);
  const [stageData, setStageData] = useState(null);
  const [formData, setFormData] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [notification, setNotification] = useState(null);
  const [currentCaseStatus, setCurrentCaseStatus] = useState('');

  // Check if we're in edit mode (coming from check answers page)
  const urlParams = new URLSearchParams(window.location.search);
  const isEditMode = urlParams.has('question');
  const editQuestionId = urlParams.get('question');

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
    }
  }, [caseId, stageId, taskId, isEditMode, editQuestionId]);

  // Update case status when task statuses change
  useEffect(() => {
    if (caseData) {
      const updatedStatus = getDisplayStatus(caseId, caseData.Status);
      setCurrentCaseStatus(updatedStatus);
    }
  }, [caseId, caseData]);

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

  const handleInputChange = (questionId, value) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    // Reset validation errors if saving successfully
    setNotification(null);
    
    // Clean form data to ensure only primitive values are saved
    const cleanFormData = {};
    Object.keys(formData).forEach(key => {
      const value = formData[key];
      // Only save primitive values (string, number, boolean)
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        cleanFormData[key] = value;
      }
    });

    // Load existing saved data to preserve completion status
    const existingSavedData = sessionStorage.getItem(`taskData_${caseId}_${stageId}_${taskId}`);
    let existingData = {};
    if (existingSavedData) {
      existingData = JSON.parse(existingSavedData);
    }

    // Save form data to session storage
    const dataToSave = {
      formData: cleanFormData,
      isCompleted: existingData.isCompleted || false,
      lastSaved: new Date().toISOString()
    };
    
    console.log('Saving form data:', cleanFormData);
    
    try {
      sessionStorage.setItem(`taskData_${caseId}_${stageId}_${taskId}`, JSON.stringify(dataToSave));
      
      // Update task status to in-progress if there's any data
      const statusKey = `${stageId}_${taskId}`;
      const currentStatuses = JSON.parse(sessionStorage.getItem(`taskStatuses_${caseId}`) || '{}');
      if (Object.keys(cleanFormData).length > 0) {
        currentStatuses[statusKey] = existingData.isCompleted ? 'completed' : 'in-progress';
        sessionStorage.setItem(`taskStatuses_${caseId}`, JSON.stringify(currentStatuses));
        
        // Update case status immediately after task status changes
        if (caseData) {
          const updatedStatus = getDisplayStatus(caseId, caseData.Status);
          setCurrentCaseStatus(updatedStatus);
        }
      }
      
      setHasUnsavedChanges(false);
      
      // Navigate immediately - no delay needed
      if (isEditMode) {
        // If in edit mode, go back to check answers
        navigate(`/case/${caseId}/tasks/${stageId}/${taskId}/check`);
      } else {
        // If not in edit mode, go to check answers
        navigate(`/case/${caseId}/tasks/${stageId}/${taskId}/check`);
      }
    } catch (error) {
      console.error('Error saving task data:', error);
      // Could add error notification here if needed
    }
  };

  const handleSaveOnly = () => {
    // Reset validation errors if saving successfully
    setNotification(null);
    
    // Clean form data to ensure only primitive values are saved
    const cleanFormData = {};
    Object.keys(formData).forEach(key => {
      const value = formData[key];
      // Only save primitive values (string, number, boolean)
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        cleanFormData[key] = value;
      }
    });

    // Load existing saved data to preserve completion status
    const existingSavedData = sessionStorage.getItem(`taskData_${caseId}_${stageId}_${taskId}`);
    let existingData = {};
    if (existingSavedData) {
      existingData = JSON.parse(existingSavedData);
    }

    // Save form data to session storage
    const dataToSave = {
      formData: cleanFormData,
      isCompleted: existingData.isCompleted || false,
      lastSaved: new Date().toISOString()
    };
    
    console.log('Saving form data (no navigation):', cleanFormData);
    
    try {
      sessionStorage.setItem(`taskData_${caseId}_${stageId}_${taskId}`, JSON.stringify(dataToSave));
      
      // Update task status to in-progress if there's any data
      const statusKey = `${stageId}_${taskId}`;
      const currentStatuses = JSON.parse(sessionStorage.getItem(`taskStatuses_${caseId}`) || '{}');
      if (Object.keys(cleanFormData).length > 0) {
        currentStatuses[statusKey] = existingData.isCompleted ? 'completed' : 'in-progress';
        sessionStorage.setItem(`taskStatuses_${caseId}`, JSON.stringify(currentStatuses));
        
        // Update case status immediately after task status changes
        if (caseData) {
          const updatedStatus = getDisplayStatus(caseId, caseData.Status);
          setCurrentCaseStatus(updatedStatus);
        }
      }
      
      setHasUnsavedChanges(false);
      
      // Show success notification instead of navigating
      setNotification({
        kind: 'success',
        title: 'Saved',
        subtitle: 'Your progress has been saved successfully.'
      });
      
      // Auto-hide notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
      
    } catch (error) {
      console.error('Error saving task data:', error);
      setNotification({
        kind: 'error',
        title: 'Save failed',
        subtitle: 'There was an error saving your progress. Please try again.'
      });
    }
  };

  const renderQuestion = (question) => {
    // Get the saved value, ensuring it's properly formatted
    let value = formData[question.id];
    
    // Handle different value types and ensure they're strings for form inputs
    if (value === null || value === undefined) {
      value = '';
    } else if (typeof value === 'object' && value.value !== undefined) {
      // Handle cases where Carbon components might save objects
      value = value.value;
    } else {
      // Ensure value is a string
      value = String(value);
    }
    
    switch (question.type) {
      case 'text':
        return (
          <TextInput
            id={question.id}
            labelText={question.label}
            placeholder={question.placeholder || ''}
            value={value}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            size="lg"
            autoFocus={isEditMode && editQuestionId === question.id}
          />
        );
      
      case 'textarea':
        return (
          <TextArea
            id={question.id}
            labelText={question.label}
            placeholder={question.placeholder || ''}
            value={value}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            rows={question.rows || 4}
            autoFocus={isEditMode && editQuestionId === question.id}
          />
        );
      
      case 'select':
        return (
          <Select
            id={question.id}
            labelText={question.label}
            value={value}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            size="lg"
          >
            <SelectItem value="" text="Please select an option" />
            {question.options.map(option => (
              <SelectItem
                key={option.value}
                value={option.value}
                text={option.label}
              />
            ))}
          </Select>
        );
      
      case 'radio':
        return (
          <RadioButtonGroup
            key={`${question.id}_${value}`} // Force re-render when value changes
            legendText={question.label}
            name={question.id}
            defaultSelected={value}
            onChange={(selectedValue) => handleInputChange(question.id, selectedValue)}
          >
            {question.options.map(option => (
              <RadioButton
                key={option.value}
                labelText={option.label}
                value={option.value}
                id={`${question.id}_${option.value}`}
              />
            ))}
          </RadioButtonGroup>
        );
      
      case 'date':
        // Convert stored YYYY-MM-DD string back to Date object for DatePicker
        let datePickerValue = '';
        if (value && typeof value === 'string') {
          try {
            const dateObj = new Date(value);
            if (!isNaN(dateObj.getTime())) {
              datePickerValue = [dateObj]; // DatePicker expects array of Date objects
            }
          } catch (error) {
            console.error('Error converting date value:', error);
          }
        }
        
        return (
          <DatePicker
            datePickerType="single"
            dateFormat="d/m/Y"
            value={datePickerValue}
            onChange={(dates) => {
              let dateValue = '';
              if (dates && dates.length > 0 && dates[0]) {
                // Convert Date object to YYYY-MM-DD string for storage
                const date = dates[0];
                if (date instanceof Date) {
                  dateValue = date.toISOString().split('T')[0]; // YYYY-MM-DD format
                } else {
                  dateValue = date;
                }
              }
              handleInputChange(question.id, dateValue);
            }}
          >
            <DatePickerInput
              id={question.id}
              labelText={question.label}
              placeholder="DD/MM/YYYY"
              size="lg"
              autoFocus={isEditMode && editQuestionId === question.id}
            />
          </DatePicker>
        );
      
      default:
        return null;
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
      if (nextStage.tasks.length > 0) {
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
      if (prevStage.tasks.length > 0) {
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
                  title: caseData.Title, 
                  path: `/case/${caseId}` 
                },
                { 
                  title: 'Tasks', 
                  path: `/case/${caseId}/tasks` 
                }
              ]}
              currentPageTitle={taskData?.name}
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
            <h2 style={{ fontSize: '1rem', margin: '1rem 0' }}>{taskData.name}</h2>
            <Form style={{ marginBottom: '2rem' }}>
              {taskData.questions.map((question, index) => (
                <FormGroup key={question.id} style={{ marginBottom: '1.5rem' }}>
                  {renderQuestion(question)}
                </FormGroup>
              ))}
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
                Cancel
              </Button>
              
              <Button
                kind="tertiary"
                size="lg"
                onClick={handleSaveOnly}
              >
                Save
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

export default TaskDetail;
