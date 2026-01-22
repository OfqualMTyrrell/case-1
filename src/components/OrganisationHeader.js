import React from 'react';
import { Layer } from '@carbon/react';
import { useNavigate, useLocation } from 'react-router-dom';

function OrganisationHeader({ organisationData, activePage }) {
  const navigate = useNavigate();
  const location = useLocation();
  const rnNumber = organisationData?.RNNumber;

  const tabs = [
    { id: 'information', label: 'Information', path: `/organisations/${rnNumber}` },
    { id: 'cases', label: 'Cases', path: `/organisations/${rnNumber}/cases` },
    { id: 'scope', label: 'Scope', path: `/organisations/${rnNumber}/scope` },
    { id: 'qualifications', label: 'Qualifications', path: `/organisations/${rnNumber}/qualifications` },
    { id: 'risks', label: 'Risks', path: `/organisations/${rnNumber}/risks` },
    { id: 'units', label: 'Units', path: `/organisations/${rnNumber}/units` },
    { id: 'users', label: 'Users', path: `/organisations/${rnNumber}/users` }
  ];

  return (
    <Layer>
      <div style={{ 
        background: 'var(--cds-layer-01)', 
        padding: '2rem 1rem 0rem 1rem',
        marginBottom: '2rem'
      }}>
        {/* Organisation Header */}
        <div style={{ 
          marginBottom: '1rem'
        }}>
          <h1 style={{ 
            fontSize: '2rem',
            fontWeight: 400,
            lineHeight: 1.25,
            marginBottom: '0.5rem',
            marginTop: 0
          }}>
            {organisationData?.Name}
          </h1>
          <div style={{ 
            fontSize: '0.875rem',
            color: 'var(--cds-text-secondary)'
          }}>
            {organisationData?.RNNumber}
          </div>
        </div>

        {/* Line Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem',
          borderBottom: '1px solid var(--cds-border-subtle)',
          paddingBottom: 0
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activePage === tab.id ? '2px solid var(--cds-border-interactive)' : '2px solid transparent',
                color: activePage === tab.id ? 'var(--cds-text-primary)' : 'var(--cds-text-secondary)',
                cursor: 'pointer',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: 400,
                marginBottom: '-1px'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </Layer>
  );
}

export default OrganisationHeader;
