import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  ProgressIndicator, 
  ProgressStep, 
  Layer,
  MenuButton,
  MenuItem
} from '@carbon/react';
import { getDisplayStatus } from '../utils/caseStatusUtils';

/**
 * Reusable case header component with breadcrumbs, title, and progress indicator
 * Used across case information, task list, task detail, and check answers pages
 */
function CaseHeader({ 
  caseData, 
  breadcrumbs = [], 
  currentPageTitle = '',
  showProgressIndicator = true,
  currentCaseStatus = null // Allow external status override for real-time updates
}) {
  const navigate = useNavigate();
  const location = useLocation();

  if (!caseData) return null;

  // Get dynamic or externally provided case status
  const caseStatus = currentCaseStatus || getDisplayStatus(caseData.CaseID, caseData.Status);

  // Calculate progress indicator index
  const getProgressIndex = () => {
    const status = caseStatus?.toLowerCase();
    if (!status) return 0;
    if (status === 'closed') return 4;
    if (status === 'outcome') return 3;
    if (status === 'review') return 2;
    if (status === 'triage') return 1;
    if (status === 'received') return 0;
    return 0;
  };

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = (breadcrumb) => {
    if (breadcrumb.onClick) {
      breadcrumb.onClick();
    } else if (breadcrumb.path) {
      navigate(breadcrumb.path);
    }
  };

  // Handle menu actions
  const handleOpenInNewTab = () => {
    const url = `/case/${caseData.CaseID}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleRecordCaseNote = () => {
    navigate(`/case/${caseData.CaseID}/record-note`, {
      state: { from: location.pathname }
    });
  };

  const handleSendMessage = () => {
    // TODO: Implement messaging functionality
    console.log('Send message - not implemented yet');
  };

  const handleCancelCase = () => {
    // TODO: Implement cancel case functionality  
    console.log('Cancel case - not implemented yet');
  };

  return (
    <Layer>
      <div style={{ 
        background: 'var(--cds-layer-01)', 
        padding: '1rem', 
        marginTop: '1em', 
        marginBottom: '1rem', 
        paddingTop: '1em',
        position: 'relative'
      }}>
        {/* Actions Menu Button - positioned absolutely to avoid layout impact */}
        <div style={{ 
          position: 'absolute',
          top: '50%',
          right: '1rem',
          transform: 'translateY(-50%)',
          zIndex: 10
        }}>
          <MenuButton label="Actions" align="bottom-right">
            <MenuItem 
              label="Open in a new tab"
              onClick={handleOpenInNewTab}
              aria-label="Open case information in a new tab"
            />
            <MenuItem 
              label="Record a case note"
              onClick={handleRecordCaseNote}
            />
            <MenuItem 
              label="Send a message"
              onClick={handleSendMessage}
            />
            <MenuItem 
              label="Cancel case"
              onClick={handleCancelCase}
              kind="danger"
            />
          </MenuButton>
        </div>

        <Breadcrumb style={{ marginBottom: '1rem', paddingTop: '0.5em', paddingRight: '6rem' }}>
          {/* Default Cases breadcrumb */}
          <BreadcrumbItem 
            href="#" 
            onClick={() => navigate('/cases-v2')}
          >
            Cases
          </BreadcrumbItem>
          
          {/* Dynamic breadcrumbs */}
          {breadcrumbs.map((breadcrumb, index) => (
            <BreadcrumbItem
              key={index}
              href="#"
              onClick={() => handleBreadcrumbClick(breadcrumb)}
              isCurrentPage={breadcrumb.isCurrentPage}
            >
              {breadcrumb.title}
            </BreadcrumbItem>
          ))}
          
          {/* Current page breadcrumb if provided */}
          {currentPageTitle && (
            <BreadcrumbItem isCurrentPage>
              {currentPageTitle}
            </BreadcrumbItem>
          )}
        </Breadcrumb>
        
        <h1 style={{ fontSize: '1.5rem', margin: '1rem 0' }}>
          {caseData.Title}
        </h1>
        
        {showProgressIndicator && (
          <ProgressIndicator currentIndex={getProgressIndex()}>
            <ProgressStep label="Received" />
            <ProgressStep label="Triage" />
            <ProgressStep label="Review" />
            <ProgressStep label="Outcome" />
          </ProgressIndicator>
        )}
      </div>
    </Layer>
  );
}

export default CaseHeader;
