import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Content, 
  Grid, 
  Column, 
  StructuredListWrapper,
  StructuredListBody,
  StructuredListRow,
  StructuredListCell,
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

  // Check if a question should be displayed based on conditional logic
  const shouldDisplayQuestion = (question) => {
    if (!question.conditionalOn) return true;
    
    const { field, value } = question.conditionalOn;
    return formData[field] === value;
  };

  const handleSave = () => {
    // Ensure isCompleted is a boolean value
    const completionStatus = Boolean(isCompleted);
    
    // If trying to mark as complete, validate required fields
    if (completionStatus) {
      // Only validate fields that should be displayed based on conditional logic
      const requiredFields = taskData.questions.filter(q => q.required && shouldDisplayQuestion(q));
      const missingFields = requiredFields.filter(q => {
        const value = formData[q.id];
        // For repeatable groups, check if array has required instances
        if (q.type === 'repeatable-group') {
          const minInstances = q.minInstances || 0;
          if (!Array.isArray(value)) return minInstances > 0;
          return value.length < minInstances;
        }
        // For arrays (multiselect), check if empty
        if (Array.isArray(value)) {
          return value.length === 0;
        }
        // For other types, check if empty or falsy
        return !value || value === '';
      });
      
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
    
    // Clean form data to ensure only primitive values and arrays are saved
    const cleanFormData = {};
    Object.keys(formData).forEach(key => {
      const value = formData[key];
      // Save primitive values (string, number, boolean) and arrays (including arrays of objects)
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        cleanFormData[key] = value;
      } else if (Array.isArray(value)) {
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
    
    // Handle repeatable groups
    if (question.type === 'repeatable-group') {
      if (!Array.isArray(value) || value.length === 0) {
        if (question.required) {
          return (
            <Link 
              onClick={() => navigate(`/case/${caseId}/tasks/${stageId}/${taskId}/edit?question=${question.id}`)}
              style={{ cursor: 'pointer' }}
            >
              Add {question.label.toLowerCase()}
            </Link>
          );
        } else {
          return <span style={{ color: 'var(--cds-text-secondary)' }}>No entries added</span>;
        }
      }
      
      // Display all instances of the repeatable group
      return (
        <div>
          {value.map((instance, index) => (
            <div key={index} style={{ 
              marginBottom: '1rem', 
              paddingBottom: '1rem',
              borderBottom: index < value.length - 1 ? '1px solid var(--cds-border-subtle)' : 'none'
            }}>
              <h5 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                {question.label} {index + 1}
              </h5>
              {question.questions.map(subQuestion => {
                const subValue = instance[subQuestion.id];
                const displayValue = formatSubQuestionValue(subQuestion, subValue);
                
                return (
                  <div key={subQuestion.id} style={{ marginBottom: '0.5rem' }}>
                    <strong style={{ fontSize: '0.875rem' }}>{subQuestion.label}:</strong>{' '}
                    <span style={{ fontSize: '0.875rem' }}>{displayValue}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      );
    }
    
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
      case 'time':
        // Display time value as-is (should be in HH:MM AM/PM format)
        return value;
      case 'multiselect':
        // Handle array values from FilterableMultiSelect
        if (Array.isArray(value) && value.length > 0) {
          // Map each value to its corresponding label
          const selectedLabels = value.map(val => {
            const selectedOption = question.options?.find(opt => opt.value === val);
            return selectedOption ? selectedOption.label : val;
          });
          
          // Display each label on a new line
          return (
            <div style={{ 
              whiteSpace: 'pre-wrap', 
              wordWrap: 'break-word',
              lineHeight: '1.5'
            }}>
              {selectedLabels.join('\n')}
            </div>
          );
        } else if (Array.isArray(value) && value.length === 0) {
          return <span style={{ color: 'var(--cds-text-secondary)' }}>None selected</span>;
        }
        return value;
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

  // Helper function to format sub-question values in repeatable groups
  const formatSubQuestionValue = (subQuestion, value) => {
    if (!value || value === '') {
      return <span style={{ color: 'var(--cds-text-secondary)' }}>Not provided</span>;
    }
    
    switch (subQuestion.type) {
      case 'select':
        const selectedOption = subQuestion.options?.find(opt => opt.value === value);
        return selectedOption ? selectedOption.label : value;
      case 'textarea':
        return (
          <div style={{ 
            whiteSpace: 'pre-wrap', 
            wordWrap: 'break-word',
            maxWidth: '100%',
            lineHeight: '1.5',
            marginTop: '0.25rem'
          }}>
            {value}
          </div>
        );
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
      <Theme theme="white" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
                lowContrast
                style={{ marginBottom: '1rem' }}
              />
            )}
            <h2 style={{ fontSize: '1.5rem', margin: '1rem 0' }}>Check your answers</h2>

            <StructuredListWrapper style={{ marginBottom: '2rem' }}>
              <StructuredListBody>
                {taskData.questions.filter(question => shouldDisplayQuestion(question)).map((question) => (
                  <StructuredListRow key={question.id}>
                    <StructuredListCell style={{ 
                      fontWeight: 600,
                      width: '30%',
                      verticalAlign: 'top',
                      wordWrap: 'break-word',
                      hyphens: 'auto'
                    }}>
                      {question.label}
                      {question.required && (
                        <span style={{ marginLeft: '4px', color: 'var(--cds-support-error)' }}>*</span>
                      )}
                    </StructuredListCell>
                    <StructuredListCell style={{ 
                      verticalAlign: 'top',
                      wordWrap: 'break-word'
                    }}>
                      {getAnswerDisplay(question)}
                    </StructuredListCell>
                    <StructuredListCell style={{ 
                      verticalAlign: 'top',
                      width: 'auto'
                    }}>
                      {(!question.required || (formData[question.id] && formData[question.id] !== '')) && (
                        <Link 
                          onClick={() => handleEditAnswer(question.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          Edit
                        </Link>
                      )}
                    </StructuredListCell>
                  </StructuredListRow>
                ))}
              </StructuredListBody>
            </StructuredListWrapper>

            <Form style={{ marginBottom: '2rem' }}>
              <FormGroup legendText="Task completion" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
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
                Save
              </Button>
            </div>
          </Column>
        </Grid>
      </Content>
    </Theme>
  );
}

export default TaskCheckAnswers;
