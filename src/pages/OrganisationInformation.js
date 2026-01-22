import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Content, Grid, Column, Theme } from '@carbon/react';
import AppHeader from '../components/AppHeader';
import OrganisationHeader from '../components/OrganisationHeader';
import CaseSection from '../components/CaseSection';
import regulatedOrganisationsData from '../data/regulated-organisations.json';

function OrganisationInformation() {
  const { rnNumber } = useParams();
  const [organisationData, setOrganisationData] = useState(null);

  useEffect(() => {
    // Find organisation by RN number
    const org = regulatedOrganisationsData.find(o => o.RNNumber === rnNumber);
    setOrganisationData(org);
  }, [rnNumber]);

  if (!organisationData) {
    return (
      <Theme theme="white" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppHeader />
        <Content style={{ width: '100%', margin: '0 auto', flex: 1, padding: '1rem' }}>
          <div>Loading...</div>
        </Content>
      </Theme>
    );
  }

  // Main Details section
  const mainDetailsSection = {
    title: 'Main Details',
    dataSource: { text: 'Ofqual Register', href: '#' },
    fields: [
      { key: 'Name', label: 'Organisation name', type: 'text' },
      { key: 'LegalName', label: 'Legal name', type: 'text' },
      { key: 'Acronym', label: 'Acronym', type: 'text' },
      { key: 'RNNumber', label: 'RN number', type: 'text' },
      { key: 'PortfolioLead', label: 'Portfolio lead', type: 'text' },
      { key: 'Website', label: 'Website', type: 'url' },
      { key: 'Email', label: 'Email', type: 'email' }
    ]
  };

  // Ofqual Recognition section
  const ofqualRecognitionSection = {
    title: 'Ofqual Recognition',
    dataSource: { text: 'Ofqual Register', href: '#' },
    fields: [
      { key: 'OfqualRecognitionStatus', label: 'Status', type: 'text' },
      { key: 'OfqualRecognisedFrom', label: 'Recognised from', type: 'date' }
    ]
  };

  // CCEA Recognition section
  const cceaRecognitionSection = {
    title: 'CCEA Recognition',
    dataSource: { text: 'Ofqual Register', href: '#' },
    fields: [
      { key: 'CCEARecognitionStatus', label: 'Status', type: 'text' },
      { key: 'CCEARecognisedFrom', label: 'Recognised from', type: 'date' },
      { key: 'CCEARecognitionNumber', label: 'Recognition number', type: 'text' }
    ]
  };

  // Companies House Registration section
  const companiesHouseRegistrationSection = {
    title: 'Registration',
    dataSource: { text: 'Companies House', href: '#' },
    fields: [
      { key: 'CompanyNumber', label: 'Company number', type: 'text' },
      { key: 'CompanyStatus', label: 'Company status', type: 'text' },
      { key: 'CompanyType', label: 'Company type', type: 'text' },
      { key: 'RegisteredOfficeAddress', label: 'Registered office address', type: 'text' },
      { key: 'IncorporatedOn', label: 'Incorporated on', type: 'date' }
    ]
  };

  // Companies House Accounts section
  const companiesHouseAccountsSection = {
    title: 'Accounts',
    dataSource: { text: 'Companies House', href: '#' },
    fields: [
      { key: 'NextAccountsMadeUpTo', label: 'Next accounts made up to', type: 'date' },
      { key: 'NextAccountsDueBy', label: 'Next accounts due by', type: 'date' },
      { key: 'LastAccountsMadeUpTo', label: 'Last accounts made up to', type: 'date' }
    ]
  };

  // Companies House Officers section
  const companiesHouseOfficersSection = {
    title: 'Current Officers',
    dataSource: { text: 'Companies House', href: '#' },
    fields: organisationData.officers ? organisationData.officers.map((officer, index) => ({
      key: `officers[${index}]`,
      label: officer.name,
      type: 'custom',
      render: () => `${officer.role} - Appointed ${new Date(officer.appointedOn).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
    })) : []
  };

  // Companies House PSC section
  const companiesHousePSCSection = {
    title: 'Active Persons with Significant Control',
    dataSource: { text: 'Companies House', href: '#' },
    fields: organisationData.personsWithSignificantControl ? organisationData.personsWithSignificantControl.map((psc, index) => ({
      key: `personsWithSignificantControl[${index}]`,
      label: psc.name,
      type: 'custom',
      render: () => psc.natureOfControl
    })) : []
  };

  return (
    <Theme theme="white" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <Content style={{ width: '100%', margin: '0 auto', flex: 1, padding: 0, paddingTop: '1em' }}>
        <Grid fullWidth columns={16} mode="narrow" gutter={16}>
          <Column sm={4} md={8} lg={16}>
            <OrganisationHeader 
              organisationData={organisationData}
              activePage="information"
            />
          </Column>
          <Column sm={4} md={8} lg={12} xlg={10}>
            <CaseSection
              section={mainDetailsSection}
              data={organisationData}
            />

            <CaseSection
              section={ofqualRecognitionSection}
              data={organisationData}
            />

            <CaseSection
              section={cceaRecognitionSection}
              data={organisationData}
            />

            <CaseSection
              section={companiesHouseRegistrationSection}
              data={organisationData}
            />

            <CaseSection
              section={companiesHouseAccountsSection}
              data={organisationData}
            />

            <CaseSection
              section={companiesHouseOfficersSection}
              data={organisationData}
            />

            <CaseSection
              section={companiesHousePSCSection}
              data={organisationData}
            />
          </Column>
        </Grid>
      </Content>
    </Theme>
  );
}

export default OrganisationInformation;
