import React from 'react';
import { ContainedList, ContainedListItem } from '@carbon/react';
import { getFieldValue, renderFieldValue } from '../utils/fieldRenderer';

const CaseSection = ({ section, data, style = {} }) => {
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

  return (
    <div style={{ marginBottom: '2rem', ...style }}>
      <h2 style={{ 
        fontSize: '1.25rem', 
        marginBottom: '1rem', 
        marginTop: '0.5rem',
        fontWeight: 400 
      }}>
        {section.title}
      </h2>
      <ContainedList kind="on-page">
        {fieldsWithData.map(field => {
          const value = getFieldValue(data, field);
          const renderedValue = renderFieldValue(value, field);
          
          if (renderedValue === null) {
            return null;
          }

          return (
            <ContainedListItem key={field.key}>
              <div style={{ display: 'flex', width: '100%' }}>
                <span style={{ 
                  fontWeight: 600, 
                  minWidth: '196px', 
                  flexShrink: 0, 
                  textAlign: 'left' 
                }}>
                  {field.label}
                </span>
                <span style={{ 
                  textAlign: 'left', 
                  flexGrow: 1, 
                  paddingLeft: '1rem' 
                }}>
                  {renderedValue}
                </span>
              </div>
            </ContainedListItem>
          );
        })}
      </ContainedList>
    </div>
  );
};

export default CaseSection;
