import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Content, Button, TextArea, Grid, Column, Theme } from '@carbon/react';
import casesData from '../cases.json';
import AppHeader from '../components/AppHeader';
import CaseHeader from '../components/CaseHeader';
import CaseNavigation from '../components/CaseNavigation';

function AddCaseNote() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [description, setDescription] = useState('');

  const caseData = casesData.find(c => c.CaseID === caseId);

  const handleCancel = () => {
    navigate(`/case/${caseId}/history`);
  };

  const handleSave = () => {
    if (!description.trim()) return; // Don't save empty notes

    const now = new Date();
    const dateStr = now.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(',', '');

    const newNote = {
      date: dateStr,
      summary: 'Case note added',
      user: 'Jon Titmus',
      description: description.trim()
    };

    // Add to the case history
    if (caseData) {
      caseData.history.unshift(newNote); // Add to the top
    }

    navigate(`/case/${caseId}/history`);
  };

  if (!caseData) {
    return (
      <div>
        <AppHeader />
        <Content>
          <h2>Case not found</h2>
        </Content>
      </div>
    );
  }

  return (
    <Theme theme="white" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <Content style={{ width: '100%', margin: '0 auto', flex: 1, padding: 0, paddingTop: '1em' }}>
        <Grid fullWidth columns={16} mode="narrow" gutter={16}>
          <Column sm={4} md={4} lg={3}>
            <CaseNavigation caseId={caseId} activePage="history" />
          </Column>
          <Column sm={4} md={8} lg={13}>
            <CaseHeader 
              caseData={caseData}
              breadcrumbs={[
                { 
                  title: caseData.Title, 
                  path: `/case/${caseId}` 
                }
              ]}
              currentPageTitle="History"
            />
          </Column>
          <Column sm={4} md={8} lg={13} className="cds--lg:col-start-4">
            <h2>Add Case Note</h2>
            <TextArea
              placeholder="Enter the case note description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
            />
            <div style={{ marginTop: '1rem' }}>
              <Button kind="secondary" onClick={handleCancel} style={{ marginRight: '1rem' }}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save
              </Button>
            </div>
          </Column>
        </Grid>
      </Content>
    </Theme>
  );
}

export default AddCaseNote;