# Configurable Case Information System

## Overview

The case information system is designed to be fully configurable, allowing you to add new case types, sections, and fields without modifying the React components. The system uses a configuration-driven architecture that separates data structure from presentation logic.

## Architecture Components

### 1. Configuration Files
- **`src/config/case-type-sections.json`** - Defines the structure and display configuration for each case type
- **`src/data/[case-type]-data.json`** - Contains example data for each case type

### 2. Core Components
- **`CaseDetails`** - Main component that renders case information using configuration
- **`CaseSection`** - Reusable component that renders individual sections
- **`CaseNavigation`** - Reusable navigation component for case pages

### 3. Utility Functions
- **`fieldRenderer.js`** - Handles rendering different field types consistently
- **`caseTypeService.js`** - Manages configuration loading and data fetching

## Configuration Structure

### Case Type Configuration Format

```json
{
  "case-type-name": {
    "dataFile": "case-data-filename.json",
    "sections": [
      {
        "title": "Section Title",
        "fields": [
          {
            "key": "fieldKey",
            "label": "Field Display Label",
            "type": "field-type",
            "path": "nested.data.path",
            "compose": ["field1", "field2"]
          }
        ]
      }
    ]
  }
}
```

### Field Configuration Properties

| Property | Required | Description | Example |
|----------|----------|-------------|---------|
| `key` | Yes | Unique identifier for the field | `"applicantName"` |
| `label` | Yes | Display label shown in the UI | `"Applicant Name"` |
| `type` | Yes | Field type that determines rendering | `"text"`, `"email"`, `"multiline"` |
| `path` | No | Dot-notation path for nested data | `"applicant.contact.email"` |
| `compose` | No | Array of fields to combine | `["line1", "line2", "city"]` |

## Supported Field Types

### Basic Field Types

| Type | Description | Example Value | Rendered Output |
|------|-------------|---------------|-----------------|
| `text` | Plain text | `"John Smith"` | John Smith |
| `email` | Email address | `"john@example.com"` | [john@example.com](mailto:john@example.com) |
| `phone` | Phone number | `"0123 456 7890"` | [0123 456 7890](tel:01234567890) |
| `url` | Website URL | `"example.com"` | [example.com](https://example.com) |
| `date` | Date value | `"2024-01-15"` | 15 January 2024 |
| `multiline` | Multi-line text | `"Line 1\nLine 2"` | Line 1<br>Line 2 |

### Advanced Field Types

| Type | Description | Configuration | Use Case |
|------|-------------|---------------|----------|
| `nested` | Access nested object data | `"path": "object.property"` | Complex data structures |
| `address` | Compose address from fields | `"compose": ["line1", "line2", "city"]` | Full addresses |
| `files` | Array of file references | Array of file objects | Document attachments |
| `array` | List of items | Array of strings/objects | Multiple values |
| `compose` | Combine multiple fields | `"compose": ["firstName", "lastName"]` | Calculated fields |

## How to Add a New Case Type

### Step 1: Create the Data File

Create a new JSON file in `src/data/` with example data:

```json
// src/data/new-case-type-data.json
{
  "applicant": {
    "name": "Example Organisation",
    "contact": {
      "email": "contact@example.com",
      "phone": "0123 456 7890"
    },
    "address": {
      "line1": "123 Business Street",
      "city": "Business City",
      "postcode": "BC1 2AB"
    }
  },
  "application": {
    "type": "New Application Type",
    "submissionDate": "2024-01-15",
    "status": "In Review"
  },
  "documents": [
    {"name": "Application Form.pdf", "size": "2.1MB"},
    {"name": "Supporting Evidence.docx", "size": "1.8MB"}
  ]
}
```

### Step 2: Add Configuration

Add the case type configuration to `src/config/case-type-sections.json`:

```json
{
  "new-case-type": {
    "dataFile": "new-case-type-data.json",
    "sections": [
      {
        "title": "Applicant Information",
        "fields": [
          {
            "key": "applicant.name",
            "label": "Organisation Name",
            "type": "nested",
            "path": "applicant.name"
          },
          {
            "key": "applicant.contact.email",
            "label": "Contact Email",
            "type": "nested",
            "path": "applicant.contact.email"
          },
          {
            "key": "applicant.address",
            "label": "Address",
            "type": "address",
            "compose": ["applicant.address.line1", "applicant.address.city", "applicant.address.postcode"]
          }
        ]
      },
      {
        "title": "Application Details",
        "fields": [
          {
            "key": "application.type",
            "label": "Application Type",
            "type": "nested",
            "path": "application.type"
          },
          {
            "key": "application.submissionDate",
            "label": "Submission Date",
            "type": "nested",
            "path": "application.submissionDate"
          }
        ]
      },
      {
        "title": "Supporting Documents",
        "fields": [
          {
            "key": "documents",
            "label": "Uploaded Documents",
            "type": "files"
          }
        ]
      }
    ]
  }
}
```

### Step 3: Update Case Data

Add a case with the new type to `src/cases.json`:

```json
{
  "CaseID": "NEW001",
  "Title": "Example New Case",
  "CaseType": "new-case-type",
  "Status": "Open",
  "DateReceived": "2024-01-15",
  "AssignedTo": "Case Officer Name"
}
```

## How to Add New Sections

To add a new section to an existing case type:

1. **Open the configuration file**: `src/config/case-type-sections.json`

2. **Find the case type** you want to modify

3. **Add a new section** to the `sections` array:

```json
{
  "title": "New Section Title",
  "fields": [
    {
      "key": "newField",
      "label": "New Field Label",
      "type": "text"
    }
  ]
}
```

4. **Update the data file** to include the new field data

## How to Add New Fields

To add a new field to an existing section:

1. **Add the field to the section configuration**:

```json
{
  "key": "newFieldKey",
  "label": "New Field Display Label",
  "type": "email"
}
```

2. **Add the corresponding data** to the data file:

```json
{
  "newFieldKey": "example@email.com"
}
```

## Advanced Configuration Examples

### Nested Data Access

For complex nested data structures:

```json
// Data structure
{
  "organisation": {
    "details": {
      "contact": {
        "primary": {
          "email": "primary@example.com"
        }
      }
    }
  }
}

// Field configuration
{
  "key": "organisation.details.contact.primary.email",
  "label": "Primary Contact Email",
  "type": "nested",
  "path": "organisation.details.contact.primary.email"
}
```

### Composed Address Fields

```json
// Data structure
{
  "addressLine1": "123 Business Street",
  "addressLine2": "Suite 100",
  "city": "London",
  "postcode": "SW1A 1AA",
  "country": "United Kingdom"
}

// Field configuration
{
  "key": "fullAddress",
  "label": "Full Address",
  "type": "address",
  "compose": ["addressLine1", "addressLine2", "city", "postcode", "country"]
}
```

### File Attachments

```json
// Data structure
{
  "attachments": [
    {"name": "Document1.pdf", "size": "2.1MB", "uploadDate": "2024-01-15"},
    {"name": "Document2.docx", "size": "1.8MB", "uploadDate": "2024-01-16"}
  ]
}

// Field configuration
{
  "key": "attachments",
  "label": "Attached Documents",
  "type": "files"
}
```

## Best Practices

### Configuration Organization

1. **Group related fields** into logical sections
2. **Use descriptive section titles** that match user expectations
3. **Order fields logically** within sections
4. **Consistent field naming** across case types

### Data Structure

1. **Use nested objects** for related data groupings
2. **Consistent field naming** across different case types
3. **Include all referenced fields** in your data files
4. **Use appropriate data types** (strings, arrays, objects)

### Field Types

1. **Choose appropriate field types** for better user experience
2. **Use `multiline` type** for long text content
3. **Use `nested` type** for complex data structures
4. **Use `compose` type** to combine multiple fields

### Testing

1. **Test all field types** render correctly
2. **Verify nested paths** work with your data structure
3. **Check composed fields** display as expected
4. **Ensure file arrays** are properly formatted

## Troubleshooting

### Common Issues

**Field not displaying**: 
- Check the field key matches the data structure
- Verify the field type is supported
- Ensure nested paths are correct

**Configuration errors**:
- Validate JSON syntax in configuration files
- Check data file references are correct
- Verify all required properties are present

**Rendering issues**:
- Check field type matches data format
- Verify composed field arrays are correct
- Ensure nested paths exist in data

### Debugging Tips

1. **Check browser console** for configuration loading errors
2. **Verify data file loading** in Network tab
3. **Use React DevTools** to inspect component props
4. **Test configuration changes** incrementally

## File Structure Reference

```
src/
├── config/
│   └── case-type-sections.json    # Main configuration file
├── data/
│   ├── application-data.json       # Recognition application data
│   ├── statement-of-compliance-data.json
│   ├── complaint-data.json
│   ├── information-request-data.json
│   └── expansion-application-data.json
├── components/
│   ├── CaseDetails.js             # Main rendering component
│   ├── CaseSection.js            # Section rendering component
│   └── CaseNavigation.js         # Navigation component
├── services/
│   └── caseTypeService.js        # Configuration & data service
└── utils/
    └── fieldRenderer.js          # Field rendering utilities
```

This configurable system provides flexibility to adapt the case information display to different business requirements without code changes, making it maintainable and extensible for future case types and data structures.
