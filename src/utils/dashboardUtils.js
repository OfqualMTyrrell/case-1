// Dashboard utility functions for calculating metrics and aggregating data

const CURRENT_USER = 'Jane Lee';

/**
 * Get all cases for the current user
 * @param {Array} cases - Array of case objects
 * @returns {Array} - Filtered cases for current user
 */
export const getUserCases = (cases) => {
  return cases.filter(caseItem => caseItem.CaseLead === CURRENT_USER);
};

/**
 * Count active cases for the current user
 * Active = not in 'Closed' status
 * @param {Array} cases - Array of case objects
 * @returns {number} - Count of active cases
 */
export const getActiveCasesCount = (cases) => {
  return cases.filter(
    caseItem => caseItem.CaseLead === CURRENT_USER && caseItem.Status !== 'Closed'
  ).length;
};

/**
 * Count new cases assigned in the last 7 days
 * @param {Array} cases - Array of case objects
 * @returns {number} - Count of new cases
 */
export const getNewCasesCount = (cases) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  return cases.filter(caseItem => {
    if (caseItem.CaseLead !== CURRENT_USER) return false;
    const receivedDate = new Date(caseItem.ReceivedDate);
    return receivedDate >= sevenDaysAgo;
  }).length;
};

/**
 * Get SLA metrics (mocked for prototype)
 * In real system, would calculate from actual due dates
 * @param {Array} cases - Array of case objects
 * @returns {Object} - SLA metrics object
 */
export const getSLAMetrics = (cases) => {
  const userCases = getUserCases(cases);
  const activeCases = userCases.filter(c => c.Status !== 'Closed');
  
  // Mock upcoming and breached deadlines
  const upcomingDeadlines = Math.floor(activeCases.length * 0.6);
  const breachedDeadlines = Math.floor(activeCases.length * 0.1);
  
  return {
    upcoming: upcomingDeadlines,
    breached: breachedDeadlines,
    total: activeCases.length
  };
};

/**
 * Count in-progress tasks from session storage
 * @returns {number} - Count of in-progress tasks
 */
export const getInProgressTasksCount = () => {
  let count = 0;
  
  // Iterate through session storage to find task status
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && key.startsWith('taskStatus_')) {
      try {
        const taskData = JSON.parse(sessionStorage.getItem(key));
        if (taskData && taskData.status === 'in-progress') {
          count++;
        }
      } catch (e) {
        // Skip invalid JSON
      }
    }
  }
  
  return count;
};

/**
 * Calculate case completion percentage
 * @param {string} caseId - Case ID
 * @param {Object} taskConfig - Task configuration object
 * @returns {number} - Completion percentage (0-100)
 */
export const getCaseCompletionPercentage = (caseId, taskConfig) => {
  if (!taskConfig || !taskConfig.stages) return 0;
  
  let totalTasks = 0;
  let completedTasks = 0;
  
  // Count all tasks across all stages
  taskConfig.stages.forEach(stage => {
    if (stage.tasks && Array.isArray(stage.tasks)) {
      stage.tasks.forEach(task => {
        totalTasks++;
        
        // Check task status in session storage
        const taskKey = `taskStatus_${caseId}_${stage.id}_${task.id}`;
        const taskData = sessionStorage.getItem(taskKey);
        
        if (taskData) {
          try {
            const parsed = JSON.parse(taskData);
            if (parsed.status === 'completed') {
              completedTasks++;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      });
    }
  });
  
  if (totalTasks === 0) return 0;
  return Math.round((completedTasks / totalTasks) * 100);
};

/**
 * Get all in-progress tasks for the current user
 * @param {Array} cases - Array of case objects
 * @param {Object} taskConfig - Task configuration object
 * @returns {Array} - Array of in-progress task objects
 */
export const getInProgressTasks = (cases, taskConfig) => {
  const tasks = [];
  const userCases = getUserCases(cases);
  
  if (!taskConfig || !taskConfig.stages) return tasks;
  
  userCases.forEach(caseItem => {
    taskConfig.stages.forEach(stage => {
      if (stage.tasks && Array.isArray(stage.tasks)) {
        stage.tasks.forEach(task => {
          const taskKey = `taskStatus_${caseItem.CaseID}_${stage.id}_${task.id}`;
          const taskData = sessionStorage.getItem(taskKey);
          
          if (taskData) {
            try {
              const parsed = JSON.parse(taskData);
              if (parsed.status === 'in-progress') {
                tasks.push({
                  id: task.id,
                  title: task.title,
                  caseId: caseItem.CaseID,
                  caseTitle: caseItem.Title,
                  stage: stage.name,
                  stageId: stage.id,
                  startedDate: parsed.startedDate || null
                });
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        });
      }
    });
  });
  
  return tasks;
};

/**
 * Calculate days since a date
 * @param {string} dateString - ISO date string
 * @returns {number} - Number of days
 */
export const getDaysSince = (dateString) => {
  if (!dateString) return 0;
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Format relative time (e.g., "2 hours ago", "3 days ago")
 * @param {string} timestamp - ISO timestamp
 * @returns {string} - Formatted relative time
 */
export const getRelativeTime = (timestamp) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now - time;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }
  const months = Math.floor(diffDays / 30);
  return `${months} month${months > 1 ? 's' : ''} ago`;
};

export { CURRENT_USER };

export default {
  CURRENT_USER,
  getUserCases,
  getActiveCasesCount,
  getNewCasesCount,
  getSLAMetrics,
  getInProgressTasksCount,
  getCaseCompletionPercentage,
  getInProgressTasks,
  getDaysSince,
  getRelativeTime
};
