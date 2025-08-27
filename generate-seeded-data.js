const fs = require('fs');
const casesData = require('./src/cases.json');
const taskConfig = require('./src/data/task-config.json');

// Seed realistic task data based on existing case statuses
const seedRealisticTaskData = () => {
  const seededData = {
    taskStatuses: {},
    taskData: {}
  };

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
    
    // Save task statuses
    if (Object.keys(taskStatuses).length > 0) {
      seededData.taskStatuses[caseData.CaseID] = taskStatuses;
      
      // Generate realistic task data
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
            
            const taskDataKey = `${caseData.CaseID}_${stage.id}_${task.id}`;
            seededData.taskData[taskDataKey] = taskData;
          }
        });
      });
    }
  });
  
  return seededData;
};

const seededData = seedRealisticTaskData();
fs.writeFileSync('./src/data/seeded-task-data.json', JSON.stringify(seededData, null, 2));
console.log(`Generated seeded data for ${Object.keys(seededData.taskStatuses).length} cases`);
