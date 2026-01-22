import React from 'react';
import { 
  StructuredListWrapper,
  StructuredListBody,
  StructuredListRow,
  StructuredListCell,
  Link
} from '@carbon/react';
import { ArrowRight } from '@carbon/icons-react';
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

  // Separate files fields from regular fields
  const filesFields = fieldsWithData.filter(field => field.type === 'files');
  const regularFields = fieldsWithData.filter(field => field.type !== 'files');

  return (
    <div id={id} style={{ marginBottom: '2rem', scrollMarginTop: '5rem', ...style }}>
      <h2 style={{ 
        fontSize: '1.25rem', 
        marginBottom: '1rem', 
        marginTop: '0.5rem',
        fontWeight: 400,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline'
      }}>
        <span>{section.title}</span>
        {section.dataSource && (
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 400
          }}>
            {typeof section.dataSource === 'object' ? (
              <Link 
                href={section.dataSource.href} 
                target="_blank" 
                rel="noopener noreferrer"
                renderIcon={ArrowRight}
              >
                {section.dataSource.text}
              </Link>
            ) : (
              <span style={{ color: '#6f6f6f', fontStyle: 'italic' }}>
                {section.dataSource}
              </span>
            )}
          </span>
        )}
      </h2>
      
      {/* Render regular fields in structured list */}
      {regularFields.length > 0 && (
        <StructuredListWrapper>
          <StructuredListBody>
            {regularFields.map(field => {
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
      )}

      {/* Render files fields outside structured list for full-width layout */}
      {filesFields.map(field => {
        const value = getFieldValue(data, field);
        const renderedValue = renderFieldValue(value, field);
        
        if (renderedValue === null) {
          return null;
        }

        return (
          <div key={field.key} style={{ marginTop: regularFields.length > 0 ? '1rem' : 0 }}>
            {renderedValue}
          </div>
        );
      })}
    </div>
  );
};

export default CaseSection;
