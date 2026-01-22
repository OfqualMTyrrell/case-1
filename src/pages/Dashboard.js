import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Content,
  Grid,
  Column,
  Tile,
  ClickableTile,
  ExpandableTile,
  TileAboveTheFoldContent,
  TileBelowTheFoldContent,
  Tag,
  Button,
  ContentSwitcher,
  Switch,
  Layer,
  Stack
} from '@carbon/react';
import {
  ArrowUp,
  ArrowDown,
  CheckmarkOutline,
  Email,
  Document,
  Edit,
  View
} from '@carbon/icons-react';
import AppHeader from '../components/AppHeader';
import DashboardHeader from '../components/DashboardHeader';
import casesData from '../cases.json';
import activityData from '../data/dashboard-activity.json';
import messagesData from '../data/messages-data.json';
import seededTaskData from '../data/seeded-task-data.json';
import inProgressTasksData from '../data/dashboard-tasks-data.json';
import {
  CURRENT_USER,
  getActiveCasesCount,
  getSLAMetrics,
  getUserCases,
  getRelativeTime
} from '../utils/dashboardUtils';

const Dashboard = () => {
  const navigate = useNavigate();
  const [messageFilter, setMessageFilter] = useState(0); // 0=All, 1=Unread, 2=Sent
  const [activityDisplayCount, setActivityDisplayCount] = useState(5);
  const [casesDisplayCount, setCasesDisplayCount] = useState(5);

  // Load seeded task data on mount for demo purposes
  useEffect(() => {
    // Only load if not already loaded
    const hasSeededData = sessionStorage.getItem('dashboard_seeded_data_loaded');
    
    if (!hasSeededData) {
      console.log('Loading seeded task data for dashboard demo...');
      
      // Convert seeded task data format to individual task status keys
      Object.entries(seededTaskData.taskStatuses).forEach(([caseId, tasks]) => {
        Object.entries(tasks).forEach(([taskKey, status]) => {
          // taskKey format: "stageId_taskId"
          const [stageId, taskId] = taskKey.split('_');
          const storageKey = `taskStatus_${caseId}_${stageId}_${taskId}`;
          
          // Store with startedDate for in-progress tasks
          const taskData = {
            status: status,
            startedDate: status === 'in-progress' ? new Date().toISOString() : null,
            completedDate: status === 'completed' ? new Date().toISOString() : null
          };
          
          sessionStorage.setItem(storageKey, JSON.stringify(taskData));
        });
      });
      
      sessionStorage.setItem('dashboard_seeded_data_loaded', 'true');
      console.log('Seeded task data loaded successfully');
    }
  }, []);

  // Calculate metrics using useMemo
  const activeCasesCount = useMemo(() => getActiveCasesCount(casesData), []);
  const slaMetrics = useMemo(() => getSLAMetrics(casesData), []);
  const inProgressTasksCount = useMemo(() => inProgressTasksData.length, []);

  // Get user's cases with completion percentage
  const myCases = useMemo(() => {
    const userCases = getUserCases(casesData);
    // Fake completion percentages for demo
    const fakeCompletionValues = [0, 60, 85, 7, 15, 45, 70, 30, 95, 50, 0];
    
    return userCases.map((caseItem, index) => ({
      id: caseItem.CaseID,
      CaseID: caseItem.CaseID,
      Title: caseItem.Title,
      CaseLead: caseItem.CaseLead,
      Status: caseItem.Status,
      Completion: fakeCompletionValues[index % fakeCompletionValues.length]
    })).sort((a, b) => b.Completion - a.Completion);
  }, []);

  // Get in-progress tasks - use demo data for prototype
  const inProgressTasks = useMemo(() => inProgressTasksData, []);

  // Filter activity for current user
  const userActivity = useMemo(() => {
    return activityData
      .filter(activity => activity.userId === 'jane-lee')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, []);

  // Filter messages for current user
  const userMessages = useMemo(() => {
    if (messageFilter === 2) {
      // Sent messages
      return messagesData
        .filter(msg => msg.from === CURRENT_USER)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } else if (messageFilter === 1) {
      // Unread messages
      return messagesData
        .filter(msg => msg.to === CURRENT_USER && !msg.isRead)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } else {
      // All messages (index 0)
      return messagesData
        .filter(msg => msg.to === CURRENT_USER || msg.from === CURRENT_USER)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
  }, [messageFilter]);

  const unreadCount = useMemo(() => 
    messagesData.filter(msg => msg.to === CURRENT_USER && !msg.isRead).length,
    []
  );

  const sentCount = useMemo(() =>
    messagesData.filter(msg => msg.from === CURRENT_USER).length,
    []
  );

  const allCount = useMemo(() =>
    messagesData.filter(msg => msg.to === CURRENT_USER || msg.from === CURRENT_USER).length,
    []
  );

  const getActionIcon = (action) => {
    switch (action) {
      case 'completed':
        return <CheckmarkOutline size={20} />;
      case 'sent':
        return <Email size={20} />;
      case 'opened':
        return <View size={20} />;
      case 'edited':
        return <Edit size={20} />;
      default:
        return <Document size={20} />;
    }
  };

  return (
    <>
      <AppHeader />
      <Content style={{ width: '100%', marginTop: '1rem', flex: 1, padding: '1rem' }}>
        

        {/* Metric Tiles Row */}
        <Grid fullWidth columns={16} mode="narrow">
          <Column lg={16} md={8} sm={4} style={{ marginLeft: 'unset' }}>
            <DashboardHeader />
            <Stack orientation="horizontal" gap={9} style={{ width: '100%' }}>
              <Tile style={{ 
                padding: '1.5rem',
                flex: 1,
                backgroundColor: 'var(--cds-layer-01)'
              }}>
                <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--cds-text-secondary)' }}>
                  Active cases
                </div>
                <div style={{ 
                  fontSize: '3rem', 
                  fontWeight: 300, 
                  marginBottom: '0.5rem',
                  color: 'var(--cds-text-primary)'
                }}>
                  {activeCasesCount}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <ArrowUp size={16} style={{ color: 'var(--cds-support-success)' }} />
                  <span style={{ color: 'var(--cds-support-success)' }}>12%</span>
                  <span style={{ color: 'var(--cds-text-secondary)' }}>vs last month</span>
                </div>
              </Tile>

              <Tile style={{ 
                padding: '1.5rem',
                flex: 1,
                backgroundColor: 'var(--cds-layer-01)'
              }}>
                <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--cds-text-secondary)' }}>
                  Breached SLAs
                </div>
                <div style={{ 
                  fontSize: '3rem', 
                  fontWeight: 300, 
                  marginBottom: '0.5rem',
                  color: 'var(--cds-text-primary)'
                }}>
                  {slaMetrics.breached}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                  {slaMetrics.breached > 0 ? (
                    <>
                      <span style={{ color: 'var(--cds-support-error)' }}>⚠</span>
                      <span style={{ color: 'var(--cds-text-secondary)' }}>Require attention</span>
                    </>
                  ) : (
                    <span style={{ color: 'var(--cds-text-secondary)' }}>All on track</span>
                  )}
                </div>
              </Tile>

              <Tile style={{ 
                padding: '1.5rem',
                flex: 1,
                backgroundColor: 'var(--cds-layer-01)'
              }}>
                <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--cds-text-secondary)' }}>
                  Upcoming SLAs
                </div>
                <div style={{ 
                  fontSize: '3rem', 
                  fontWeight: 300, 
                  marginBottom: '0.5rem',
                  color: 'var(--cds-text-primary)'
                }}>
                  {slaMetrics.upcoming}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                  Deadlines approaching
                </div>
              </Tile>

              <Tile style={{ 
                padding: '1.5rem',
                flex: 1,
                backgroundColor: 'var(--cds-layer-01)'
              }}>
                <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--cds-text-secondary)' }}>
                  Unread messages
                </div>
                <div style={{ 
                  fontSize: '3rem', 
                  fontWeight: 300, 
                  marginBottom: '0.5rem',
                  color: 'var(--cds-text-primary)'
                }}>
                  {unreadCount}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                  {unreadCount === 1 ? 'New message' : 'New messages'}
                </div>
              </Tile>

              <Tile style={{ 
                padding: '1.5rem',
                flex: 1,
                backgroundColor: 'var(--cds-layer-01)'
              }}>
                <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--cds-text-secondary)' }}>
                  In progress tasks
                </div>
                <div style={{ 
                  fontSize: '3rem', 
                  fontWeight: 300, 
                  marginBottom: '0.5rem',
                  color: 'var(--cds-text-primary)'
                }}>
                  {inProgressTasksCount}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <ArrowDown size={16} style={{ color: 'var(--cds-support-success)' }} />
                  <span style={{ color: 'var(--cds-support-success)' }}>3 fewer</span>
                  <span style={{ color: 'var(--cds-text-secondary)' }}>than yesterday</span>
                </div>
              </Tile>
            </Stack>
          </Column>
              </Grid>
              
            <Grid fullWidth columns={16} mode="narrow" gutter={16} style={{ marginTop: '1rem' }}>
            {/* My Cases Section */}
              <Column lg={4} md={4} sm={4} style={{ marginLeft: 'unset' }}>
                <Layer withBackground>
                  <div style={{ padding: '1rem' }}>
                    <h3 style={{ 
                      padding: '0 0 0.5rem 0', 
                      margin: 0,
                      fontSize: '1.25rem',
                      fontWeight: 600
                    }}>
                      My cases
                    </h3>
                  {myCases.length === 0 ? (
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ color: 'var(--cds-text-secondary)', marginBottom: '1rem' }}>
                        No active cases assigned
                      </p>
                      <Button kind="tertiary" onClick={() => navigate('/cases-v2')}>
                        View all cases
                      </Button>
                    </div>
                  ) : (
                    <>
                      {myCases.slice(0, casesDisplayCount).map((caseItem, index) => (
                        <ClickableTile
                          key={caseItem.id}
                          onClick={() => navigate(`/case/${caseItem.id}`)}
                          style={{ marginBottom: index < casesDisplayCount - 1 ? '0.5rem' : 0 }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <div style={{ fontWeight: 600 }}>
                              {caseItem.CaseID}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                                  {caseItem.Completion}%
                                </span>
                                {caseItem.Completion === 100 && (
                                  <CheckmarkOutline size={16} style={{ color: 'var(--cds-support-success)' }} />
                                )}
                              </div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>Completion</span>
                            </div>
                          </div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--cds-text-primary)' }}>
                            {caseItem.Title}
                          </div>
                        </ClickableTile>
                      ))}
                      {casesDisplayCount < myCases.length && (
                        <Button 
                          kind="ghost" 
                          size="sm"
                          style={{ width: '100%', marginTop: '1rem' }}
                          onClick={() => setCasesDisplayCount(prev => Math.min(prev + 5, myCases.length))}
                        >
                          Load more ({myCases.length - casesDisplayCount} remaining)
                        </Button>
                      )}
                    </>
                  )}
                  </div>
                </Layer>
              </Column>


            {/* Message Inbox */}

              <Column lg={4} md={4} sm={4}>
                <Layer withBackground>
                  <div style={{ padding: '1rem' }}>
                    <h3 style={{ 
                      padding: '0 0 0.5rem 0', 
                      margin: 0,
                      fontSize: '1.25rem',
                      fontWeight: 600
                    }}>
                      Message inbox
                    </h3>
                    <ContentSwitcher
                      selectedIndex={messageFilter}
                      onChange={({ index }) => setMessageFilter(index)}
                      size="sm" style={{ margin: '1rem 0' }}
                    >
                      <Switch text={`All (${allCount})`} />
                      <Switch text={`Unread (${unreadCount})`} />
                      <Switch text={`Sent (${sentCount})`} />
                    </ContentSwitcher>

                  {userMessages.length === 0 ? (
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ color: 'var(--cds-text-secondary)' }}>
                        {messageFilter === 0 && 'No messages'}
                        {messageFilter === 1 && 'No unread messages'}
                        {messageFilter === 2 && 'No sent messages'}
                      </p>
                    </div>
                  ) : (
                    <>
                      {userMessages.slice(0, 10).map((message, index) => (
                        <ClickableTile
                          key={message.id}
                          onClick={() => navigate(`/case/${message.caseId}/messages?selected=${message.id}`)}
                          style={{ 
                            marginBottom: index < Math.min(10, userMessages.length) - 1 ? '0.5rem' : 0,
                            
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontWeight: 600 }}>
                                {messageFilter === 2 ? `To: ${message.to}` : `From: ${message.from}`}
                              </span>
                              
                            </div>
                            <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                              {getRelativeTime(message.timestamp)}
                            </span>
                          </div>
                          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                  {message.subject}
                                  {message.to === CURRENT_USER && !message.isRead && messageFilter !== 2 && (
                                <Tag type="blue" size="sm">Unread</Tag>
                              )}
                          </div>
                          <div style={{ 
                            fontSize: '0.875rem', 
                            color: 'var(--cds-text-secondary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {message.body.substring(0, 100)}...
                          </div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', marginTop: '0.5rem' }}>
                            Case: {message.caseId}
                          </div>
                        </ClickableTile>
                      ))}
                    </>
                  )}
                  </div>
                </Layer>
              </Column>

              {/* In Progress Tasks */}
              <Column lg={4} md={4} sm={4}>
                <Layer withBackground>
                  <div style={{ padding: '1rem' }}>
                    <h3 style={{ 
                      padding: '0 0 0.5rem 0', 
                      margin: 0,
                      fontSize: '1.25rem',
                      fontWeight: 600
                    }}>
                      In progress tasks
                    </h3>
                  {inProgressTasks.length === 0 ? (
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ color: 'var(--cds-text-secondary)' }}>
                        No tasks in progress
                      </p>
                    </div>
                  ) : (
                    <>
                      {inProgressTasks.map(task => (
                        <ClickableTile
                          key={`${task.caseId}-${task.id}`}
                          onClick={() => navigate(`/case/${task.caseId}/tasks/${task.stageId}/${task.id}`)}
                          style={{ marginBottom: '0.5rem' }}
                        >
                          <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                            {task.title}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', marginBottom: '0.25rem' }}>
                            Case: {task.caseId}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                            {task.caseTitle}
                          </div>
                          {task.startedDate && (
                            <div style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', marginTop: '0.5rem' }}>
                              Started {getRelativeTime(task.startedDate)}
                            </div>
                          )}
                        </ClickableTile>
                      ))}
                    </>
                  )}
                  </div>
                </Layer>
              </Column>

              {/* Recent Activity */}
              <Column lg={4} md={4} sm={4}>
                <Layer withBackground>
                  <div style={{ padding: '1rem' }}>
                    <h3 style={{ 
                      padding: '0 0 0.5rem 0', 
                      margin: 0,
                      fontSize: '1.25rem',
                      fontWeight: 600
                    }}>
                      Recent activity
                    </h3>
                  {userActivity.length === 0 ? (
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ color: 'var(--cds-text-secondary)' }}>
                        No recent activity
                      </p>
                    </div>
                  ) : (
                    <>
                      {userActivity.slice(0, activityDisplayCount).map((activity, index) => (
                        <ExpandableTile
                          key={activity.id}
                          style={{ marginBottom: index < activityDisplayCount - 1 ? '0.5rem' : 0 }}
                        >
                          <TileAboveTheFoldContent>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                              <div style={{ marginTop: '0.25rem' }}>
                                {getActionIcon(activity.action)}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                  {activity.description}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                                  {getRelativeTime(activity.timestamp)}
                                </div>
                              </div>
                            </div>
                          </TileAboveTheFoldContent>
                          <TileBelowTheFoldContent>
                            <div style={{ paddingTop: '0.5rem' }}>
                              <div style={{ marginBottom: '0.5rem' }}>
                                <strong>Case:</strong> {activity.caseId}
                              </div>
                              <div style={{ marginBottom: '0.5rem', color: 'var(--cds-text-secondary)' }}>
                                {activity.caseTitle}
                              </div>
                              <Button
                                kind="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/case/${activity.caseId}`);
                                }}
                              >
                                View case
                              </Button>
                            </div>
                          </TileBelowTheFoldContent>
                        </ExpandableTile>
                      ))}
                      {activityDisplayCount < userActivity.length && (
                        <Button
                          kind="ghost"
                          style={{ width: '100%', marginTop: '1rem' }}
                          onClick={() => setActivityDisplayCount(prev => prev + 10)}
                        >
                          Load more
                        </Button>
                      )}
                    </>
                  )}
                  </div>
                </Layer>
              </Column>
              </Grid>
      </Content>
    </>
  );
};

export default Dashboard;
