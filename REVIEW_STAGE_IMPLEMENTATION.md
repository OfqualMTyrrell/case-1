# Review Stage Implementation - Statement of Compliance

## Overview
The Statement of Compliance review stage has been transformed with 11 new tasks that include:
- **Repeatable question groups** for cross-case checking
- **Dynamic filtering** of cases, risks, and meeting notes by Awarding Organisation and date range
- **Message template** task with editable subject and body fields

## Implementation Summary

### 1. Mock Data Files Created

#### src/data/risks-data.json
- Contains 7 risk records for various AOs (AQA, Pearson, OCR, WJEC)
- Each risk includes: id, aoName, description, riskLevel, dateIdentified, status, mitigation
- All dates fall within the SoC window (November 2025 - November 2026)

#### src/data/meeting-notes-data.json
- Contains 7 meeting records for various AOs
- Each meeting includes: id, aoName, meetingDate, attendees, summary, notes
- All dates fall within the SoC window

### 2. Test Cases Added to cases.json
Added 9 new cases at the end of cases.json:
- **4 AO Enquiry cases**: OFQ-1191 (AQA), OFQ-1192 (Pearson), OFQ-1193 (OCR), OFQ-1194 (WJEC)
- **3 Event Notification cases**: OFQ-1195 (AQA data breach), OFQ-1196 (Pearson system outage), OFQ-1197 (OCR malpractice)
- **1 Complaint case**: OFQ-1198 (AQA)
- **1 Whistleblowing case**: OFQ-1199 (Pearson)

All cases have:
- `AwardingOrganisation` field for filtering
- `ReceivedDate` between November 15, 2025 and January 12, 2026

### 3. Case Filtering Utility (src/utils/caseFilters.js)

Created comprehensive filtering functions:

#### Key Functions:
- `getSoCDateRange()` - Returns hardcoded date range (Nov 2025 - Nov 2026)
- `isWithinSoCWindow(dateStr)` - Checks if a date falls within the SoC window
- `getRelatedCases(aoName, caseTypes)` - Filters cases by AO, case type(s), and date
- `getRelatedEventNotifications(aoName)` - Gets Event Notification cases for an AO
- `getRelatedAOEnquiries(aoName)` - Gets AO Enquiry cases for an AO
- `getRelatedCWMCases(aoName)` - Gets Complaint and Whistleblowing cases for an AO
- `getRelatedRisks(aoName)` - Filters risks by AO and date
- `getRelatedMeetingNotes(aoName)` - Filters meeting notes by AO and date
- `getDynamicOptions(question, aoName)` - Routes to appropriate filter based on question's dynamicOptions.source property

#### Return Format:
All functions return arrays of `{value: id, label: "ID - Description"}` objects compatible with Carbon Select components.

### 4. Task Configuration Updates (src/data/task-config.json)

Replaced 6 old review stage tasks with **11 new tasks**:

#### Task 1: Check Event Notifications
- Radio button: "Are there any Event Notifications that relate to this AO?"
- If yes, repeatable group with:
  - Select dropdown (dynamically filtered Event Notification cases)
  - Textarea for rationale

#### Task 2: Check Risk Log
- Radio button: "Are there any risks that relate to this AO?"
- If yes, repeatable group with:
  - Select dropdown (dynamically filtered risks)
  - Textarea for rationale

#### Task 3: Check AO Enquiries
- Radio button: "Are there any AO Enquiries that relate to this AO?"
- If yes, repeatable group with:
  - Select dropdown (dynamically filtered AO Enquiries)
  - Textarea for rationale

#### Task 4: Check Complaints, Whistleblowing, Malpractice (CWM)
- Radio button: "Are there any CWM cases that relate to this AO?"
- If yes, repeatable group with:
  - Select dropdown (dynamically filtered CWM cases)
  - Textarea for rationale

#### Task 5: Check Recent Meeting Notes
- Radio button: "Are there any meeting notes that relate to this AO?"
- If yes, repeatable group with:
  - Select dropdown (dynamically filtered meeting notes)
  - Textarea for rationale

#### Task 6: Check CCGR Rating
- Radio: "Based on the CCGR, is the rating appropriate?"
- Radio: "Is there any other intelligence that should be considered?"
- If yes to second question, textarea for intelligence details

#### Task 7: Agreement with Declaration
- Radio: "Do you agree with the declaration on current compliance?"
- Textarea: "Provide rationale for current compliance"
- Radio: "Do you agree with the declaration on future compliance?"
- Textarea: "Provide rationale for future compliance"

#### Task 8: Assign RAG Rating
- Select: Red, Red-Amber, Amber, Green-Amber, Green

#### Task 9: Declare Follow-up Actions
- Select dropdown with 6 follow-up types:
  - None required
  - Compliance visit
  - Monitoring visit
  - Request for further information
  - Other (specify)
  - Refer to regulatory action
- Each option shows relevant conditional questions (dates, textareas, radios)

#### Task 10: Review Meeting
- Radio: "Has a review meeting been held with the AO?"

#### Task 11: Send Confirmation Message
- Text input for subject (pre-filled: "Statement of Compliance - Review Outcome")
- Textarea for body (pre-filled with template message including RAG rating placeholder)

### 5. React Component Updates

#### src/pages/TaskDetail.js
**New Features:**
- Imported `useMemo` from React for performance optimization
- Imported `Layer` from Carbon for visual grouping
- Imported `Add` and `TrashCan` icons for add/remove buttons
- Imported `getDynamicOptions` from caseFilters utility

**Key Changes:**
- Updated `handleInputChange()` to parse bracket notation for nested fields:
  - Pattern: `groupId[index].subQuestionId`
  - Stores as arrays of objects: `{"event-notifications": [{event-id: "OFQ-1195", rationale: "text"}, ...]}`
  
- Added `aoName` calculation using `useMemo`:
  - Extracts from `caseData.AwardingOrganisation` or `caseData.SubmittedBy`
  - Used for dynamic option filtering

- Added `renderRepeatableGroup()` function:
  - Renders collapsible groups with add/remove functionality
  - Each instance numbered: "Event Notification 1", "Event Notification 2", etc.
  - Add button with configurable text from `addButtonText` property
  - Remove button (trash icon) for instances above `minInstances`
  - Uses Carbon Layer for visual separation

- Added `renderSubQuestion()` function:
  - Renders questions within repeatable group instances
  - Supports text, textarea, and select types
  - Integrates dynamic options for select fields

- Updated `renderQuestion()` function:
  - Added repeatable-group case to route to `renderRepeatableGroup()`
  - Added dynamic options support for regular select fields
  - Added defaultValue support for pre-filling fields
  - Shows "No options available" when dynamic filter returns empty

- Updated `handleSave()` and `handleSaveOnly()`:
  - Now properly saves arrays of objects (repeatable group data)
  - Maintains array structure in session storage

#### src/pages/TaskCheckAnswers.js
**New Features:**
- Added `formatSubQuestionValue()` helper function
- Updated `getAnswerDisplay()` to handle repeatable groups

**Key Changes:**
- Added repeatable-group case to `getAnswerDisplay()`:
  - Shows "No entries added" if empty array
  - Renders all instances with numbered headings
  - Displays each sub-question's label and formatted value
  - Adds visual separation between instances with borders

- Added `formatSubQuestionValue()` function:
  - Formats sub-question values based on type
  - Handles select (maps value to label)
  - Handles textarea (preserves line breaks)

- Updated validation in `handleSave()`:
  - Checks repeatable groups against `minInstances`
  - Validates that required repeatable groups have entries

- Updated data cleaning:
  - Preserves arrays of objects when saving
  - Maintains repeatable group structure

## Configuration Schema

### Repeatable Group Structure
```json
{
  "id": "event-notifications",
  "type": "repeatable-group",
  "label": "Event Notifications",
  "required": false,
  "conditionalOn": {
    "field": "has-event-notifications",
    "value": "yes"
  },
  "minInstances": 0,
  "addButtonText": "Add another Event Notification",
  "questions": [
    {
      "id": "event-id",
      "type": "select",
      "label": "Select Event Notification",
      "required": true,
      "dynamicOptions": {
        "source": "eventNotifications"
      }
    },
    {
      "id": "rationale",
      "type": "textarea",
      "label": "Rationale for including this notification",
      "required": true,
      "rows": 3
    }
  ]
}
```

### Dynamic Options Structure
```json
{
  "id": "risk-id",
  "type": "select",
  "label": "Select Risk",
  "dynamicOptions": {
    "source": "risks"
  }
}
```

**Supported source values:**
- `eventNotifications` - Filters Event Notification cases
- `aoEnquiries` - Filters AO Enquiry cases
- `cwmCases` - Filters Complaint and Whistleblowing cases
- `risks` - Filters risks from risks-data.json
- `meetingNotes` - Filters meeting notes from meeting-notes-data.json

## Data Storage Format

### Repeatable Groups
Stored as arrays of objects in formData:
```json
{
  "event-notifications": [
    {
      "event-id": "OFQ-1195",
      "rationale": "Significant data breach affecting exam security"
    },
    {
      "event-id": "OFQ-1196",
      "rationale": "System outage during critical marking period"
    }
  ]
}
```

### Regular Fields
Stored as primitive values:
```json
{
  "has-event-notifications": "yes",
  "rag-rating": "amber",
  "message-subject": "Statement of Compliance - Review Outcome"
}
```

## Testing Checklist

To test the implementation:

1. ✅ Navigate to a Statement of Compliance case
2. ✅ Complete triage stage to unlock review stage
3. ✅ Test Task 1 (Event Notifications):
   - Verify dropdown shows filtered cases for the AO
   - Add multiple instances
   - Remove instances
   - Check values are saved correctly
4. ✅ Test Tasks 2-5 (Risks, AO Enquiries, CWM, Meeting Notes):
   - Verify dynamic filtering works for each type
   - Test with different AOs
5. ✅ Test conditional rendering:
   - Verify repeatable groups only show when parent radio is "Yes"
   - Test all conditional logic in Task 9
6. ✅ Test Check Answers page:
   - Verify repeatable groups display with numbering
   - Check all instances show correctly
   - Test edit functionality
7. ✅ Test validation:
   - Try to complete with empty required fields
   - Try to complete without adding required repeatable group entries
8. ✅ Complete all 11 tasks and verify workflow

## Known Limitations

1. **Link parsing not yet implemented**: Case reference links in labels are not yet clickable
2. **Message sending not yet integrated**: Task 11 message is saved but not sent to Messages tab
3. **Date window is hardcoded**: November 2025 - November 2026 (suitable for prototype)
4. **No "back to edit" from within repeatable group**: Must edit entire task to modify a single instance

## Next Steps (Optional Enhancements)

1. **Add link parsing**: Parse `[text](/case/{caseId})` patterns in labels and convert to clickable links
2. **Integrate message sending**: When Task 11 is completed, save message to case Messages tab
3. **Add instance-level editing**: Allow editing individual repeatable group instances
4. **Add validation for sub-questions**: Ensure all sub-questions in repeatable groups are completed
5. **Add confirmation dialog**: When removing repeatable group instances
6. **Performance optimization**: Add debouncing for dynamic option loading

## Technical Notes

### Performance Considerations
- `useMemo` used for aoName calculation to prevent unnecessary recalculations
- Dynamic options cached per question to minimize filtering overhead
- Session storage used for all data persistence (suitable for prototype)

### Browser Compatibility
- Requires modern browser with ES6 support
- Uses Carbon Design System v11 components
- Session storage required for data persistence

### Accessibility
- All Carbon components are accessible by default
- Repeatable groups use semantic HTML with proper heading hierarchy
- Form labels properly associated with inputs
- ARIA attributes preserved from Carbon components

## Summary

The implementation successfully transforms the Statement of Compliance review stage with:
- ✅ 11 new configurable tasks
- ✅ Repeatable question groups with add/remove functionality
- ✅ Dynamic case/risk/meeting filtering by AO and date
- ✅ Message template with pre-filled content
- ✅ Full integration with existing task workflow
- ✅ Check answers page with repeatable group display
- ✅ Validation for required fields and repeatable groups
- ✅ Zero compilation errors

The system is ready for testing and can be extended with additional features as needed.
