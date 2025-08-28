import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Content, Grid, Column, Theme, Button, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import './CaseInformation.css';
import casesData from '../cases.json';
import AppHeader from '../components/AppHeader';
import CaseHeader from '../components/CaseHeader';
import CaseDetails from '../components/CaseDetails';
import { getDisplayStatus } from '../utils/caseStatusUtils';
import '@carbon/styles/css/styles.css';

function CaseInformation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const caseData = casesData.find(c => c.CaseID === id);
  const [currentCaseStatus, setCurrentCaseStatus] = useState('');

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
      <Theme theme="g100" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppHeader />
        <Content style={{ width: '100%', margin: '0 auto', flex: 1, padding: '1rem' }}>
          <div>Case not found</div>
        </Content>
      </Theme>
    );
  }

  return (
    <Theme theme="g100" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <Content style={{ width: '100%', margin: '0 auto', flex: 1, padding: 0, paddingTop: '1em' }}>
        <Grid fullWidth columns={16} mode="narrow" gutter={16}>
          <Column sm={4} md={4} lg={3}>
            {/* Left nav: hidden on small screens, visible on md/lg */}
            <div style={{ position: 'sticky', top: '2rem', zIndex: 1 }} className="case-nav-list case-nav-lg">
              <div style={{ marginTop: '2rem' }}>
                {/* Navigation would go here if needed */}
              </div>
            </div>
            {/* Menu button for nav on small screens */}
            <div className="case-nav-sm" style={{ display: 'none', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <OverflowMenu aria-label="Open navigation menu" flipped>
                <OverflowMenuItem itemText="Case information" onClick={() => {}} />
                <OverflowMenuItem itemText="Tasks" onClick={() => navigate(`/case/${caseData.CaseID}/tasks`)} />
                <OverflowMenuItem itemText="Messages" onClick={() => {}} />
                <OverflowMenuItem itemText="Timeline" onClick={() => {}} />
              </OverflowMenu>
            </div>
          </Column>
          <Column sm={4} md={8} lg={13}>
            <CaseHeader 
              caseData={caseData}
              currentCaseStatus={currentCaseStatus}
              currentPageTitle={caseData?.Title}
            />
          </Column>
          <Column sm={4} md={8} lg={8} className="cds--lg:col-start-4">
            <CaseDetails caseData={caseData} />

            <Button style={{ marginTop: '2rem' }} onClick={() => navigate(-1)}>
              Back to Case List
            </Button>
          </Column>
        </Grid>
      </Content>
    </Theme>
  );
}

export default CaseInformation;
