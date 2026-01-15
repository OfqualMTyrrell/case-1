import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layer } from '@carbon/react';

/**
 * Reusable dashboard header component with tabs for navigating between
 * My Dashboard and Team Dashboard views
 */
function DashboardHeader() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Layer>
      <div style={{ 
        background: 'var(--cds-layer-01)', 
        padding: '2rem 0rem 0rem 0rem',
        marginBottom: '2rem'
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 400, 
          marginBottom: '1rem',
          marginLeft: '1rem',
          marginTop: 0
        }}>
          Dashboard
        </h1>
        
        <div style={{ 
          display: 'flex', 
          gap: '1rem',
          borderBottom: '1px solid var(--cds-border-subtle)',
          paddingBottom: 0
        }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: location.pathname === '/dashboard' ? '2px solid var(--cds-border-interactive)' : '2px solid transparent',
              color: location.pathname === '/dashboard' ? 'var(--cds-text-primary)' : 'var(--cds-text-secondary)',
              cursor: 'pointer',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 400,
              marginBottom: '-1px'
            }}
          >
            My Dashboard
          </button>
          <button
            onClick={() => navigate('/dashboard/team')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: location.pathname === '/dashboard/team' ? '2px solid var(--cds-border-interactive)' : '2px solid transparent',
              color: location.pathname === '/dashboard/team' ? 'var(--cds-text-primary)' : 'var(--cds-text-secondary)',
              cursor: 'pointer',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 400,
              marginBottom: '-1px'
            }}
          >
            Team Dashboard
          </button>
        </div>
      </div>
    </Layer>
  );
}

export default DashboardHeader;
