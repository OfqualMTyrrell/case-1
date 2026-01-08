import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Content, Grid, Column, Theme, Button, Tile, AILabel, AILabelContent, AILabelActions } from '@carbon/react';
import { ArrowUp, View } from '@carbon/icons-react';
import './CaseInformation.css';
import casesData from '../cases.json';
import AppHeader from '../components/AppHeader';
import CaseHeader from '../components/CaseHeader';
import CaseDetails from '../components/CaseDetails';
import CaseNavigation from '../components/CaseNavigation';
import { getDisplayStatus } from '../utils/caseStatusUtils';

function CaseInformation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const caseData = casesData.find(c => c.CaseID === id);
  const [currentCaseStatus, setCurrentCaseStatus] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);
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
          <Column sm={4} md={8} lg={8} className="cds--lg:col-start-4">
            {/* AI Case Summary Tile - just playing with ideas, commented out  */}
            {/* <Tile
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
              style={{ marginBottom: '1rem' }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 400, lineHeight: 1.4, margin: 0, marginBottom: '1rem' }}>
                Case summary
              </h3>
              
              <p style={{ 
                fontSize: '0.875rem', 
                lineHeight: 1.43, 
                marginBottom: '1.5rem',
                color: 'var(--cds-text-secondary)'
              }}>
                This case involves a {caseData.CaseType.toLowerCase()} submitted by {caseData.SubmittedBy}. 
                The case was received on {caseData.ReceivedDate} and is currently in {currentCaseStatus} status. 
                Initial assessment indicates standard processing requirements with no immediate compliance concerns identified.
              </p>

              <div style={{ 
                display: 'flex', 
                gap: '2rem',
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
                    Data quality
                  </div>
                  <div style={{ 
                    fontSize: '2rem', 
                    fontWeight: 300,
                    lineHeight: 1.19,
                    color: 'var(--cds-text-primary)'
                  }}>
                    85%
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
                    fontSize: '2rem', 
                    fontWeight: 300,
                    lineHeight: 1.19,
                    color: 'var(--cds-text-primary)'
                  }}>
                    92%
                  </div>
                </div>
              </div>
            </Tile> */}

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
