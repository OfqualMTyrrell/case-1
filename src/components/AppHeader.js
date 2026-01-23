
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Header,
  HeaderName,
  HeaderNavigation,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  HeaderPanel,
  Button,
  InlineNotification
} from '@carbon/react';
import { Settings } from '@carbon/icons-react';
import './AppHeader.css';

function AppHeader() {
  const location = useLocation();
  const [notification, setNotification] = useState(null);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);

  const handleClearSessionData = () => {
    try {
      // Clear all task-related session storage
      const keysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.startsWith('taskData_') || key.startsWith('taskStatuses_'))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => sessionStorage.removeItem(key));
      
      setNotification({
        kind: 'success',
        title: 'Session data cleared',
        subtitle: `Cleared ${keysToRemove.length} task data entries from session storage.`
      });
      
      // Dispatch custom event to refresh case list
      window.dispatchEvent(new CustomEvent('caseDataRefresh'));
      
      // Close the panel after clearing data
      setIsPanelExpanded(false);
      
      // Auto-hide notification after 4 seconds
      setTimeout(() => setNotification(null), 4000);
    } catch (error) {
      setNotification({
        kind: 'error',
        title: 'Error clearing data',
        subtitle: 'Failed to clear session storage data.'
      });
      
      // Close the panel after error
      setIsPanelExpanded(false);
      
      // Auto-hide notification after 4 seconds
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const togglePanel = () => {
    setIsPanelExpanded(prev => !prev);
  };

  const closePanel = () => {
    setIsPanelExpanded(false);
  };

  return (
    <>
      {notification && (
        <InlineNotification
          kind={notification.kind}
          title={notification.title}
          subtitle={notification.subtitle}
          onCloseButtonClick={() => setNotification(null)}
          style={{ 
            position: 'fixed', 
            top: '3rem', 
            right: '1rem', 
            zIndex: 9999,
            minWidth: '320px'
          }}
        />
      )}
      <Header aria-label="Ofqual business process management">
        <HeaderName prefix="Ofqual" href="/">
          BPM
        </HeaderName>
        <HeaderNavigation aria-label="Ofqual Cases Navigation" style={{ backgroundColor: '#004a4a' }}>
          <HeaderMenuItem href="/cases-v2" isActive={location.pathname === '/cases-v2' || location.pathname.startsWith('/case/')}>Case management</HeaderMenuItem>
          <HeaderMenuItem href="/profiles/regulated-organisations" isActive={location.pathname === '/profiles/regulated-organisations' || location.pathname.startsWith('/organisations/')}>Regulated organisations</HeaderMenuItem>
          <HeaderMenuItem href="/profiles/prospective-organisations" isActive={location.pathname === '/profiles/prospective-organisations'}>Prospective organisations</HeaderMenuItem>
          <HeaderMenuItem href="/profiles/subject-matter-specialists" isActive={location.pathname === '/profiles/subject-matter-specialists'}>Subject matter specialists</HeaderMenuItem>
          <HeaderMenuItem href="/graph" isActive={location.pathname === '/graph'}>Relationships map</HeaderMenuItem>
        </HeaderNavigation>
        <HeaderGlobalBar>
          <HeaderGlobalAction
            aria-label="Administration Settings"
            tooltipAlignment="end"
            isActive={isPanelExpanded}
            onClick={togglePanel}
          >
            <Settings size={20} />
          </HeaderGlobalAction>
        </HeaderGlobalBar>
        <HeaderPanel 
          expanded={isPanelExpanded}
          onHeaderPanelFocus={closePanel}
          style={{
            zIndex: 8000,
            position: 'fixed',
            right: '0.1rem',
            top: '3rem',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
            maxWidth: '320px',
            overflow: 'hidden',
            backgroundColor: 'var(--cds-background)',
            color: 'var(--cds-text-primary)'
          }}
        >
          <div style={{ 
            width: '100%',
            maxWidth: '300px',
            padding: '1rem',
            boxSizing: 'border-box'
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ 
                fontSize: '1rem', 
                fontWeight: '600', 
                marginBottom: '0.5rem',
                color: 'var(--cds-text-primary)'
              }}>
                Administration
              </h4>
              <p style={{ 
                fontSize: '0.875rem', 
                marginBottom: '1rem',
                color: 'var(--cds-text-secondary)'
              }}>
                Prototype administration controls for testing purposes.
              </p>
            </div>
            
            <Button
              kind="primary"
              size="md"
              onClick={() => {
                window.location.href = '/admin/seed-data';
              }}
              style={{ width: '100%', marginBottom: '0.5rem' }}
            >
              Seed Realistic Data
            </Button>
            
            <Button
              kind="danger--tertiary"
              size="md"
              onClick={handleClearSessionData}
              style={{ width: '100%' }}
            >
              Clear session data
            </Button>
            
            <p style={{ 
              fontSize: '0.75rem', 
              marginTop: '0.5rem',
              color: 'var(--cds-text-secondary)',
              fontStyle: 'italic'
            }}>
              This will clear all saved task progress and form data.
            </p>
          </div>
        </HeaderPanel>
      </Header>
    </>
  );
}

export default AppHeader;
