import caseTypeSections from '../config/case-type-sections.json';

// Dynamic imports for data files
const dataFiles = {
  'application-data.json': () => import('../data/application-data.json'),
  'statement-of-compliance-data.json': () => import('../data/statement-of-compliance-data.json'),
  'complaint-data.json': () => import('../data/complaint-data.json'),
  'information-request-data.json': () => import('../data/information-request-data.json'),
  'expansion-application-data.json': () => import('../data/expansion-application-data.json'),
};

/**
 * Convert case type string to configuration key
 */
const normalizeKeyName = (caseType) => {
  return caseType.toLowerCase().replace(/\s+/g, '-');
};

/**
 * Get case type configuration
 */
export const getCaseTypeConfig = (caseType) => {
  const key = normalizeKeyName(caseType);
  return caseTypeSections[key] || null;
};

/**
 * Load data for a specific case type
 */
export const loadCaseTypeData = async (caseType) => {
  const config = getCaseTypeConfig(caseType);
  if (!config || !config.dataFile) {
    return {};
  }

  try {
    const dataFileLoader = dataFiles[config.dataFile];
    if (!dataFileLoader) {
      console.warn(`Data file ${config.dataFile} not found for case type ${caseType}`);
      return {};
    }

    const module = await dataFileLoader();
    return module.default || module;
  } catch (error) {
    console.error(`Error loading data for case type ${caseType}:`, error);
    return {};
  }
};

/**
 * Get sections configuration for a case type
 */
export const getCaseTypeSections = (caseType) => {
  const config = getCaseTypeConfig(caseType);
  return config ? config.sections : [];
};

/**
 * Get all supported case types
 */
export const getSupportedCaseTypes = () => {
  return Object.keys(caseTypeSections);
};

/**
 * Check if a case type is supported
 */
export const isCaseTypeSupported = (caseType) => {
  const key = normalizeKeyName(caseType);
  return key in caseTypeSections;
};
