import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ContainedList, ContainedListItem, OverflowMenu, OverflowMenuItem } from '@carbon/react';

function CaseNavigation({ caseId, activePage = 'information' }) {
  const navigate = useNavigate();

  const navigationItems = [
    { key: 'information', label: 'Case information', path: `/case/${caseId}` },
    { key: 'tasks', label: 'Tasks', path: `/case/${caseId}/tasks` },
    { key: 'messages', label: 'Messages', path: '#' }, // placeholder
    { key: 'timeline', label: 'Timeline', path: '#' } // placeholder
  ];

  const handleNavClick = (item) => {
    if (item.path !== '#') {
      navigate(item.path);
    }
  };

  return (
    <>
      {/* Left nav: hidden on small screens, visible on md/lg */}
      <div style={{ position: 'sticky', top: '2rem', zIndex: 1 }} className="case-nav-list case-nav-lg">
        <ContainedList kind="interactive" style={{ marginTop: '2rem' }}>
          {navigationItems.map(item => (
            <ContainedListItem
              key={item.key}
              onClick={() => handleNavClick(item)}
              className={activePage === item.key ? 'case-nav-active' : ''}
              style={{ cursor: item.path !== '#' ? 'pointer' : 'default' }}
              aria-current={activePage === item.key ? 'page' : undefined}
            >
              {item.label}
            </ContainedListItem>
          ))}
        </ContainedList>
      </div>
      
      {/* Menu button for nav on small screens */}
      <div className="case-nav-sm" style={{ display: 'none', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <OverflowMenu aria-label="Open navigation menu" flipped>
          {navigationItems.map(item => (
            <OverflowMenuItem
              key={item.key}
              itemText={item.label}
              onClick={() => handleNavClick(item)}
              disabled={item.path === '#'}
            />
          ))}
        </OverflowMenu>
      </div>
    </>
  );
}

export default CaseNavigation;
