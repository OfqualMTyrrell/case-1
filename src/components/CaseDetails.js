import React, { useState, useEffect } from 'react';
import { 
  StructuredListWrapper,
  StructuredListBody,
  StructuredListRow,
  StructuredListCell
} from '@carbon/react';
import CaseSection from './CaseSection';
import { loadCaseTypeData, getCaseTypeSections, isCaseTypeSupported } from '../services/caseTypeService';

const CaseDetails = ({ caseData }) => {
  const [caseTypeData, setCaseTypeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      if (!caseData || !caseData.CaseType) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Check if case type is supported
        if (isCaseTypeSupported(caseData.CaseType)) {
          // Load data and sections for the case type
          const [data, sectionsConfig] = await Promise.all([
            loadCaseTypeData(caseData.CaseType),
            Promise.resolve(getCaseTypeSections(caseData.CaseType))
          ]);
          
          setCaseTypeData(data);
          setSections(sectionsConfig);
        } else {
          // Unsupported case type - no additional data
          setCaseTypeData({});
          setSections([]);
        }
      } catch (error) {
        console.error('Error loading case type data:', error);
        setCaseTypeData({});
        setSections([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [caseData?.CaseType, caseData?.CaseID]);

  // Case details section (always shown)
  const caseDetailsFields = [
    { key: 'CaseID', label: 'Case ID', type: 'text' },
    { key: 'ReceivedDate', label: 'Received date', type: 'date' },
    { key: 'CaseLead', label: 'Case lead', type: 'text' },
    { key: 'LastUpdatedDate', label: 'Last updated date', type: 'date' }
  ];

  if (loading) {
    return <div>Loading case details...</div>;
  }

  if (!caseData) {
    return (
      <StructuredListWrapper>
        <StructuredListBody>
          <StructuredListRow>
            <StructuredListCell>
              <span>Case not found.</span>
            </StructuredListCell>
          </StructuredListRow>
        </StructuredListBody>
      </StructuredListWrapper>
    );
  }

  // Generate section IDs for anchor links
  const generateSectionId = (title) => {
    return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  // Build list of all sections (Case Details + case type sections)
  const allSections = [
    { title: 'Case Details', id: 'case-details' },
    ...sections.map(section => ({
      title: section.title,
      id: generateSectionId(section.title)
    }))
  ];

  const handleSectionClick = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div>
      {/* Table of Contents */}
      {allSections.length > 1 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ 
            fontSize: '1.25rem', 
            marginBottom: '1rem', 
            marginTop: '0.5rem',
            fontWeight: 400 
          }}>
            Contents
          </h2>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0, 
            margin: 0 
          }}>
            {allSections.map((section, index) => (
              <li key={section.id} style={{ marginBottom: '0.5rem' }}>
                <a
                  href={`#${section.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSectionClick(section.id);
                  }}
                  style={{
                    color: 'var(--cds-link-primary)',
                    textDecoration: 'none',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.textDecoration = 'none';
                  }}
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Always show basic case details */}
      <div id="case-details" style={{ marginBottom: '2rem', scrollMarginTop: '5rem' }}>
        <h2 style={{ 
          fontSize: '1.25rem', 
          marginBottom: '1rem', 
          marginTop: '0.5rem',
          fontWeight: 400 
        }}>
          Case Details
        </h2>
        <StructuredListWrapper>
          <StructuredListBody>
            {caseDetailsFields.map(field => {
              const value = caseData[field.key];
              if (!value) return null;

              return (
                <StructuredListRow key={field.key}>
                  <StructuredListCell style={{ 
                    fontWeight: 600,
                    width: '240px',
                    verticalAlign: 'top',
                    wordWrap: 'break-word',
                    hyphens: 'auto'
                  }}>
                    {field.label}
                  </StructuredListCell>
                  <StructuredListCell style={{ 
                    verticalAlign: 'top',
                    wordWrap: 'break-word'
                  }}>
                    {value}
                  </StructuredListCell>
                </StructuredListRow>
              );
            })}
          </StructuredListBody>
        </StructuredListWrapper>
      </div>

      {/* Show case type specific sections if available */}
      {sections.length > 0 && caseTypeData && (
        <div>
          {sections.map((section, index) => (
            <CaseSection
              key={`${section.title}-${index}`}
              section={section}
              data={caseTypeData}
              sectionId={generateSectionId(section.title)}
            />
          ))}
        </div>
      )}

      {/* Show message for unsupported case types */}
      {sections.length === 0 && isCaseTypeSupported && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#f4f4f4', 
          borderRadius: '4px',
          marginTop: '1rem'
        }}>
          <p style={{ margin: 0, color: '#525252' }}>
            No additional information configured for case type: <strong>{caseData.CaseType}</strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default CaseDetails;
