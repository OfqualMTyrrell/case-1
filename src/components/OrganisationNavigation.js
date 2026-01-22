import React from 'react';
import { SideNav, SideNavItems, SideNavLink } from '@carbon/react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CaseNavigation.css';

function OrganisationNavigation({ rnNumber, activePage }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'information', label: 'Information', path: `/organisations/${rnNumber}` },
    { id: 'cases', label: 'Cases', path: `/organisations/${rnNumber}/cases` },
    { id: 'scope', label: 'Scope', path: `/organisations/${rnNumber}/scope` },
    { id: 'qualifications', label: 'Qualifications', path: `/organisations/${rnNumber}/qualifications` },
    { id: 'units', label: 'Units', path: `/organisations/${rnNumber}/units` },
    { id: 'users', label: 'Users', path: `/organisations/${rnNumber}/users` }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <SideNav
      aria-label="Organisation navigation"
      isFixedNav
      expanded={true}
      isChildOfHeader={false}
      className="case-side-nav"
    >
      <SideNavItems>
        {navItems.map((item) => (
          <SideNavLink
            key={item.id}
            onClick={() => handleNavigation(item.path)}
            isActive={location.pathname === item.path}
            large
          >
            {item.label}
          </SideNavLink>
        ))}
      </SideNavItems>
    </SideNav>
  );
}

export default OrganisationNavigation;
