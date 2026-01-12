import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  SideNav, 
  SideNavItems, 
  SideNavLink,
  OverflowMenu, 
  OverflowMenuItem 
} from '@carbon/react';
import './CaseNavigation.css';

function CaseNavigation({ caseId, activePage = 'information' }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { key: 'information', label: 'Case information', path: `/case/${caseId}` },
    { key: 'tasks', label: 'Tasks', path: `/case/${caseId}/tasks` },
    { key: 'messages', label: 'Messages', path: `/case/${caseId}/messages` },
    { key: 'history', label: 'History', path: `/case/${caseId}/history` }
  ];

  const handleNavClick = (item) => {
    if (item.path !== '#') {
      navigate(item.path);
    }
  };

  const isActiveNavItem = (item) => {
    if (activePage) {
      return activePage === item.key;
    }
    // Fallback to checking location pathname
    return location.pathname.includes(item.path) && item.path !== '#';
  };

  return (
    <>
      {/* Left nav: hidden on small screens, visible on md/lg */}
      <div style={{ position: 'sticky', top: '2rem', zIndex: 1 }} className="case-nav-list case-nav-lg">
        <SideNav 
          aria-label="Case navigation"
          isFixedNav
          expanded
          isChildOfHeader={false}
          style={{ marginTop: '2rem', position: 'relative' }}
        >
          <SideNavItems>
            {navigationItems.map(item => (
              <SideNavLink
                key={item.key}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item);
                }}
                isActive={isActiveNavItem(item)}
                aria-current={isActiveNavItem(item) ? 'page' : undefined}
              >
                {item.label}
              </SideNavLink>
            ))}
          </SideNavItems>
        </SideNav>
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
