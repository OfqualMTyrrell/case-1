import casesData from '../cases.json';
import taskConfig from '../data/task-config.json';

/**
 * Calculate dynamic case status based on task completion
 */
export const calculateCaseStatus = (caseId, taskStatuses = {}) => {
  // Find the case data
  const caseData = casesData.find(c => c.CaseID === caseId);
  if (!caseData) return 'Received';
  
  // Get task configuration for this case type
  const caseTypeConfig = taskConfig.caseTypes[caseData.CaseType] || taskConfig.caseTypes.default;
  const stages = caseTypeConfig.stages;
  
  // Check each stage in order
  for (const stage of stages) {
    const stageTaskStatuses = stage.tasks.map(task => 
      taskStatuses[`${stage.id}_${task.id}`] || 'not-started'
    );
    
    // If any task in this stage is not completed, this stage determines the status
    const allCompleted = stageTaskStatuses.every(status => status === 'completed');
    const anyInProgress = stageTaskStatuses.some(status => status === 'in-progress' || status === 'completed');
    
    if (!allCompleted) {
      // Map stage IDs to case statuses
      const stageToStatusMap = {
        'triage': anyInProgress ? 'Triage' : 'Received',
        'review': anyInProgress ? 'Review' : 'Triage', 
        'outcome': anyInProgress ? 'Outcome' : 'Review'
      };
      return stageToStatusMap[stage.id] || 'Received';
    }
  }
  
  // All tasks in all stages are completed
  return 'Closed';
};

/**
 * Get display status - uses dynamic calculation if user has progress, otherwise static
 */
export const getDisplayStatus = (caseId, originalStatus) => {
  // Get task statuses from session storage for this case
  const taskStatusesKey = `taskStatuses_${caseId}`;
  const storedTaskStatuses = sessionStorage.getItem(taskStatusesKey);
  const taskStatuses = storedTaskStatuses ? JSON.parse(storedTaskStatuses) : {};
  
  const hasUserProgress = Object.keys(taskStatuses).length > 0;
  
  if (hasUserProgress) {
    return calculateCaseStatus(caseId, taskStatuses);
  }
  
  // Fall back to static JSON status
  return originalStatus;
};

/**
 * Seed realistic task data based on existing case statuses
 */
export const seedRealisticTaskData = () => {
  casesData.forEach(caseData => {
    const caseTypeConfig = taskConfig.caseTypes[caseData.CaseType] || taskConfig.caseTypes.default;
    const taskStatuses = {};
    const caseStatus = caseData.Status;
    
    // Generate realistic task completion based on case status
    let shouldCompleteStages = [];
    let shouldStartStages = [];
    
    switch (caseStatus) {
      case 'Closed':
        shouldCompleteStages = ['triage', 'review', 'outcome'];
        break;
      case 'Outcome':
        shouldCompleteStages = ['triage', 'review'];
        shouldStartStages = ['outcome'];
        break;
      case 'Review':
        shouldCompleteStages = ['triage'];
        shouldStartStages = ['review'];
        break;
      case 'Triage':
        shouldStartStages = ['triage'];
        break;
      case 'Received':
      default:
        // No tasks started
        break;
    }
    
    // Set task statuses based on stage completion rules
    caseTypeConfig.stages.forEach(stage => {
      stage.tasks.forEach((task, index) => {
        const taskKey = `${stage.id}_${task.id}`;
        
        if (shouldCompleteStages.includes(stage.id)) {
          taskStatuses[taskKey] = 'completed';
        } else if (shouldStartStages.includes(stage.id)) {
          // Make some tasks in-progress, some completed for realism
          if (index === 0) {
            taskStatuses[taskKey] = 'completed';
          } else if (index === 1 && Math.random() > 0.5) {
            taskStatuses[taskKey] = 'in-progress';
          }
        }
      });
    });
    
    // Save task statuses to session storage
    if (Object.keys(taskStatuses).length > 0) {
      sessionStorage.setItem(`taskStatuses_${caseData.CaseID}`, JSON.stringify(taskStatuses));
      
      // Generate some realistic task data
      generateTaskData(caseData, taskStatuses);
    }
  });
};

/**
 * Generate realistic form data for tasks
 */
const generateTaskData = (caseData, taskStatuses) => {
  const caseTypeConfig = taskConfig.caseTypes[caseData.CaseType] || taskConfig.caseTypes.default;
  
  caseTypeConfig.stages.forEach(stage => {
    stage.tasks.forEach(task => {
      const taskKey = `${stage.id}_${task.id}`;
      const taskStatus = taskStatuses[taskKey];
      
      if (taskStatus === 'completed' || (taskStatus === 'in-progress' && Math.random() > 0.3)) {
        const formData = {};
        let isCompleted = taskStatus === 'completed';
        
        // Generate realistic answers based on question types
        task.questions.forEach(question => {
          switch (question.type) {
            case 'radio':
              if (question.options && question.options.length > 0) {
                const randomOption = question.options[Math.floor(Math.random() * question.options.length)];
                formData[question.id] = randomOption.value;
              }
              break;
            case 'select':
              if (question.options && question.options.length > 1) {
                const randomOption = question.options[Math.floor(Math.random() * (question.options.length - 1)) + 1];
                formData[question.id] = randomOption.value;
              }
              break;
            case 'text':
              formData[question.id] = `Sample ${question.label.toLowerCase()}`;
              break;
            case 'textarea':
              formData[question.id] = `This is a sample response for ${question.label.toLowerCase()}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`;
              break;
          }
        });
        
        // Save task data
        const taskData = {
          formData,
          isCompleted,
          lastSaved: new Date().toISOString()
        };
        
        sessionStorage.setItem(`taskData_${caseData.CaseID}_${stage.id}_${task.id}`, JSON.stringify(taskData));
      }
    });
  });
};

/**
 * Clear all session data
 */
export const clearSessionData = () => {
  // Get all session storage keys
  const keys = Object.keys(sessionStorage);
  
  // Remove task-related data
  keys.forEach(key => {
    if (key.startsWith('taskStatuses_') || key.startsWith('taskData_')) {
      sessionStorage.removeItem(key);
    }
  });
};

/**
 * Get progress indicator index based on status
 */
export const getProgressIndex = (status) => {
  switch (status?.toLowerCase()) {
    case 'received':
      return 0;
    case 'triage':
      return 1;
    case 'review':
      return 2;
    case 'outcome':
      return 3;
    case 'closed':
      return 4;
    default:
      return 0;
  }
};
