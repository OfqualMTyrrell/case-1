import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Content, 
  Grid, 
  Column, 
  Theme, 
  Button, 
  Tile, 
  AILabel, 
  AILabelContent, 
  Tag, 
  SkeletonText, 
  SkeletonPlaceholder 
} from '@carbon/react';
import { ArrowUp } from '@carbon/icons-react';
import './CaseInformation.css';
import casesData from '../cases.json';
import aiSummaries from '../data/ai-case-summaries.json';
import AppHeader from '../components/AppHeader';
import CaseHeader from '../components/CaseHeader';
import CaseDetails from '../components/CaseDetails';
import CaseNavigation from '../components/CaseNavigation';
import { getDisplayStatus } from '../utils/caseStatusUtils';

function CaseInformation() {
  const { id } = useParams();
  const caseData = casesData.find(c => c.CaseID === id);
  const [currentCaseStatus, setCurrentCaseStatus] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [loadingAI, setLoadingAI] = useState(true);
  const pageTopRef = useRef(null);

  // Show/hide back to top button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle back to top click
  const handleBackToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    
    // Focus management for accessibility - focus on the page top element after scroll
    setTimeout(() => {
      if (pageTopRef.current) {
        pageTopRef.current.focus();
      }
    }, 500); // Delay to allow smooth scroll to complete
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [id]);

  // Load AI summary with simulated delay
  useEffect(() => {
    setLoadingAI(true);
    const timer = setTimeout(() => {
      if (caseData && caseData.CaseType) {
        const summary = aiSummaries[caseData.CaseType];
        setAiSummary(summary || null);
      }
      setLoadingAI(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [id, caseData]);

  useEffect(() => {
    // Set initial case status
    if (caseData) {
      setCurrentCaseStatus(getDisplayStatus(id, caseData.Status));
    }
  }, [id, caseData]);

  // Update case status when task statuses change
  useEffect(() => {
    if (caseData) {
      const updatedStatus = getDisplayStatus(id, caseData.Status);
      setCurrentCaseStatus(updatedStatus);
    }
  }, [id, caseData]);

  // Listen for storage changes to refresh case status
  useEffect(() => {
    const handleStorageChange = () => {
      if (caseData) {
        const updatedStatus = getDisplayStatus(id, caseData.Status);
        setCurrentCaseStatus(updatedStatus);
      }
    };

    const handleFocus = () => {
      handleStorageChange();
    };

    // Listen for custom refresh events from admin actions
    const handleDataRefresh = () => {
      handleStorageChange();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('caseDataRefresh', handleDataRefresh);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('caseDataRefresh', handleDataRefresh);
    };
  }, [id, caseData]);

  if (!caseData) {
    return (
      <Theme theme="white" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppHeader />
        <Content style={{ width: '100%', margin: '0 auto', flex: 1, padding: '1rem' }}>
          <div>Case not found</div>
        </Content>
      </Theme>
    );
  }

  return (
    <Theme theme="white" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <Content style={{ width: '100%', margin: '0 auto', flex: 1, padding: 0, paddingTop: '1em' }}>
        <Grid fullWidth columns={16} mode="narrow" gutter={16}>
          <Column sm={4} md={4} lg={3}>
            <CaseNavigation caseId={caseData.CaseID} activePage="information" />
          </Column>
          <Column sm={4} md={8} lg={13}>
            <div ref={pageTopRef} tabIndex={-1} style={{ outline: 'none' }}>
              <CaseHeader 
                caseData={caseData}
                currentCaseStatus={currentCaseStatus}
                currentPageTitle={caseData?.Title}
              />
            </div>
          </Column>
          <Column sm={4} md={8} lg={9} className="cds--lg:col-start-4">
            {/* AI Case Summary Tile */}
            <Tile
              slug={
                <AILabel>
                  <AILabelContent>
                    <div>
                      <p className="secondary">AI Generated Summary</p>
                      <h4>Case Analysis</h4>
                      <p className="secondary">
                        This summary was generated using AI analysis of case data and historical patterns.
                      </p>
                    </div>
                  </AILabelContent>
                </AILabel>
              }
            >
              {loadingAI ? (
                  <>
                    <SkeletonText heading style={{ marginBottom: '1rem', width: '40%' }} />
                    <SkeletonText paragraph lineCount={3} style={{ marginBottom: '1.5rem' }} />
                    <div style={{ 
                      display: 'flex', 
                      gap: '1.5rem',
                      borderTop: '1px solid var(--cds-border-subtle)',
                      paddingTop: '1rem'
                    }}>
                      <div style={{ flex: 1 }}>
                        <SkeletonText style={{ width: '60%', marginBottom: '0.5rem' }} />
                        <SkeletonPlaceholder style={{ width: '60px', height: '32px' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <SkeletonText style={{ width: '60%', marginBottom: '0.5rem' }} />
                        <SkeletonPlaceholder style={{ width: '60px', height: '32px' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <SkeletonText style={{ width: '40%', marginBottom: '0.5rem' }} />
                        <SkeletonPlaceholder style={{ width: '50px', height: '24px' }} />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 400, lineHeight: 1.4, margin: 0, marginBottom: '1rem' }}>
                      Case summary
                    </h3>
                    
                    <p style={{ 
                      fontSize: '0.875rem', 
                      lineHeight: 1.43, 
                      marginBottom: '1.5rem',
                      color: 'var(--cds-text-secondary)'
                    }}>
                      {aiSummary?.summary}
                    </p>

                    <div style={{ 
                      display: 'flex', 
                      gap: '1.5rem',
                      borderTop: '1px solid var(--cds-border-subtle)',
                      paddingTop: '1rem'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 400,
                          marginBottom: '0.25rem',
                          color: 'var(--cds-text-secondary)'
                        }}>
                          Information completedness
                        </div>
                        <div style={{ 
                          fontSize: '1.5rem', 
                          fontWeight: 300,
                          lineHeight: 1.19,
                          color: 'var(--cds-text-primary)'
                        }}>
                          {aiSummary?.metrics.dataQuality}%
                        </div>
                      </div>
                      <div>
                        <div style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 400,
                          marginBottom: '0.25rem',
                          color: 'var(--cds-text-secondary)'
                        }}>
                          AI confidence
                        </div>
                        <div style={{ 
                          fontSize: '1.5rem', 
                          fontWeight: 300,
                          lineHeight: 1.19,
                          color: 'var(--cds-text-primary)'
                        }}>
                          {aiSummary?.metrics.aiConfidence}%
                        </div>
                      </div>
                      <div>
                        <div style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 400,
                          marginBottom: '0.25rem',
                          color: 'var(--cds-text-secondary)'
                        }}>
                          Risk level
                        </div>
                        <Tag 
                          type={aiSummary?.metrics.riskLevel === 'High' ? 'red' : aiSummary?.metrics.riskLevel === 'Medium' ? 'orange' : 'green'}
                          size="md"
                        >
                          {aiSummary?.metrics.riskLevel}
                        </Tag>
                      </div>
                    </div>
                  </>
                )}
              </Tile>
            <CaseDetails caseData={caseData} />
          </Column>
        </Grid>

        {/* Back to Top Button */}
        {showBackToTop && (
          <Button
            kind="ghost"
            renderIcon={ArrowUp}
            onClick={handleBackToTop}
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
              zIndex: 1000,
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
            }}
          >
            Back to top
          </Button>
        )}
      </Content>
    </Theme>
  );
}

export default CaseInformation;
