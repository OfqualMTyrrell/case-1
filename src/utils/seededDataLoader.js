import seededData from '../data/seeded-task-data.json';

/**
 * Load seeded data into session storage if not already present
 */
export const loadSeededDataIfEmpty = () => {
  // Check if any task data already exists in session storage
  const existingKeys = Object.keys(sessionStorage).filter(key => 
    key.startsWith('taskStatuses_') || key.startsWith('taskData_')
  );
  
  // If there's already data, don't overwrite it
  if (existingKeys.length > 0) {
    console.log('Task data already exists in session storage, skipping seeded data load');
    return false;
  }
  
  console.log('Loading seeded task data into session storage...');
  
  // Load task statuses
  Object.entries(seededData.taskStatuses).forEach(([caseId, taskStatuses]) => {
    const key = `taskStatuses_${caseId}`;
    sessionStorage.setItem(key, JSON.stringify(taskStatuses));
  });
  
  // Load task data
  Object.entries(seededData.taskData).forEach(([taskDataKey, taskData]) => {
    const key = `taskData_${taskDataKey}`;
    sessionStorage.setItem(key, JSON.stringify(taskData));
  });
  
  console.log(`Loaded seeded data for ${Object.keys(seededData.taskStatuses).length} cases`);
  return true;
};

/**
 * Force refresh seeded data (used by admin tool)
 */
export const refreshSeededData = () => {
  console.log('Refreshing seeded task data...');
  
  // Clear existing task data
  const keys = Object.keys(sessionStorage);
  keys.forEach(key => {
    if (key.startsWith('taskStatuses_') || key.startsWith('taskData_')) {
      sessionStorage.removeItem(key);
    }
  });
  
  // Load fresh seeded data
  Object.entries(seededData.taskStatuses).forEach(([caseId, taskStatuses]) => {
    const key = `taskStatuses_${caseId}`;
    sessionStorage.setItem(key, JSON.stringify(taskStatuses));
  });
  
  Object.entries(seededData.taskData).forEach(([taskDataKey, taskData]) => {
    const key = `taskData_${taskDataKey}`;
    sessionStorage.setItem(key, JSON.stringify(taskData));
  });
  
  console.log(`Refreshed seeded data for ${Object.keys(seededData.taskStatuses).length} cases`);
};
