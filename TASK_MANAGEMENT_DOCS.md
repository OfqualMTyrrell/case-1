# Task Management System Documentation

## Overview

The task management system has been successfully integrated into the case management application, providing a comprehensive workflow for managing case-related tasks across different stages. The system follows the Carbon Design System guidelines and maintains the g100 theme consistency.

## Features Implemented

### 1. Core Components

#### TaskList Page (`/case/:caseId/tasks`)
- **Location**: `src/pages/TaskList.js`
- **Purpose**: Displays all tasks organized by stage (Triage, Review, Outcome)
- **Features**:
  - Task progress tracking with completion counters
  - Stage-based organization with progress indicators
  - Status tags (Not started, In progress, Completed)
  - Responsive design with Carbon Grid system
  - Clickable task navigation
  - Breadcrumb navigation

#### TaskDetail Page (`/case/:caseId/tasks/:stageId/:taskId`)
- **Location**: `src/pages/TaskDetail.js`
- **Purpose**: Individual task completion interface with dynamic forms
- **Features**:
  - Dynamic form generation based on task configuration
  - Multiple input types (text, textarea, select, radio buttons)
  - Task completion checkbox
  - Auto-save functionality with session storage
  - Task navigation (previous/next)
  - Success notifications
  - Form validation

### 2. Data Structure

#### Task Configuration (`src/data/task-config.json`)
- **Flexible Structure**: Supports multiple case types with different workflows
- **Current Implementation**: Generic stages and tasks for all case types
- **Extensibility**: Easy to add new case types, stages, and tasks

**Sample Structure**:
```json
{
  "caseTypes": {
    "default": {
      "stages": [
        {
          "id": "triage",
          "name": "Triage",
          "tasks": [
            {
              "id": "check-information",
              "name": "Check information is correct and present",
              "questions": [
                {
                  "id": "information-complete",
                  "type": "radio",
                  "label": "Is all required information present and correct?",
                  "required": true,
                  "options": [...]
                }
              ]
            }
          ]
        }
      ]
    }
  }
}
```

### 3. State Management

#### Session Storage Implementation
- **Task Progress**: `taskStatuses_${caseId}` - Tracks completion status for each task
- **Form Data**: `taskData_${caseId}_${stageId}_${taskId}` - Stores form responses and completion status
- **Persistence**: Data persists across page refreshes and navigation
- **Structure**: JSON format for easy serialization/deserialization

#### Status Values
- `not-started`: Task has never been accessed
- `in-progress`: Task has been saved but not marked complete
- `completed`: Task has been marked as completed

### 4. Navigation Integration

#### Left Navigation
- Integrated with existing case information navigation
- Consistent styling with `case-nav-active` class for current page
- Responsive design with overflow menu for mobile devices

#### Breadcrumb Navigation
- Multi-level breadcrumbs: Cases → Case Title → Tasks → Task Name
- Clickable navigation to parent levels
- Consistent with existing case information patterns

### 5. User Experience Features

#### Task Navigation
- Previous/Next task buttons with smart navigation
- Automatically moves to next stage when current stage is complete
- Disabled state for unavailable navigation options

#### Progress Indicators
- Stage-level progress showing "X of Y completed"
- Individual task status with color-coded tags
- Case-level progress indicator maintained across all pages

#### Form Validation
- Required field validation with error states
- Real-time feedback for user inputs
- Success notifications on save

## Technical Implementation

### 1. Component Architecture

#### Functional Components with Hooks
- `useState` for local state management
- `useEffect` for data loading and side effects
- `useParams` and `useNavigate` for routing

#### Carbon Design System Integration
- Consistent use of Carbon components and tokens
- G100 theme applied throughout
- Responsive grid system implementation
- Accessibility features built-in

### 2. Routing Structure

```
/case/:caseId/tasks - Task list for a specific case
/case/:caseId/tasks/:stageId/:taskId - Individual task detail page
```

### 3. File Structure

```
src/
├── pages/
│   ├── TaskList.js - Task list component
│   ├── TaskDetail.js - Task detail component
│   └── CaseInformation.css - Shared responsive styles
├── data/
│   └── task-config.json - Task configuration data
└── App.js - Updated routing configuration
```

## Responsive Design

### Mobile Optimization
- **Navigation**: Left sidebar collapses to overflow menu on small screens
- **Grid Layout**: Uses Carbon responsive grid with appropriate breakpoints
- **Touch Targets**: Properly sized buttons and interactive elements
- **Text Wrapping**: Ensures no horizontal scrolling on mobile devices

### Breakpoints
- **Small (sm)**: ≤ 672px - Mobile devices
- **Medium (md)**: 673px - 1055px - Tablet devices
- **Large (lg)**: ≥ 1056px - Desktop devices

## Accessibility Features

### Built-in Carbon Accessibility
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast color schemes

### Custom Accessibility Enhancements
- Descriptive button labels
- Form field error messaging
- Status announcements
- Focus management

## Future Enhancements

### 1. Case Type Specific Configurations
- Different task flows for different case types
- Case type detection and routing
- Conditional task visibility

### 2. Advanced Features
- Task dependencies and prerequisites
- Bulk task operations
- Task assignment and delegation
- Due dates and reminders
- File attachments support

### 3. Data Integration
- Backend API integration
- Real-time collaboration
- Audit trail and version history
- Data export capabilities

## Usage Instructions

### For Developers

#### Adding New Case Types
1. Update `task-config.json` with new case type structure
2. Modify TaskList and TaskDetail components to handle case type detection
3. Add any case-specific styling or behaviors

#### Adding New Question Types
1. Extend the `renderQuestion` function in TaskDetail.js
2. Add new Carbon form components as needed
3. Update form validation logic

#### Modifying Task Flows
1. Update the appropriate case type in `task-config.json`
2. Test navigation flow with new structure
3. Verify progress calculations work correctly

### For Users

#### Completing Tasks
1. Navigate to a case from the case list
2. Click "Tasks" in the left navigation
3. Select a task from the appropriate stage
4. Fill in the required information
5. Check "Have you completed this task?" if finished
6. Click "Save Task" to store progress

#### Navigation
- Use breadcrumbs for quick navigation to parent pages
- Use Previous/Next buttons to move between tasks
- Return to task list to see overall progress

## Testing Guidelines

### Manual Testing Checklist
- [ ] Task list displays correctly with proper status tags
- [ ] Task detail forms save and load data properly
- [ ] Task completion status updates correctly
- [ ] Navigation works between all pages
- [ ] Mobile responsive design functions properly
- [ ] Accessibility features work with screen readers
- [ ] Form validation displays appropriate error messages

### Browser Compatibility
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Considerations

### Optimization Strategies
- Session storage for local state persistence
- Efficient re-rendering with proper React keys
- Lazy loading for large task configurations
- Debounced form input handling

### Memory Management
- Cleanup of event listeners in useEffect
- Proper component unmounting
- Session storage limits consideration

## Security Considerations

### Data Protection
- No sensitive data stored in localStorage
- Session-based storage for prototype use only
- Input sanitization for form fields
- XSS prevention with React's built-in protection

This documentation provides a comprehensive overview of the task management system implementation, covering technical details, user experience considerations, and future enhancement possibilities.
