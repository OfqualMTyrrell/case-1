import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  ProgressIndicator, 
  ProgressStep, 
  Layer 
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

  return (
    <Layer>
      <div style={{ 
        background: 'var(--cds-layer)', 
        padding: '1rem', 
        marginTop: '1em', 
        marginBottom: '1rem', 
        paddingTop: '1em' 
      }}>
        <Breadcrumb style={{ marginBottom: '1rem', paddingTop: '0.5em' }}>
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
