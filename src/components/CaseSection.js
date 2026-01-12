import React from 'react';
import { 
  StructuredListWrapper,
  StructuredListBody,
  StructuredListRow,
  StructuredListCell
} from '@carbon/react';
import { getFieldValue, renderFieldValue } from '../utils/fieldRenderer';

const CaseSection = ({ section, data, style = {}, sectionId }) => {
  if (!section || !section.fields || section.fields.length === 0) {
    return null;
  }

  // Filter out fields that have no data
  const fieldsWithData = section.fields.filter(field => {
    const value = getFieldValue(data, field);
    return value !== null && value !== undefined && value !== '' && 
           !(Array.isArray(value) && value.length === 0);
  });

  // Don't render section if no fields have data
  if (fieldsWithData.length === 0) {
    return null;
  }

  // Generate section ID if not provided
  const id = sectionId || section.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  return (
    <div id={id} style={{ marginBottom: '2rem', scrollMarginTop: '5rem', ...style }}>
      <h2 style={{ 
        fontSize: '1.25rem', 
        marginBottom: '1rem', 
        marginTop: '0.5rem',
        fontWeight: 400 
      }}>
        {section.title}
      </h2>
      <StructuredListWrapper>
        <StructuredListBody>
          {fieldsWithData.map(field => {
            const value = getFieldValue(data, field);
            const renderedValue = renderFieldValue(value, field);
            
            if (renderedValue === null) {
              return null;
            }

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
                  {renderedValue}
                </StructuredListCell>
              </StructuredListRow>
            );
          })}
        </StructuredListBody>
      </StructuredListWrapper>
    </div>
  );
};

export default CaseSection;
