import React from 'react';
import {
  StructuredListWrapper,
  StructuredListHead,
  StructuredListRow,
  StructuredListCell,
  StructuredListBody,
  Tag
} from '@carbon/react';

function TaskListStructured({ stages, getTaskStatus, onTaskClick }) {
  
  const getStatusTag = (status) => {
    switch (status) {
      case 'completed':
        return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontWeight: 600, color: 'var(--cds-text-primary)' }}>Completed</span></div>;
      case 'in-progress':
        return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Tag type="blue" size="md">In progress</Tag></div>;
      case 'not-started':
      default:
        return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Tag type="gray" size="md">Not started</Tag></div>;
    }
  };

  const getStageProgress = (stage) => {
    const tasks = stage.tasks || [];
    const completedTasks = tasks.filter(task => 
      getTaskStatus(stage.id, task.id) === 'completed'
    ).length;
    return { completed: completedTasks, total: tasks.length };
  };

  return (
    <>
      {stages.map(stage => {
        const stageProgress = getStageProgress(stage);
        return (
          <div key={stage.id} style={{ marginBottom: '2rem' }}>
            <h2 style={{ margin: 0, marginBottom: '1rem' }}>
              {stage.name}
            </h2>
            
            <StructuredListWrapper selection>
              <StructuredListBody>
                {stage.tasks.map(task => {
                  const status = getTaskStatus(stage.id, task.id);
                  return (
                    <StructuredListRow
                      key={task.id}
                      onClick={() => onTaskClick(stage.id, task.id)}
                      style={{ cursor: 'pointer' }}
                      aria-label={`${task.name} - ${status.replace('-', ' ')}`}
                    >
                      <StructuredListCell>
                        {task.name}
                      </StructuredListCell>
                      <StructuredListCell>
                        {getStatusTag(status)}
                      </StructuredListCell>
                    </StructuredListRow>
                  );
                })}
              </StructuredListBody>
            </StructuredListWrapper>
          </div>
        );
      })}
    </>
  );
}

export default TaskListStructured;
