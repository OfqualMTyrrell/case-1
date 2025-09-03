import React from 'react';

/**
 * Get the value from data using the field configuration
 */
export const getFieldValue = (data, field) => {
  if (!data) return null;
  
  switch (field.type) {
    case 'nested':
      return getNestedValue(data, field.path);
    case 'address':
      return composeAddress(data, field.compose);
    case 'compose':
      return composeFields(data, field.compose);
    default:
      return data[field.key];
  }
};

/**
 * Get nested value from object using dot notation path
 */
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
};

/**
 * Compose address from multiple fields
 */
const composeAddress = (data, fields) => {
  if (!fields || !Array.isArray(fields)) return null;
  
  const addressParts = fields
    .map(field => data[field])
    .filter(Boolean);
    
  return addressParts.length > 0 ? addressParts.join(', ') : null;
};

/**
 * Compose value from multiple fields
 */
const composeFields = (data, fields) => {
  if (!fields || !Array.isArray(fields)) return null;
  
  const parts = fields
    .map(field => data[field])
    .filter(Boolean);
    
  return parts.length > 0 ? parts.join(' ') : null;
};

/**
 * Render field value based on field type
 */
export const renderFieldValue = (value, field) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  switch (field.type) {
    case 'multiline':
      return renderMultilineText(value);
    case 'files':
      return renderFiles(value);
    case 'address':
      return renderMultilineText(value.replace(/, /g, '\n'));
    case 'email':
      return renderEmail(value);
    case 'url':
      return renderUrl(value);
    case 'phone':
      return renderPhone(value);
    case 'date':
      return renderDate(value);
    case 'array':
      return renderArray(value);
    default:
      // Check if the value is an array of simple values (not objects), regardless of field type
      if (Array.isArray(value) && value.length > 0 && typeof value[0] !== 'object') {
        return renderArray(value);
      }
      return renderText(value);
  }
};

/**
 * Render multiline text with proper line breaks
 */
const renderMultilineText = (text) => {
  if (!text) return null;
  
  return text.split(/\r\n|\n/).map((line, index) => (
    <React.Fragment key={index}>
      {line}
      {index < text.split(/\r\n|\n/).length - 1 && <br />}
    </React.Fragment>
  ));
};

/**
 * Render files as clickable links
 */
const renderFiles = (files) => {
  if (!files || !Array.isArray(files) || files.length === 0) {
    return null;
  }
  
  return (
    <div>
      {files.map((file, index) => (
        <div key={index} style={{ marginBottom: '0.25rem' }}>
          <a 
            href="#" 
            style={{ 
              wordBreak: 'break-all', 
              color: 'var(--cds-link-primary, #0f62fe)', 
              textDecoration: 'underline' 
            }}
          >
            {file.name || file}
          </a>
        </div>
      ))}
    </div>
  );
};

/**
 * Render email as clickable link
 */
const renderEmail = (email) => {
  return (
    <a 
      href={`mailto:${email}`} 
      style={{ 
        color: 'var(--cds-link-primary, #0f62fe)', 
        textDecoration: 'underline' 
      }}
    >
      {email}
    </a>
  );
};

/**
 * Render URL as clickable link
 */
const renderUrl = (url) => {
  const fullUrl = url.startsWith('http') ? url : `https://${url}`;
  return (
    <a 
      href={fullUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      style={{ 
        color: 'var(--cds-link-primary, #0f62fe)', 
        textDecoration: 'underline' 
      }}
    >
      {url}
    </a>
  );
};

/**
 * Render phone as clickable link
 */
const renderPhone = (phone) => {
  return (
    <a 
      href={`tel:${phone}`}
      style={{ 
        color: 'var(--cds-link-primary, #0f62fe)', 
        textDecoration: 'underline' 
      }}
    >
      {phone}
    </a>
  );
};

/**
 * Render date in DD/MM/YYYY format
 */
const renderDate = (date) => {
  try {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return date;
  }
};

/**
 * Render array as line-separated list
 */
const renderArray = (array) => {
  if (!Array.isArray(array)) return array;
  
  if (array.length === 0) return null;
  
  return array.map((item, index) => (
    <React.Fragment key={index}>
      {String(item)}
      {index < array.length - 1 && <br />}
    </React.Fragment>
  ));
};

/**
 * Render plain text
 */
const renderText = (text) => {
  return String(text);
};
