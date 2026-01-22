import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Grid,
  Column,
  Content,
  Theme
} from '@carbon/react';
import AppHeader from '../components/AppHeader';
import OrganisationHeader from '../components/OrganisationHeader';
import CaseSection from '../components/CaseSection';
import risksData from '../data/risks-data.json';
import organisationsData from '../data/regulated-organisations.json';

const OrganisationRiskDetail = () => {
  const { rnNumber, riskId } = useParams();
  const [riskData, setRiskData] = useState(null);
  const [organisationData, setOrganisationData] = useState(null);

  useEffect(() => {
    // Decode the riskId in case it was URL-encoded
    const decodedRiskId = decodeURIComponent(riskId);
    
    // Load organisation data
    const organisation = organisationsData.find(org => org.RNNumber === rnNumber);
    setOrganisationData(organisation);

    // Find risk by decoded ID
    if (organisation) {
      const risk = risksData.find(r => r.id === decodedRiskId && r.rnNumber === rnNumber);
      setRiskData(risk);
    }
  }, [rnNumber, riskId]);

  if (!organisationData || !riskData) {
    return (
      <Theme theme="white">
        <Content style={{ width: '100%', margin: '0 auto', flex: 1, padding: 0, paddingTop: '1em' }}>
          <p>Loading...</p>
        </Content>
      </Theme>
    );
  }

  // Define sections for the risk detail page
  const mainDetailsSection = {
    title: 'Risk Details',
    fields: [
      { key: 'id', label: 'Risk ID' },
      { key: 'description', label: 'Description' },
      { key: 'riskLevel', label: 'Risk Level' },
      { key: 'dateIdentified', label: 'Date Identified' },
      { key: 'status', label: 'Status' }
    ]
  };

  const mitigationSection = {
    title: 'Mitigation',
    fields: [
      { key: 'mitigation', label: 'Mitigation Measures' }
    ]
  };

  return (
    <Theme theme="white" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <Content style={{ width: '100%', margin: '0 auto', flex: 1, padding: 0, paddingTop: '1em' }}>
        <Grid fullWidth columns={16}>
          <Column sm={4} md={8} lg={16}>
            <OrganisationHeader organisationData={organisationData} activePage="risks" />
          </Column>

          <Column sm={4} md={8} lg={12} xlg={10}>
            <div style={{ padding: '2rem' }}>
              <h2 style={{ marginBottom: '2rem' }}>{riskData.id}</h2>
              
              <CaseSection 
                section={mainDetailsSection}
                data={riskData}
              />
              
              <div style={{ marginTop: '2rem' }}>
                <CaseSection 
                  section={mitigationSection}
                  data={riskData}
                />
              </div>
            </div>
          </Column>
        </Grid>
      </Content>
    </Theme>
  );
};

export default OrganisationRiskDetail;
