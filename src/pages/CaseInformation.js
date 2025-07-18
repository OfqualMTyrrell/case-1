import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Content, Grid, Column, ContainedList, ContainedListItem, Theme, Button, Link, Breadcrumb, BreadcrumbItem, ProgressIndicator, ProgressStep, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import './CaseInformation.css';
import casesData from '../cases.json';
import applicationData from '../data/application-data.json';
import AppHeader from '../components/AppHeader';
import '@carbon/styles/css/styles.css';

const fieldLabels = [
    {
        title: 'Case Details',
        fields: [
            { key: 'CaseID', label: 'Case ID' },
            { key: 'ReceivedDate', label: 'Received date' },
            { key: 'CaseLead', label: 'Case lead' },
            { key: 'LastUpdatedDate', label: 'Last updated date' },
        ]
    }
];


// Section definitions for recognition application (OFQ-1005)
const recognitionSections = [
  {
    title: 'Applicant Details',
    fields: [
      { key: 'fullName', label: 'Full name' },
      { key: 'emailAddress', label: 'Email address' },
      { key: 'phoneNumber', label: 'Phone number' },
      { key: 'jobRole', label: 'Job role' },
    ]
  },
  {
    title: 'Organisation Details',
    fields: [
      { key: 'organisationName', label: 'Organisation name' },
      { key: 'legalName', label: 'Legal name' },
      { key: 'acronym', label: 'Acronym' },
      { key: 'website', label: 'Website' },
      {
        key: 'addressCombined',
        label: 'Address',
        render: (data) => [
          data.addressLine1,
          data.addressLine2,
          data.addressLine3,
          data.townCity,
          data.postcode,
          data.country
        ].filter(Boolean).join(', ')
      },
    ]
    },
    {
    title: 'Organisation registration',
    fields: [
      { key: 'typeOfOrganisation', label: 'Type of organisation' },
      { key: 'registeredCompanyNumber', label: 'Registered company number' },
      { key: 'registeredCharityNumber', label: 'Registered charity number' },
      { key: 'registeredCountry', label: 'Registered country' },
      { key: 'otherCountryNumber', label: 'Other country number' },
    ]
  },
  {
    title: 'Application details',
    fields: [
        { key: 'qualifications', label: 'Qualifications' },
        { key: 'whyRegulated', label: 'Why regulated?' },
    ]
  },
  {
    title: 'Criteria A',
    fields: [
      { key: 'criteriaA1to3', label: 'Criteria A.1-A.3' },
      { key: 'criteriaA4', label: 'Criteria A.4' },
      { key: 'criteriaA5', label: 'Criteria A.5' },
      { key: 'criteriaA6', label: 'Criteria A.6' },
      { key: 'criteria-a-files', label: 'Criteria A files' },
      { key: 'fileMeta', label: 'File meta' },
    ]
  },
  {
    title: 'Criteria B',
    fields: [
      { key: 'criteriaB1', label: 'Criteria B.1 declaration' },
      { key: 'criteriaB2', label: 'Criteria B.2 declaration' },
    ]
  },
  {
    title: 'Criteria C',
    fields: [
      { key: 'criterionc1a', label: 'Criterion C.1(a)' },
      { key: 'criterionc1b', label: 'Criterion C.1(b)' },
      { key: 'criteria-c-files', label: 'Criteria C Files' },
    ]
  },
  {
    title: 'Criteria D',
    fields: [
      { key: 'criteriond1a', label: 'Criterion D.1(a)' },
      { key: 'criteriond1b', label: 'Criterion D.1(b)' },
      { key: 'criteriond1c', label: 'Criterion D.1(c)' },
      { key: 'criteria-d-files', label: 'Criteria D files' },
    ]
  }
];

const caseDetailsSection = {
    title: 'Case details',
    fields: [
        { key: 'CaseID', label: 'Case ID' },
        { key: 'ReceivedDate', label: 'Received date' },
        { key: 'CaseLead', label: 'Case lead' },
        { key: 'LastUpdatedDate', label: 'Last updated date' },
    ]
};


function CaseInformation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const caseData = casesData.find(c => c.CaseID === id);

  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [id]);

  return (
    <Theme theme="g100" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <Content style={{ width: '100%', margin: '0 auto', flex: 1, padding: 0, paddingTop: '1em' }}>
        <Grid fullWidth columns={16} mode="narrow" gutter={16}>
          <Column sm={4} md={4} lg={3}>
            {/* Left nav: hidden on small screens, visible on md/lg */}
            <div style={{ position: 'sticky', top: '2rem', zIndex: 1 }} className="case-nav-list case-nav-lg">
              <ContainedList kind="interactive" style={{ marginTop: '2rem' }}>
                <ContainedListItem onClick={() => {}} className="case-nav-active">Case information</ContainedListItem>
                <ContainedListItem onClick={() => {}}>Tasks</ContainedListItem>
                <ContainedListItem onClick={() => {}}>Messages</ContainedListItem>
                <ContainedListItem onClick={() => {}}>Timeline</ContainedListItem>
              </ContainedList>
            </div>
            {/* Menu button for nav on small screens */}
            <div className="case-nav-sm" style={{ display: 'none', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <OverflowMenu aria-label="Open navigation menu" flipped>
                <OverflowMenuItem itemText="Case information" onClick={() => {}} />
                <OverflowMenuItem itemText="Tasks" onClick={() => {}} />
                <OverflowMenuItem itemText="Messages" onClick={() => {}} />
                <OverflowMenuItem itemText="Timeline" onClick={() => {}} />
              </OverflowMenu>
            </div>
          </Column>
          <Column sm={4} md={8} lg={13}>
            <div style={{ background: 'var(--cds-layer)', padding: '1rem', marginTop: '1em', marginBottom: '1rem', paddingTop: '1em' }}>
              <Breadcrumb style={{ marginBottom: '1rem', paddingTop: '0.5em' }}>
                <BreadcrumbItem href="#" onClick={() => navigate(-1)}>Cases</BreadcrumbItem>
                <BreadcrumbItem isCurrentPage>{caseData ? caseData.Title : 'Case Information'}</BreadcrumbItem>
              </Breadcrumb>
              <h1 style={{ fontSize: '1.5rem', margin: '1rem 0' }}>{caseData ? caseData.Title : 'Case Information'}</h1>
              <ProgressIndicator currentIndex={(() => {
                const statusFlow = ['Received', 'Triage', 'Review', 'Outcome'];
                const status = caseData?.Status?.toLowerCase();
                if (!status) return 0;
                if (status === 'closed') return 4;
                if (status === 'outcome') return 3;
                if (status === 'review') return 2;
                if (status === 'triage') return 1;
                if (status === 'received') return 0;
                return 0;
              })()}>
                <ProgressStep label="Received" />
                <ProgressStep label="Triage" />
                <ProgressStep label="Review" />
                <ProgressStep label="Outcome" />
              </ProgressIndicator>
            </div>
          </Column>
          <Column sm={4} md={8} lg={8} className="cds--lg:col-start-4">
            {/* Case details section */}
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', marginTop: '0.5rem' }}>{caseDetailsSection.title}</h2>
              <ContainedList kind="on-page">
                {caseData ? (
                  caseDetailsSection.fields.map(field => (
                    <ContainedListItem key={field.key}>
                      <div style={{ display: 'flex', width: '100%' }}>
                        <span style={{ fontWeight: 600, minWidth: '196px', flexShrink: 0, textAlign: 'left' }}>{field.label}</span>
                        <span style={{ textAlign: 'left', flexGrow: 1, paddingLeft: '1rem' }}>{caseData[field.key]}</span>
                      </div>
                    </ContainedListItem>
                  ))
                ) : (
                  <ContainedListItem>
                    <span>Case not found.</span>
                  </ContainedListItem>
                )}
              </ContainedList>
            </div>

            {/* Application form sections for OFQ-1005 and future case types */}
            {caseData && caseData.CaseID === 'OFQ-1005' && (
              <div style={{ marginTop: '2rem' }}>
                {recognitionSections.map(section => (
                  <div key={section.title} style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', marginTop: '0.5rem' }}>{section.title}</h2>
                    <ContainedList kind="on-page">
                      {section.fields.map(field => {
                        let value = field.render
                          ? field.render(applicationData)
                          : Array.isArray(applicationData[field.key])
                            ? applicationData[field.key].join(', ')
                            : applicationData[field.key];
                        if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
                          return null;
                        }
                        // Render file fields as links, otherwise add line breaks for \r\n
                        const fileFields = [
                          'criteria-a-files',
                          'criteria-c-files',
                          'criteria-d-files'
                        ];
                        let formattedValue;
                        if (fileFields.includes(field.key) && Array.isArray(applicationData[field.key])) {
                          formattedValue = applicationData[field.key].map((file, idx) => (
                            <React.Fragment key={file}>
                              <a href="#" style={{ wordBreak: 'break-all', color: 'var(--cds-link-primary, #0f62fe)', textDecoration: 'underline' }}>{file}</a>
                              {idx < applicationData[field.key].length - 1 ? <br /> : null}
                            </React.Fragment>
                          ));
                        } else if (typeof value === 'string') {
                          formattedValue = value.split(/\r\n/).map((line, idx) => (
                            <React.Fragment key={idx}>
                              {line}
                              {idx < value.split(/\r\n/).length - 1 ? <br /> : null}
                            </React.Fragment>
                          ));
                        } else {
                          formattedValue = value;
                        }
                        return (
                          <ContainedListItem key={field.key}>
                            <div style={{ display: 'flex', width: '100%' }}>
                              <span style={{ fontWeight: 600, minWidth: '196px', flexShrink: 0, textAlign: 'left' }}>{field.label}</span>
                              <span style={{ textAlign: 'left', flexGrow: 1, paddingLeft: '1rem' }}>{formattedValue}</span>
                            </div>
                          </ContainedListItem>
                        );
                      })}
                    </ContainedList>
                  </div>
                ))}
              </div>
            )}

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
