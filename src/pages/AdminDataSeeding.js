import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Content, 
  Grid, 
  Column, 
  Button, 
  InlineNotification,
  Layer,
  Heading,
  ProgressIndicator,
  ProgressStep,
  Tile
} from '@carbon/react';
import { seedRealisticTaskData, clearSessionData } from '../utils/caseStatusUtils';
import { refreshSeededData } from '../utils/seededDataLoader';
import casesData from '../cases.json';
import AppHeader from '../components/AppHeader';
import '@carbon/styles/css/styles.css';

function AdminDataSeeding() {
  const navigate = useNavigate();
  const [seedingStatus, setSeedingStatus] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedingProgress, setSeedingProgress] = useState(0);
  const [seedingStep, setSeedingStep] = useState('');

  const handleSeedData = async () => {
    setIsSeeding(true);
    setSeedingStatus('');
    setSeedingProgress(0);
    
    try {
      // Get all case IDs
      const caseIds = casesData.map(c => c.CaseID);
      const totalCases = caseIds.length;
      
      setSeedingStep('Generating realistic task data...');
      
      // Use the batch seeding function from utils
      await new Promise(resolve => {
        setTimeout(() => {
          seedRealisticTaskData();
          setSeedingProgress(100);
          resolve();
        }, 1000); // Delay to show progress
      });
      
      setSeedingStep('Complete!');
      setSeedingStatus(`Successfully seeded realistic task data for ${totalCases} cases using dynamic generation. Task completion statuses now reflect case progress realistically.`);
      
      // Dispatch custom event to refresh case list
      window.dispatchEvent(new CustomEvent('caseDataRefresh'));
      
    } catch (error) {
      setSeedingStatus(`Error seeding data: ${error.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleLoadSeededData = () => {
    try {
      refreshSeededData();
      setSeedingStatus(`Successfully loaded pre-seeded realistic task data for ${casesData.length} cases. This uses pre-generated data from the JSON file.`);
      
      // Dispatch custom event to refresh case list
      window.dispatchEvent(new CustomEvent('caseDataRefresh'));
      
    } catch (error) {
      setSeedingStatus(`Error loading seeded data: ${error.message}`);
    }
  };

  const handleClearData = () => {
    try {
      clearSessionData();
      setSeedingStatus(`Cleared all task data. Cases will now show original static statuses.`);
      
      // Dispatch custom event to refresh case list
      window.dispatchEvent(new CustomEvent('caseDataRefresh'));
      
    } catch (error) {
      setSeedingStatus(`Error clearing data: ${error.message}`);
    }
  };

  const getProgressSteps = () => {
    if (!isSeeding) return [];
    
    const steps = [
      { label: 'Initialize', status: 'complete' },
      { label: 'Generate Data', status: seedingProgress > 50 ? 'complete' : 'current' },
      { label: 'Apply Changes', status: seedingProgress === 100 ? 'complete' : 'incomplete' }
    ];
    
    return steps;
  };

  return (
    <div style={{ height: '100vh', backgroundColor: '#161616' }}>
      <Layer level={0}>
        <AppHeader />
        <Content style={{ padding: '2rem', backgroundColor: '#161616', minHeight: 'calc(100vh - 3rem)' }}>
          <Grid>
            <Column sm={16} md={8} lg={12}>
              <Heading style={{ marginBottom: '2rem', color: '#f4f4f4' }}>
                Admin: Data Seeding
              </Heading>
              
              <Tile style={{ marginBottom: '2rem', backgroundColor: '#262626', border: '1px solid #393939' }}>
                <Heading size="md" style={{ marginBottom: '1rem', color: '#f4f4f4' }}>
                  Task Data Management
                </Heading>
                <p style={{ marginBottom: '1.5rem', color: '#c6c6c6' }}>
                  The prototype automatically loads pre-seeded realistic task data when first opened. 
                  Use these controls to refresh with the latest seeded data, generate new dynamic data, or clear all data.
                </p>
                
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <Button 
                    onClick={handleLoadSeededData}
                    disabled={isSeeding}
                    kind="primary"
                  >
                    Load Pre-seeded Data
                  </Button>
                  
                  <Button 
                    onClick={handleSeedData}
                    disabled={isSeeding}
                    kind="secondary"
                  >
                    {isSeeding ? 'Generating...' : 'Generate New Dynamic Data'}
                  </Button>
                  
                  <Button 
                    onClick={handleClearData}
                    disabled={isSeeding}
                    kind="danger--tertiary"
                  >
                    Clear All Task Data
                  </Button>
                  
                  <Button 
                    onClick={() => navigate('/cases-v2')}
                    kind="tertiary"
                  >
                    Back to Cases
                  </Button>
                </div>
                
                {isSeeding && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <p style={{ marginBottom: '1rem', color: '#c6c6c6' }}>
                      {seedingStep}
                    </p>
                    <ProgressIndicator currentIndex={seedingProgress === 100 ? 2 : seedingProgress > 50 ? 1 : 0}>
                      <ProgressStep 
                        label="Initialize" 
                        description="Setting up data generation"
                      />
                      <ProgressStep 
                        label="Generate Data" 
                        description="Creating realistic task completion data"
                      />
                      <ProgressStep 
                        label="Apply Changes" 
                        description="Saving data to session storage"
                      />
                    </ProgressIndicator>
                    <div style={{ marginTop: '1rem' }}>
                      <div style={{ 
                        width: '100%', 
                        height: '4px', 
                        backgroundColor: '#393939', 
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          width: `${seedingProgress}%`, 
                          height: '100%', 
                          backgroundColor: '#0f62fe',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                      <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#a8a8a8' }}>
                        {Math.round(seedingProgress)}% complete
                      </p>
                    </div>
                  </div>
                )}
              </Tile>
              
              {seedingStatus && (
                <InlineNotification
                  kind={seedingStatus.includes('Error') ? 'error' : 'success'}
                  title={seedingStatus.includes('Error') ? 'Seeding Failed' : 'Seeding Complete'}
                  subtitle={seedingStatus}
                  hideCloseButton={false}
                  onCloseButtonClick={() => setSeedingStatus('')}
                  style={{ marginBottom: '1rem' }}
                />
              )}
              
              <Tile style={{ backgroundColor: '#262626', border: '1px solid #393939' }}>
                <Heading size="sm" style={{ marginBottom: '1rem', color: '#f4f4f4' }}>
                  Data Management Options
                </Heading>
                <ul style={{ color: '#c6c6c6', lineHeight: '1.5', marginBottom: '1rem' }}>
                  <li><strong>Load Pre-seeded Data:</strong> Uses pre-generated realistic task data (fastest option)</li>
                  <li><strong>Generate New Dynamic Data:</strong> Creates fresh realistic task completion patterns</li>
                  <li><strong>Clear All Task Data:</strong> Removes all task data, reverting to static case statuses</li>
                </ul>
                
                <Heading size="sm" style={{ marginBottom: '1rem', color: '#f4f4f4' }}>
                  Realistic Completion Patterns
                </Heading>
                <ul style={{ color: '#c6c6c6', lineHeight: '1.5' }}>
                  <li><strong>Received cases:</strong> No tasks completed</li>
                  <li><strong>Triage cases:</strong> ~25% of tasks completed</li>
                  <li><strong>Review cases:</strong> ~75% of tasks completed</li>
                  <li><strong>Closed cases:</strong> All tasks completed</li>
                </ul>
                <p style={{ marginTop: '1rem', color: '#a8a8a8', fontSize: '0.875rem' }}>
                  The prototype automatically loads pre-seeded data when first opened, so users don't need to use this admin tool.
                  Data is stored in browser session storage and persists until cleared or the browser session ends.
                </p>
              </Tile>
            </Column>
          </Grid>
        </Content>
      </Layer>
    </div>
  );
}

export default AdminDataSeeding;
