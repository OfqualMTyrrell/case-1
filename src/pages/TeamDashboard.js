import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Content,
  Grid,
  Column,
  Tile,
  Layer,
  Button,
  ClickableTile,
  ExpandableTile,
  TileAboveTheFoldContent,
  TileBelowTheFoldContent
} from '@carbon/react';
import {
  ArrowUp,
  ArrowDown,
  CheckmarkOutline,
  Document,
  Edit,
  View,
  Email
} from '@carbon/icons-react';
import { DonutChart, StackedBarChart } from '@carbon/charts-react';
import '@carbon/charts-react/styles.css';
import AppHeader from '../components/AppHeader';
import DashboardHeader from '../components/DashboardHeader';
import casesData from '../cases.json';
import chartData from '../data/team-dashboard-charts.json';
import {
  getActiveCasesCount,
  getSLAMetrics,
  getRelativeTime
} from '../utils/dashboardUtils';

const TeamDashboard = () => {
  const navigate = useNavigate();
  const [teamCasesDisplayCount, setTeamCasesDisplayCount] = useState(5);
  const [activityDisplayCount, setActivityDisplayCount] = useState(5);

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
      case 'uploaded':
        return <Document size={20} />;
      default:
        return <Document size={20} />;
    }
  };

  // Team-wide metrics
  const activeCasesCount = useMemo(() => getActiveCasesCount(casesData), []);
  const slaMetrics = useMemo(() => getSLAMetrics(casesData), []);

  // Calculate SLA compliance percentage
  const totalSLAs = activeCasesCount;
  const slaCompliancePercent = totalSLAs > 0 
    ? Math.round(((totalSLAs - slaMetrics.breached) / totalSLAs) * 100)
    : 0;

  // All active team cases with completion percentage
  const teamCases = useMemo(() => {
    // Extract case types from chart data (remove the " - X cases" suffix)
    const chartCaseTypes = chartData.caseTypeDistribution.map(item => 
      item.group.split(' - ')[0].toLowerCase()
    );
    
    // Fake completion percentages for demo
    const fakeCompletionValues = [35, 70, 15, 90, 55, 25, 80, 45, 27, 60, 20, 75, 40, 85, 30, 65, 50, 95, 10, 0];
    
    return casesData
      .filter(c => c.Status !== 'Closed')
      .filter(c => {
        const caseTypeLower = (c.CaseType || '').toLowerCase();
        // Check for exact match or partial match (e.g., "information notice b4" matches "information notice (b4)")
        return chartCaseTypes.some(chartType => 
          caseTypeLower === chartType || 
          caseTypeLower.replace(/[()]/g, '').replace(/\s+/g, ' ') === chartType.replace(/[()]/g, '').replace(/\s+/g, ' ')
        );
      })
      .map((c, index) => ({
        id: c.CaseID,
        CaseID: c.CaseID,
        Title: c.Title,
        CaseLead: c.CaseLead || 'Unassigned',
        Status: c.Status,
        Completion: fakeCompletionValues[index % fakeCompletionValues.length]
      }))
      .sort((a, b) => b.Completion - a.Completion);
  }, []);

  // Team activity - all activity, not filtered by user
  const teamActivity = useMemo(() => {
    return chartData.teamActivity || [];
  }, []);

  // Chart options with Carbon colors
  const donutChartOptions = {
    title: '',
    resizable: true,
    donut: {
      center: {
        label: 'Total'
      }
    },
    height: '300px',
    color: {
      scale: {
        'Statement of Compliance - 28 cases': '#8a3ffc',
        'Event notification - 22 cases': '#1192e8',
        'Information Request - 18 cases': '#009d9a',
        'Information Notice (B4) - 14 cases': '#ee5396',
        'AO Enquiry - 8 cases': '#24a148'
      }
    },
    toolbar: {
      enabled: false
    }
  };

  const stackedBarChartOptions = {
    title: '',
    axes: {
      left: {
        mapsTo: 'key',
        scaleType: 'labels'
      },
      bottom: {
        mapsTo: 'value',
        stacked: true,
        domain: [0, 50]
      }
    },
    height: '400px',
    color: {
      scale: {
        'Received': '#8a3ffc',
        'Triage': '#1192e8',
        'Review': '#009d9a',
        'Outcome': '#ee5396',
        'Closed': '#24a148'
      }
    },
    toolbar: {
      enabled: false
    }
  };

  // Calculate gauge status and percentage
  const capacityPercent = Math.round((chartData.teamCapacity.casesStarted / chartData.teamCapacity.totalCapacity) * 100);
  const gaugeStatus = capacityPercent < 80 ? 'success' : capacityPercent < 95 ? 'warning' : 'danger';

  return (
    <>
      <AppHeader />
      <Content style={{ width: '100%', marginTop: '1rem', flex: 1, padding: '1rem' }}>
        

        {/* Header */}
        <Grid fullWidth columns={16} mode="narrow">
          <Column lg={16} md={8} sm={4} style={{ marginLeft: 'unset' }}>
            <DashboardHeader />
          </Column>
        </Grid>

        {/* Main Content */}
        <Grid fullWidth columns={16} mode="narrow" gutter={16}>
          {/* Left Column - Charts and Lists */}
          <Column lg={12} md={8} sm={4}>
            <Grid fullWidth columns={16} mode="narrow" gutter={16}>
              {/* Charts Row */}
              <Column lg={8} md={8} sm={4}>
                <Layer withBackground>
                  <div style={{ padding: '1rem', marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', margin: 0 }}>
                      Active cases by case lead
                    </h4>
                  {chartData.casesByCaseLead.length > 0 ? (
                    <div style={{ fontSize: '0.875rem', fontFamily: 'IBM Plex Sans, system-ui, -apple-system, sans-serif', lineHeight: 1.0 }}>
                      <StackedBarChart
                        data={chartData.casesByCaseLead}
                        options={{
                          ...stackedBarChartOptions,
                          height: '400px'
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--cds-text-secondary)' }}>
                      <p>No data available</p>
                    </div>
                  )}
                  </div>
                </Layer>
              </Column>
              
              <Column lg={4} md={8} sm={4}>
                <Layer withBackground>
                  <div style={{ padding: '1rem', marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', margin: 0 }}>
                      Case Types
                    </h4>
                  {chartData.caseTypeDistribution.length > 0 ? (
                    <div style={{ fontSize: '14px', fontFamily: 'IBM Plex Sans, system-ui, -apple-system, sans-serif', lineHeight: 1.5 }}>
                      <DonutChart
                        data={chartData.caseTypeDistribution}
                        options={{
                          ...donutChartOptions,
                          height: '400px'
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--cds-text-secondary)' }}>
                      <p>No data available</p>
                    </div>
                  )}
                  </div>
                </Layer>
              </Column>

              {/* Lists Row */}
              <Column lg={6} md={8} sm={4}>
            <Layer withBackground>
              <div style={{ padding: '1rem' }}>
                <h3 style={{ 
                  padding: '0 0 0.5rem 0', 
                  margin: 0,
                  fontSize: '1.25rem',
                  fontWeight: 600
                }}>
                  Team Cases
                </h3>
                {teamCases.length > 0 ? (
                  <>
                    {teamCases.slice(0, teamCasesDisplayCount).map((caseItem, index) => (
                      <ClickableTile 
                        key={caseItem.id} 
                        onClick={() => navigate(`/case/${caseItem.id}`)}
                        style={{ marginBottom: index < Math.min(teamCasesDisplayCount, teamCases.length) - 1 ? '0.5rem' : 0 }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <div style={{ fontWeight: 600 }}>{caseItem.CaseID}</div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>{caseItem.Completion}%</span>
                              {caseItem.Completion === 100 && <CheckmarkOutline size={16} style={{ color: 'var(--cds-support-success)' }} />}
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>Completion</span>
                          </div>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--cds-text-primary)', marginBottom: '0.25rem' }}>
                          {caseItem.Title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
                          Lead: {caseItem.CaseLead}
                        </div>
                      </ClickableTile>
                    ))}
                    {teamCasesDisplayCount < teamCases.length && (
                      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                        <Button 
                          kind="ghost" 
                          size="sm"
                          onClick={() => setTeamCasesDisplayCount(prev => prev + 10)}
                        >
                          Load more cases
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <p style={{ color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
                      No active team cases
                    </p>
                  </div>
                )}
              </div>
            </Layer>
              </Column>

              {/* Team Activity Section */}
              <Column lg={6} md={8} sm={4}>
                <Layer withBackground>
                  <div style={{ padding: '1rem' }}>
                    <h3 style={{ 
                      padding: '0 0 0.5rem 0', 
                      margin: 0,
                      fontSize: '1.25rem',
                      fontWeight: 600
                    }}>
                      Team Activity
                    </h3>
                    {teamActivity.length === 0 ? (
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ color: 'var(--cds-text-secondary)' }}>
                          No recent team activity
                        </p>
                      </div>
                    ) : (
                      <>
                        {teamActivity.slice(0, activityDisplayCount).map((activity, index) => (
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
                                    {activity.userName} • {getRelativeTime(activity.timestamp)}
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
                        {activityDisplayCount < teamActivity.length && (
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
          </Column>

          {/* Right Column - Summary Card */}
          <Column lg={4} md={8} sm={4}>
            <Tile style={{ 
              padding: '1.5rem',
              backgroundColor: 'var(--cds-layer-01)',
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', margin: 0 }}>
                Summary
              </h3>
              <div style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', marginBottom: '1rem' }}>
                Weekly
              </div>

              <div style={{ borderBottom: '1px solid var(--cds-border-subtle-01)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '3rem', fontWeight: 300, color: 'var(--cds-text-primary)', marginBottom: '0.25rem' }}>
                  90
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', marginBottom: '0.25rem' }}>
                  Active cases
                </div>
                <div style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ArrowUp size={16} style={{ color: 'var(--cds-support-error)' }} />
                  <span style={{ color: 'var(--cds-support-error)' }}>5 more</span>
                  <span style={{ color: 'var(--cds-text-secondary)' }}>than last week</span>
                </div>
              </div>

              <div style={{ borderBottom: '1px solid var(--cds-border-subtle-01)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '3rem', fontWeight: 300, color: 'var(--cds-text-primary)', marginBottom: '0.25rem' }}>
                  6
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', marginBottom: '0.25rem' }}>
                  Closed cases
                </div>
                <div style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ArrowUp size={16} style={{ color: 'var(--cds-support-success)' }} />
                  <span style={{ color: 'var(--cds-support-success)' }}>2 more</span>
                  <span style={{ color: 'var(--cds-text-secondary)' }}>than last week</span>
                </div>
              </div>

              <div style={{ borderBottom: '1px solid var(--cds-border-subtle-01)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '3rem', fontWeight: 300, color: 'var(--cds-text-primary)', marginBottom: '0.25rem' }}>
                  {slaMetrics.breached}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', marginBottom: '0.25rem' }}>
                  Breached SLA
                </div>
                <div style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ArrowDown size={16} style={{ color: 'var(--cds-support-success)' }} />
                  <span style={{ color: 'var(--cds-support-success)' }}>2 fewer</span>
                  <span style={{ color: 'var(--cds-text-secondary)' }}>than last week</span>
                </div>
              </div>

              <div style={{ borderBottom: '1px solid var(--cds-border-subtle-01)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '3rem', fontWeight: 300, color: 'var(--cds-text-primary)', marginBottom: '0.25rem' }}>
                  {slaMetrics.upcoming}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', marginBottom: '0.25rem' }}>
                  Upcoming SLAs
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
                  Due in next 7 days
                </div>
              </div>

              <div style={{ borderBottom: '1px solid var(--cds-border-subtle-01)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '3rem', fontWeight: 300, color: 'var(--cds-text-primary)', marginBottom: '0.25rem' }}>
                  {slaCompliancePercent}%
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', marginBottom: '0.25rem' }}>
                  SLA compliance
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
                  This week
                </div>
              </div>

              <div>
                <div style={{ fontSize: '3rem', fontWeight: 300, color: 'var(--cds-text-primary)', marginBottom: '0.25rem' }}>
                  12
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                  Avg resolution time
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
                  days (team average)
                </div>
              </div>
            </Tile>
          </Column>
        </Grid>
      </Content>
    </>
  );
};

export default TeamDashboard;
