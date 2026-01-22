import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Content,
  Grid, 
  Column, 
  Theme,
  Breadcrumb,
  BreadcrumbItem
} from '@carbon/react';
import AppHeader from '../components/AppHeader';
import OrganisationHeader from '../components/OrganisationHeader';
import CaseSection from '../components/CaseSection';
import regulatedOrganisationsData from '../data/regulated-organisations.json';
import qualificationsData from '../data/organisation-qualifications-data.json';

function OrganisationQualificationDetail() {
  const { rnNumber, accreditationNumber } = useParams();
  const navigate = useNavigate();
  const [organisationData, setOrganisationData] = useState(null);
  const [qualificationData, setQualificationData] = useState(null);

  useEffect(() => {
    const org = regulatedOrganisationsData.find(o => o.RNNumber === rnNumber);
    setOrganisationData(org);

    if (accreditationNumber) {
      const decodedAccreditationNumber = decodeURIComponent(accreditationNumber);
      console.log('Looking for:', { rnNumber, decodedAccreditationNumber });
      const qual = qualificationsData.find(q => 
        q.rnNumber === rnNumber && q.accreditationNumber === decodedAccreditationNumber
      );
      console.log('Found qualification:', qual);
      setQualificationData(qual);
    }
  }, [rnNumber, accreditationNumber]);

  if (!organisationData || !qualificationData) {
    return (
      <Theme theme="white" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppHeader />
        <Content style={{ 
          width: '100%',
          margin: '0 auto',
          flex: 1,
          padding: '1rem'
        }}>
          <div>Loading...</div>
        </Content>
      </Theme>
    );
  }

  const mainDetailsSection = {
    title: 'Main Details',
    fields: [
      { key: 'accreditationNumber', label: 'Accreditation Number' },
      { key: 'title', label: 'Title' },
      { key: 'type', label: 'Type' },
      { key: 'level', label: 'Level' },
      { key: 'status', label: 'Status' },
      { key: 'totalQualificationTime', label: 'Total Qualification Time (TQT)' },
      { key: 'guidedLearningHours', label: 'Guided Learning Hours (GLH)' },
      { key: 'gradingType', label: 'Grading Type' },
      { key: 'availability', label: 'Availability' },
      { key: 'ssa', label: 'SSA' },
      { key: 'specialistPathway', label: 'Specialist Pathway' }
    ]
  };

  const datesSection = {
    title: 'Dates',
    fields: [
      { key: 'operationalStartDate', label: 'Operational Start Date' },
      { key: 'operationalEndDate', label: 'Operational End Date' },
      { key: 'certificationEndDate', label: 'Certification End Date' }
    ]
  };

  return (
    <Theme theme="white" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <Content style={{ 
        width: '100%',
        margin: '0 auto',
        flex: 1,
        padding: 0,
        paddingTop: '1em'
      }}>
        <Grid fullWidth columns={16} mode="narrow" gutter={16}>
          <Column sm={4} md={8} lg={16}>
            <OrganisationHeader 
              organisationData={organisationData}
              activePage="qualifications"
            />
          </Column>
          
          <Column sm={4} md={8} lg={12} xlg={10}>
            <h2 style={{ marginBottom: '2rem' }}>
              {qualificationData.title}
            </h2>

            <CaseSection
              section={mainDetailsSection}
              data={qualificationData}
            />

            <CaseSection
              section={datesSection}
              data={qualificationData}
            />
          </Column>
        </Grid>
      </Content>
    </Theme>
  );
}

export default OrganisationQualificationDetail;
