import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Content, Grid, Column, ContainedList, ContainedListItem, Theme, Button, Link, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import './CaseInformation.css';
import casesData from '../cases.json';
import applicationData from '../data/application-data.json';
import statementOfComplianceData from '../data/statement-of-compliance-data.json';
import complaintData from '../data/complaint-data.json';
import informationRequestData from '../data/information-request-data.json';
import expansionApplicationData from '../data/expansion-application-data.json';
import AppHeader from '../components/AppHeader';
import CaseHeader from '../components/CaseHeader';
import { getDisplayStatus } from '../utils/caseStatusUtils';
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

// Section definitions for Statement of compliance
const statementOfComplianceSections = [
  {
    title: 'Organisation Details',
    fields: [
      { key: 'applicantName', label: 'Organisation name' },
      { key: 'applicantContactName', label: 'Contact person' },
      { key: 'applicantEmail', label: 'Email address' },
      { key: 'applicantPhone', label: 'Phone number' },
      { key: 'organisationDetails.legalName', label: 'Legal name', render: (data) => data.organisationDetails?.legalName },
      { key: 'organisationDetails.companyNumber', label: 'Company number', render: (data) => data.organisationDetails?.companyNumber },
      { key: 'organisationDetails.address', label: 'Address', render: (data) => data.organisationDetails?.address }
    ]
  },
  {
    title: 'Compliance Information',
    fields: [
      { key: 'complianceYear', label: 'Compliance year' },
      { key: 'reportingPeriod', label: 'Reporting period' },
      { key: 'submissionDate', label: 'Submission date' }
    ]
  },
  {
    title: 'Qualification Portfolio',
    fields: [
      { key: 'qualificationPortfolio.totalQualifications', label: 'Total qualifications', render: (data) => data.qualificationPortfolio?.totalQualifications },
      { key: 'qualificationPortfolio.newQualifications', label: 'New qualifications', render: (data) => data.qualificationPortfolio?.newQualifications },
      { key: 'qualificationPortfolio.withdrawnQualifications', label: 'Withdrawn qualifications', render: (data) => data.qualificationPortfolio?.withdrawnQualifications }
    ]
  },
  {
    title: 'Candidate Data',
    fields: [
      { key: 'candidateData.totalCandidates', label: 'Total candidates', render: (data) => data.candidateData?.totalCandidates },
      { key: 'candidateData.newRegistrations', label: 'New registrations', render: (data) => data.candidateData?.newRegistrations },
      { key: 'candidateData.certificatesIssued', label: 'Certificates issued', render: (data) => data.candidateData?.certificatesIssued },
      { key: 'candidateData.passRate', label: 'Pass rate', render: (data) => data.candidateData?.passRate }
    ]
  }
];

// Section definitions for Complaint
const complaintSections = [
  {
    title: 'Complainant Details',
    fields: [
      { key: 'complainantDetails.name', label: 'Name', render: (data) => data.complainantDetails?.name },
      { key: 'complainantDetails.email', label: 'Email', render: (data) => data.complainantDetails?.email },
      { key: 'complainantDetails.phone', label: 'Phone', render: (data) => data.complainantDetails?.phone },
      { key: 'complainantDetails.relationship', label: 'Relationship', render: (data) => data.complainantDetails?.relationship }
    ]
  },
  {
    title: 'Complaint Details',
    fields: [
      { key: 'complaintDetails.dateOfIncident', label: 'Date of incident', render: (data) => data.complaintDetails?.dateOfIncident },
      { key: 'complaintDetails.qualificationName', label: 'Qualification name', render: (data) => data.complaintDetails?.qualificationName },
      { key: 'complaintDetails.assessmentDate', label: 'Assessment date', render: (data) => data.complaintDetails?.assessmentDate },
      { key: 'complaintDetails.assessmentCenter', label: 'Assessment center', render: (data) => data.complaintDetails?.assessmentCenter }
    ]
  },
  {
    title: 'Complaint Summary',
    fields: [
      { key: 'complaintSummary', label: 'Summary' },
      { key: 'detailedComplaint', label: 'Detailed complaint' },
      { key: 'desiredOutcome', label: 'Desired outcome' }
    ]
  }
];

// Section definitions for Information request
const informationRequestSections = [
  {
    title: 'Applicant Details',
    fields: [
      { key: 'applicantDetails.organisationName', label: 'Organisation name', render: (data) => data.applicantDetails?.organisationName },
      { key: 'applicantDetails.contactPerson', label: 'Contact person', render: (data) => data.applicantDetails?.contactPerson },
      { key: 'applicantDetails.position', label: 'Position', render: (data) => data.applicantDetails?.position },
      { key: 'applicantDetails.email', label: 'Email', render: (data) => data.applicantDetails?.email },
      { key: 'applicantDetails.phone', label: 'Phone', render: (data) => data.applicantDetails?.phone }
    ]
  },
  {
    title: 'Request Details',
    fields: [
      { key: 'requestDetails.requestType', label: 'Request type', render: (data) => data.requestDetails?.requestType },
      { key: 'requestDetails.dateOfRequest', label: 'Date of request', render: (data) => data.requestDetails?.dateOfRequest },
      { key: 'requestDetails.urgencyLevel', label: 'Urgency level', render: (data) => data.requestDetails?.urgencyLevel },
      { key: 'requestDetails.legalBasis', label: 'Legal basis', render: (data) => data.requestDetails?.legalBasis }
    ]
  },
  {
    title: 'Information Requested',
    fields: [
      { key: 'informationRequested.dataType', label: 'Data type', render: (data) => data.informationRequested?.dataType },
      { key: 'informationRequested.timeframe', label: 'Timeframe', render: (data) => data.informationRequested?.timeframe },
      { key: 'purposeOfRequest', label: 'Purpose of request' }
    ]
  }
];

// Section definitions for Expansion application
const expansionApplicationSections = [
  {
    title: 'Applicant Details',
    fields: [
      { key: 'applicantDetails.organisationName', label: 'Organisation name', render: (data) => data.applicantDetails?.organisationName },
      { key: 'applicantDetails.contactPerson', label: 'Contact person', render: (data) => data.applicantDetails?.contactPerson },
      { key: 'applicantDetails.position', label: 'Position', render: (data) => data.applicantDetails?.position },
      { key: 'applicantDetails.email', label: 'Email', render: (data) => data.applicantDetails?.email },
      { key: 'applicantDetails.phone', label: 'Phone', render: (data) => data.applicantDetails?.phone }
    ]
  },
  {
    title: 'Current Recognition',
    fields: [
      { key: 'currentRecognitionDetails.currentRecognitionNumber', label: 'Recognition number', render: (data) => data.currentRecognitionDetails?.currentRecognitionNumber },
      { key: 'currentRecognitionDetails.dateOfOriginalRecognition', label: 'Original recognition date', render: (data) => data.currentRecognitionDetails?.dateOfOriginalRecognition },
      { key: 'currentRecognitionDetails.currentScope', label: 'Current scope', render: (data) => data.currentRecognitionDetails?.currentScope },
      { key: 'currentRecognitionDetails.yearsInOperation', label: 'Years in operation', render: (data) => data.currentRecognitionDetails?.yearsInOperation }
    ]
  },
  {
    title: 'Expansion Request',
    fields: [
      { key: 'expansionRequest.proposedNewScope', label: 'Proposed new scope', render: (data) => data.expansionRequest?.proposedNewScope },
      { key: 'expansionRequest.requestedStartDate', label: 'Requested start date', render: (data) => data.expansionRequest?.requestedStartDate },
      { key: 'expansionRequest.businessJustification', label: 'Business justification', render: (data) => data.expansionRequest?.businessJustification },
      { key: 'expansionRequest.newQualificationsProposed', label: 'New qualifications proposed', render: (data) => data.expansionRequest?.newQualificationsProposed }
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

// Helper function to get data and sections based on case type
const getCaseTypeData = (caseType, caseId) => {
  switch (caseType) {
    case 'Recognition application':
      return {
        data: applicationData,
        sections: recognitionSections
      };
    case 'Statement of compliance':
      return {
        data: statementOfComplianceData,
        sections: statementOfComplianceSections
      };
    case 'Complaint':
      return {
        data: complaintData,
        sections: complaintSections
      };
    case 'Information request':
      return {
        data: informationRequestData,
        sections: informationRequestSections
      };
    case 'Expansion application':
      return {
        data: expansionApplicationData,
        sections: expansionApplicationSections
      };
    default:
      return {
        data: {},
        sections: []
      };
  }
};

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
                <ContainedListItem onClick={() => navigate(`/case/${caseData.CaseID}/tasks`)}>Tasks</ContainedListItem>
                <ContainedListItem onClick={() => {}}>Messages</ContainedListItem>
                <ContainedListItem onClick={() => {}}>Timeline</ContainedListItem>
              </ContainedList>
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

            {/* Application form sections for all case types with example data */}
            {caseData && (() => {
              const caseTypeInfo = getCaseTypeData(caseData.CaseType, caseData.CaseID);
              if (caseTypeInfo.sections.length === 0) return null;
              
              return (
                <div style={{ marginTop: '2rem' }}>
                  {caseTypeInfo.sections.map(section => (
                    <div key={section.title} style={{ marginBottom: '2rem' }}>
                      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', marginTop: '0.5rem' }}>{section.title}</h2>
                      <ContainedList kind="on-page">
                        {section.fields.map(field => {
                          let value = field.render
                            ? field.render(caseTypeInfo.data)
                            : Array.isArray(caseTypeInfo.data[field.key])
                              ? caseTypeInfo.data[field.key].join(', ')
                              : caseTypeInfo.data[field.key];
                          if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
                            return null;
                          }
                          // Render file fields as links, otherwise add line breaks for \r\n
                          const fileFields = [
                            'criteria-a-files',
                            'criteria-c-files',
                            'criteria-d-files',
                            'supportingEvidence',
                            'evidenceProvided'
                          ];
                          let formattedValue;
                          if (fileFields.includes(field.key) && Array.isArray(caseTypeInfo.data[field.key])) {
                            formattedValue = caseTypeInfo.data[field.key].map((file, idx) => (
                              <React.Fragment key={file.name || file}>
                                <a href="#" style={{ wordBreak: 'break-all', color: 'var(--cds-link-primary, #0f62fe)', textDecoration: 'underline' }}>
                                  {file.name || file}
                                </a>
                                {idx < caseTypeInfo.data[field.key].length - 1 ? <br /> : null}
                              </React.Fragment>
                            ));
                          } else if (typeof value === 'string') {
                            formattedValue = value.split(/\r\n|\n/).map((line, idx) => (
                              <React.Fragment key={idx}>
                                {line}
                                {idx < value.split(/\r\n|\n/).length - 1 ? <br /> : null}
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
              );
            })()}

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
