import casesData from '../cases.json';
import risksData from '../data/risks-data.json';
import meetingNotesData from '../data/meeting-notes-data.json';

/**
 * Get the SoC date range (November 2025 - November 2026 for prototype)
 * @returns {Object} { startDate, endDate } as Date objects
 */
export const getSoCDateRange = () => {
  return {
    startDate: new Date('2025-11-01'),
    endDate: new Date('2026-11-30')
  };
};

/**
 * Check if a date string is within the SoC window
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {boolean}
 */
const isWithinSoCWindow = (dateStr) => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const { startDate, endDate } = getSoCDateRange();
  return date >= startDate && date <= endDate;
};

/**
 * Get related cases filtered by case type, AO, and date range
 * @param {string} aoName - Awarding Organisation name
 * @param {string|string[]} caseTypes - Case type(s) to filter by
 * @returns {Array} Array of {value, label} objects for dropdown options
 */
export const getRelatedCases = (aoName, caseTypes) => {
  if (!aoName) return [];
  
  const typesArray = Array.isArray(caseTypes) ? caseTypes : [caseTypes];
  
  const filtered = casesData.filter(c => {
    // Check case type matches
    const typeMatch = typesArray.some(type => 
      c.CaseType?.toLowerCase() === type.toLowerCase()
    );
    if (!typeMatch) return false;
    
    // Check AO matches (check both AwardingOrganisation field and SubmittedBy)
    const aoMatch = c.AwardingOrganisation === aoName || c.SubmittedBy === aoName;
    if (!aoMatch) return false;
    
    // Check date is within SoC window
    return isWithinSoCWindow(c.ReceivedDate);
  });
  
  return filtered.map(c => ({
    value: c.CaseID,
    label: `${c.CaseID} - ${c.Title}`
  }));
};

/**
 * Get related Event Notification cases
 * @param {string} aoName - Awarding Organisation name
 * @returns {Array} Array of {value, label} objects
 */
export const getRelatedEventNotifications = (aoName) => {
  return getRelatedCases(aoName, 'Event Notification');
};

/**
 * Get related AO Enquiry cases
 * @param {string} aoName - Awarding Organisation name
 * @returns {Array} Array of {value, label} objects
 */
export const getRelatedAOEnquiries = (aoName) => {
  return getRelatedCases(aoName, 'AO Enquiry');
};

/**
 * Get related Complaint and Whistleblowing cases
 * @param {string} aoName - Awarding Organisation name
 * @returns {Array} Array of {value, label} objects
 */
export const getRelatedCWMCases = (aoName) => {
  return getRelatedCases(aoName, ['Complaint', 'Whistleblowing']);
};

/**
 * Get related risks for an AO within the SoC window
 * @param {string} aoName - Awarding Organisation name
 * @returns {Array} Array of {value, label} objects
 */
export const getRelatedRisks = (aoName) => {
  if (!aoName) return [];
  
  const filtered = risksData.filter(r => {
    const aoMatch = r.aoName === aoName;
    if (!aoMatch) return false;
    return isWithinSoCWindow(r.dateIdentified);
  });
  
  return filtered.map(r => ({
    value: r.id,
    label: `${r.id} - ${r.description} (${r.riskLevel})`
  }));
};

/**
 * Get related meeting notes for an AO within the SoC window
 * @param {string} aoName - Awarding Organisation name
 * @returns {Array} Array of {value, label} objects
 */
export const getRelatedMeetingNotes = (aoName) => {
  if (!aoName) return [];
  
  const filtered = meetingNotesData.filter(m => {
    const aoMatch = m.aoName === aoName;
    if (!aoMatch) return false;
    return isWithinSoCWindow(m.meetingDate);
  });
  
  return filtered.map(m => ({
    value: m.id,
    label: `${m.id} - ${m.summary} (${new Date(m.meetingDate).toLocaleDateString('en-GB')})`
  }));
};

/**
 * Get dynamic options based on configuration
 * @param {Object} question - Question configuration object
 * @param {string} aoName - Awarding Organisation name
 * @returns {Array} Array of {value, label} objects
 */
export const getDynamicOptions = (question, aoName) => {
  if (!question.dynamicOptions) {
    return question.options || [];
  }
  
  const { source, caseType } = question.dynamicOptions;
  
  switch (source) {
    case 'eventNotifications':
      return getRelatedEventNotifications(aoName);
    case 'aoEnquiries':
      return getRelatedAOEnquiries(aoName);
    case 'cwmCases':
      return getRelatedCWMCases(aoName);
    case 'risks':
      return getRelatedRisks(aoName);
    case 'meetingNotes':
      return getRelatedMeetingNotes(aoName);
    case 'relatedCases':
      return getRelatedCases(aoName, caseType);
    default:
      return question.options || [];
  }
};
