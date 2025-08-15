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
  Form,
  FormGroup,
  TextInput,
  TextArea,
  Select,
  SelectItem,
  RadioButton,
  RadioButtonGroup,
  Checkbox,
  Layer,
  OverflowMenu,
  OverflowMenuItem,
  InlineNotification
} from '@carbon/react';
import AppHeader from '../components/AppHeader';
import casesData from '../cases.json';
import taskConfig from '../data/task-config.json';
import './CaseInformation.css';
import '@carbon/styles/css/styles.css';

function TaskDetail() {
  const { caseId, stageId, taskId } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [taskData, setTaskData] = useState(null);
  const [stageData, setStageData] = useState(null);
  const [formData, setFormData] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const foundCase = casesData.find(c => c.CaseID === caseId);
    setCaseData(foundCase);
    
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

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [caseId, stageId, taskId]);

  const handleInputChange = (questionId, value) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }));
    setHasUnsavedChanges(true);
    setSaveSuccess(false);
    
    // Clear validation errors when user starts filling out a field
    if (showValidationErrors && value) {
      setShowValidationErrors(false);
      setNotification(null);
    }
  };

  const handleCompletionChange = (event, data) => {
    const checked = event.target.checked;
    console.log('handleCompletionChange called with:', { checked, event, data });
    setIsCompleted(checked);
    setHasUnsavedChanges(true);
    setSaveSuccess(false);
  };

  const handleSave = () => {
    // Ensure isCompleted is a boolean value
    const completionStatus = Boolean(isCompleted);
    console.log('handleSave called, isCompleted:', completionStatus, 'hasUnsavedChanges:', hasUnsavedChanges);
    
    // If trying to mark as complete, validate required fields
    if (completionStatus) {
      const requiredFields = taskData.questions.filter(q => q.required);
      const missingFields = requiredFields.filter(q => !formData[q.id] || formData[q.id] === '');
      
      if (missingFields.length > 0) {
        setShowValidationErrors(true);
        setNotification({
          kind: 'error',
          title: 'Required fields missing',
          subtitle: `Please complete all required fields before marking this task as complete. Missing: ${missingFields.map(f => f.label).join(', ')}`
        });
        console.log('Cannot complete task - missing required fields:', missingFields.map(f => f.label));
        return; // Don't save if required fields are missing when marking as complete
      }
    }
    
    // Reset validation errors if saving successfully
    setShowValidationErrors(false);
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
      
      console.log('Data saved successfully, isCompleted:', completionStatus);
      
      setHasUnsavedChanges(false);
      
      // If task is completed, navigate back to task list immediately
      if (completionStatus) {
        console.log('Navigating back to task list');
        navigate(`/case/${caseId}/tasks`);
      } else {
        // If not completed, show success message
        setSaveSuccess(true);
        // Hide success message after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving task data:', error);
      // Could add error notification here if needed
    }
  };

  const renderQuestion = (question) => {
    const value = formData[question.id] || '';
    const shouldShowError = showValidationErrors && question.required && !value;
    
    switch (question.type) {
      case 'text':
        return (
          <TextInput
            id={question.id}
            labelText={question.label}
            placeholder={question.placeholder || ''}
            value={value}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            invalid={shouldShowError}
            invalidText={question.required ? 'This field is required' : ''}
            size="lg"
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
            invalid={shouldShowError}
            invalidText={question.required ? 'This field is required' : ''}
          />
        );
      
      case 'select':
        return (
          <Select
            id={question.id}
            labelText={question.label}
            value={value}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            invalid={shouldShowError}
            invalidText={question.required ? 'This field is required' : ''}
            size="lg"
          >
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
            legendText={question.label}
            name={question.id}
            value={value}
            onChange={(selectedValue) => handleInputChange(question.id, selectedValue)}
            invalid={shouldShowError}
            invalidText={question.required ? 'This field is required' : ''}
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
                <Button onClick={() => navigate(`/case/${caseId}/tasks`)}>Back to Task List</Button>
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
            <Layer>
              <div style={{ background: 'var(--cds-layer)', padding: '1rem', marginTop: '1em', marginBottom: '1rem', paddingTop: '1em' }}>
                <Breadcrumb style={{ marginBottom: '1rem', paddingTop: '0.5em' }}>
                  <BreadcrumbItem href="#" onClick={() => navigate('/cases-v2')}>Cases</BreadcrumbItem>
                  <BreadcrumbItem href="#" onClick={() => navigate(`/case/${caseId}`)}>{caseData.Title}</BreadcrumbItem>
                  <BreadcrumbItem href="#" onClick={() => navigate(`/case/${caseId}/tasks`)}>Tasks</BreadcrumbItem>
                  <BreadcrumbItem isCurrentPage>{taskData.name}</BreadcrumbItem>
                </Breadcrumb>
                <h1 style={{ fontSize: '1.5rem', margin: '1rem 0' }}>{taskData.name}</h1>
                <p style={{ marginBottom: '1rem', color: 'var(--cds-text-secondary)' }}>
                  {stageData.name} • {caseData.Title}
                </p>
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
            {saveSuccess && (
              <InlineNotification
                kind="success"
                title="Task saved successfully"
                subtitle="Your progress has been saved."
                hideCloseButton
                style={{ marginBottom: '1rem' }}
              />
            )}

            {notification && (
              <InlineNotification
                kind={notification.kind}
                title={notification.title}
                subtitle={notification.subtitle}
                onCloseButtonClick={() => setNotification(null)}
                style={{ marginBottom: '1rem' }}
              />
            )}

            <Form style={{ marginBottom: '2rem' }}>
              {taskData.questions.map((question, index) => (
                <FormGroup key={question.id} style={{ marginBottom: '1.5rem' }}>
                  {renderQuestion(question)}
                </FormGroup>
              ))}
              
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
                Save Task
              </Button>
              
              <Button
                kind="secondary"
                size="lg"
                onClick={() => navigate(`/case/${caseId}/tasks`)}
              >
                Back to Task List
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

export default TaskDetail;
