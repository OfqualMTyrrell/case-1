import React, { useState, useEffect } from 'react';
import { ContainedList, ContainedListItem } from '@carbon/react';
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
      <ContainedList kind="on-page">
        <ContainedListItem>
          <span>Case not found.</span>
        </ContainedListItem>
      </ContainedList>
    );
  }

  return (
    <div>
      {/* Always show basic case details */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ 
          fontSize: '1.25rem', 
          marginBottom: '1rem', 
          marginTop: '0.5rem',
          fontWeight: 400 
        }}>
          Case Details
        </h2>
        <ContainedList kind="on-page">
          {caseDetailsFields.map(field => {
            const value = caseData[field.key];
            if (!value) return null;

            return (
              <ContainedListItem key={field.key}>
                <div style={{ display: 'flex', width: '100%', alignItems: 'flex-start', gap: '1rem' }}>
                  <span style={{ 
                    fontWeight: 600, 
                    width: '240px', 
                    flexShrink: 0, 
                    textAlign: 'left',
                    wordWrap: 'break-word',
                    hyphens: 'auto',
                    lineHeight: '1.4'
                  }}>
                    {field.label}
                  </span>
                  <span style={{ 
                    textAlign: 'left', 
                    flexGrow: 1,
                    wordWrap: 'break-word',
                    lineHeight: '1.4'
                  }}>
                    {value}
                  </span>
                </div>
              </ContainedListItem>
            );
          })}
        </ContainedList>
      </div>

      {/* Show case type specific sections if available */}
      {sections.length > 0 && caseTypeData && (
        <div>
          {sections.map((section, index) => (
            <CaseSection
              key={`${section.title}-${index}`}
              section={section}
              data={caseTypeData}
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
