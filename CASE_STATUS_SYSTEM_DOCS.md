# Dynamic #### Dynamic Status Engine (`src/utils/caseStatusUtils.js`)
- **Location**: `src/utils/caseStatusUtils.js`
- **Purpose**: Central hub for dynamic case status calculation and data seeding
- **Features**:
  - Real-time case status calculation based on task completion
  - Realistic task data generation based on case status
  - Hybrid display logic (dynamic vs static status)
  - Bulk data seeding for all cases
  - Session storage integration

#### Automatic Seeded Data Loading (`src/utils/seededDataLoader.js`)
- **Location**: `src/utils/seededDataLoader.js` and `src/data/seeded-task-data.json`
- **Purpose**: Automatic loading of realistic task data on app startup
- **Features**:
  - Pre-generated realistic task completion data for all cases (7,000+ entries)
  - Automatic loading on first app visit (no user action required)
  - Non-destructive loading (won't overwrite existing user data)
  - Refresh functionality for admin use
  - Instant prototype setup for user testing

#### AdminDataSeeding Page (`/admin/seed-data`)
- **Location**: `src/pages/AdminDataSeeding.js`
- **Purpose**: Administrative interface for data management
- **Features**:
  - Load pre-seeded data (fast, consistent results)
  - Generate new dynamic data (fresh random patterns)
  - Clear all task data (reset to static statuses)
  - Progress indicator for seeding operations
  - Bulk data generation with visual feedback
  - Real-time progress tracking
  - User-friendly explanations and controlsSeeding System Documentation

## Overview

The dynamic case status and data seeding system provides intelligent case progress tracking based on task completion, with realistic data generation capabilities for prototype testing. This system seamlessly integrates with the task management workflow to provide accurate case status progression and believable demonstration data.

## Features Implemented

### 1. Core Components

#### Dynamic Status Engine (`src/utils/caseStatusUtils.js`)
- **Location**: `src/utils/caseStatusUtils.js`
- **Purpose**: Central hub for dynamic case status calculation and data seeding
- **Features**:
  - Real-time case status calculation based on task completion
  - Realistic task data generation based on case status
  - Hybrid display logic (dynamic vs static status)
  - Bulk data seeding for all cases
  - Session storage integration

#### AdminDataSeeding Page (`/admin/seed-data`)
- **Location**: `src/pages/AdminDataSeeding.js`
- **Purpose**: Administrative interface for data seeding and management
- **Features**:
  - Progress indicator for seeding operations
  - Bulk data generation with visual feedback
  - Clear all data functionality
  - Real-time progress tracking
  - User-friendly explanations and controls

#### Case Status Integration
- **CaseListV2**: Dynamic status display in case table
- **TaskList**: Real-time progress indicator updates
- **TaskDetail**: Live case status progression
- **TaskCheckAnswers**: Immediate status feedback

### 2. Dynamic Status Calculation

#### Status Progression Logic
The system maps task completion to realistic case progression:

**Status Flow**: `Received` → `Triage` → `Review` → `Outcome` → `Closed`

```javascript
// Stage completion determines case status
const calculateCaseStatus = (caseId, taskStatuses = {}) => {
  // Check each stage in order
  for (const stage of stages) {
    const allCompleted = stageTaskStatuses.every(status => status === 'completed');
    const anyInProgress = stageTaskStatuses.some(status => status === 'in-progress' || status === 'completed');
    
    if (!allCompleted) {
      return anyInProgress ? stageName : previousStage;
    }
  }
  return 'Closed'; // All stages completed
};
```

#### Hybrid Display System
The `getDisplayStatus()` function provides intelligent status display:

- **Dynamic Mode**: Uses calculated status when task data exists
- **Static Mode**: Falls back to original JSON status when no task data
- **Real-time Updates**: Automatically refreshes when task statuses change

### 3. Data Seeding System

#### Realistic Data Generation
The seeding system creates believable task completion patterns:

**Case Status Mapping**:
- **Received Cases**: 0% task completion (no tasks started)
- **Triage Cases**: ~25% task completion (triage stage partially complete)
- **Review Cases**: ~75% task completion (triage complete, review in progress)
- **Closed Cases**: 100% task completion (all stages complete)

#### Seeding Process
```javascript
const seedRealisticTaskData = (caseId) => {
  const caseData = casesData.find(c => c.CaseID === caseId);
  const caseStatus = caseData.Status;
  
  // Determine completion targets based on status
  switch (caseStatus) {
    case 'Closed': shouldCompleteStages = ['triage', 'review', 'outcome']; break;
    case 'Review': shouldCompleteStages = ['triage']; shouldStartStages = ['review']; break;
    case 'Triage': shouldStartStages = ['triage']; break;
    case 'Received': 
    default: return; // No tasks completed
  }
  
  // Generate realistic completion patterns
  // Save to session storage
};
```

### 4. Real-time Status Updates

#### Event-Driven Architecture
The system uses multiple mechanisms for real-time updates:

**Storage Events**: Cross-tab synchronization
```javascript
window.addEventListener('storage', handleStorageChange);
```

**Focus Events**: Refresh on tab return
```javascript
window.addEventListener('focus', handleFocus);
```

**Custom Events**: Immediate updates after admin actions
```javascript
window.dispatchEvent(new CustomEvent('caseDataRefresh'));
```

**State Management**: Component-level status tracking
```javascript
const [currentCaseStatus, setCurrentCaseStatus] = useState('');
```

#### Component Integration Pattern
Each component follows a consistent pattern:

1. **State Management**: Track `currentCaseStatus`
2. **Initial Load**: Set status using `getDisplayStatus()`
3. **Event Listeners**: Listen for storage/focus changes
4. **Status Updates**: Recalculate on task changes
5. **UI Updates**: Use dynamic status in progress indicators

### 5. Session Storage Structure

#### Task Status Storage
**Key**: `taskStatuses_${caseId}`
**Format**: 
```json
{
  "triage_check-information": "completed",
  "triage_evidence-review": "in-progress",
  "review_assessment": "not-started"
}
```

#### Task Data Storage
**Key**: `taskData_${caseId}_${stageId}_${taskId}`
**Format**:
```json
{
  "formData": {
    "question-id": "answer-value"
  },
  "isCompleted": true,
  "lastSaved": "2025-08-26T15:30:00.000Z"
}
```

### 6. Admin Interface Features

#### Data Seeding Controls
- **Seed Realistic Data**: Generate completion patterns for all cases
- **Clear All Task Data**: Reset to original static statuses
- **Progress Tracking**: Visual feedback during seeding operations
- **Status Messages**: Success/error notifications

#### Access Methods
1. **Header Admin Panel**: Settings icon → "Seed Realistic Data"
2. **Direct URL**: `/admin/seed-data`
3. **Case List Integration**: Seamless navigation

## Implementation Details

### Status Calculation Performance
- **Lazy Evaluation**: Status calculated only when needed
- **Caching**: Results cached in component state
- **Efficient Updates**: Only recalculate when task data changes

### Error Handling
- **Graceful Degradation**: Falls back to static status on errors
- **Data Validation**: Ensures clean session storage data
- **User Feedback**: Clear error messages in admin interface

### Cross-Component Synchronization
- **Consistent State**: All components show same dynamic status
- **Event Propagation**: Changes trigger updates across components  
- **Storage Persistence**: Data survives page refreshes and navigation

## User Experience Flow

### 1. Initial State (No Task Data)
- **Case List**: Shows original static statuses from JSON
- **Progress Indicators**: Reflect static case status
- **Task Pages**: Clean slate, no completion data

### 2. After Data Seeding
- **Case List**: Immediately shows dynamic statuses
- **Case Details**: Progress indicators reflect task completion
- **Realistic Patterns**: Believable completion based on case stage

### 3. User Task Interaction
- **Real-time Updates**: Status changes as tasks completed
- **Cross-Page Consistency**: All components reflect current progress
- **Visual Feedback**: Progress indicators advance dynamically

### 4. Admin Data Management
- **Bulk Operations**: Seed all cases at once
- **Immediate Feedback**: Status updates without page refresh
- **Easy Reset**: Clear all data to return to static state

## API Reference

### Core Functions (`caseStatusUtils.js`)

#### `calculateCaseStatus(caseId, taskStatuses)`
Calculates dynamic case status based on task completion.
- **Parameters**: `caseId` (string), `taskStatuses` (object)
- **Returns**: Case status string ('Received', 'Triage', 'Review', 'Closed')

#### `getDisplayStatus(caseId, originalStatus)`
Hybrid function providing dynamic or static status.
- **Parameters**: `caseId` (string), `originalStatus` (string)
- **Returns**: Display status string
- **Logic**: Uses dynamic if task data exists, otherwise static

#### `seedRealisticTaskData(caseId)`
Generates realistic task completion for a specific case.
- **Parameters**: `caseId` (string)
- **Side Effects**: Updates session storage with generated data

#### `generateRealisticTaskStatuses(caseData, stages)`
Creates completion patterns based on case status.
- **Parameters**: `caseData` (object), `stages` (array)
- **Returns**: Task status object with realistic completion

## Testing & Quality Assurance

### Manual Testing Scenarios

#### Scenario 1: Fresh Installation
1. Load case list → All show static statuses
2. Open any case → Progress indicator matches static status
3. Navigate task pages → No completion data

#### Scenario 2: Data Seeding
1. Access admin panel → Seed realistic data
2. Return to case list → Status updated immediately
3. Open cases → Progress indicators reflect task completion
4. Navigate task pages → See seeded completion data

#### Scenario 3: User Task Completion
1. Start with "Received" case → Progress at "Received"
2. Complete triage task → Advances to "Triage" immediately
3. Complete all triage → Advances to "Review"
4. Check all components → Consistent status display

#### Scenario 4: Data Clearing
1. Use admin clear function → All data removed
2. Case list reverts → Original static statuses
3. Task pages clean → No completion data
4. Progress indicators reset → Match original status

### Browser Compatibility
- **Session Storage**: Supported in all modern browsers
- **Event Listeners**: Standard DOM events
- **Cross-tab Sync**: Works across browser tabs/windows

### Performance Considerations
- **Minimal Overhead**: Status calculation is lightweight
- **Event Throttling**: Focus events debounced
- **Storage Efficiency**: Clean JSON serialization

## Deployment & Configuration

### Environment Setup
No additional configuration required - system uses existing:
- Session storage (browser-native)
- JSON data files (existing case and task config)
- React component architecture

### Production Considerations
- **Data Persistence**: Session storage cleared on browser close
- **User Training**: Admin functions require explanation
- **Backup Strategy**: Original JSON data always preserved

### Monitoring & Analytics
Consider tracking:
- Admin seeding usage patterns
- Task completion rates by case type
- User interaction with dynamic statuses

## Future Enhancements

### 1. Advanced Seeding Options
- **Custom Completion Percentages**: Fine-tune seeding patterns
- **Time-based Patterns**: Realistic task timing data
- **User-specific Patterns**: Different completion styles

### 2. Backend Integration
- **Database Persistence**: Replace session storage
- **Real-time Sync**: Multi-user collaboration
- **Audit Trail**: Track status changes over time

### 3. Analytics Dashboard
- **Status Progression Metrics**: Track case advancement
- **Task Completion Analysis**: Identify bottlenecks
- **User Behavior Patterns**: Optimize workflow

### 4. Enhanced Admin Tools
- **Selective Seeding**: Seed specific case types
- **Data Export/Import**: Backup and restore capabilities
- **Bulk Status Updates**: Administrative case management

## Troubleshooting Guide

### Common Issues

#### Case Status Not Updating
- **Check**: Session storage data exists
- **Verify**: Event listeners attached properly
- **Test**: Manual page refresh triggers update

#### Seeding Not Working
- **Confirm**: Admin page accessible
- **Check**: Progress indicator completes
- **Verify**: Success message appears

#### Cross-tab Sync Issues
- **Browser**: Ensure storage events supported
- **Security**: Check for storage access restrictions
- **Network**: Local development vs production differences

### Debug Tools
- **Browser DevTools**: Inspect session storage
- **Console Logging**: Component state updates
- **Network Tab**: No external API calls (all local)

---

*This documentation covers the complete dynamic case status and data seeding system as implemented in August 2025. For questions or enhancements, refer to the source code in `src/utils/caseStatusUtils.js` and related components.*
