
import React from 'react';
import {
  Header,
  HeaderName,
  HeaderNavigation,
  HeaderMenuItem,
  HeaderMenu,
} from '@carbon/react';

function AppHeader() {
  return (
    <Header aria-label="Ofqual Cases">
      <HeaderName prefix="Ofqual" href="/">
        Cases
      </HeaderName>
      <HeaderNavigation aria-label="Ofqual Cases Navigation">
        <HeaderMenuItem href="/cases">Cases</HeaderMenuItem>
        <HeaderMenu aria-label="Profiles" menuLinkName="Profiles">
          <HeaderMenuItem href="/profiles/regulated-organisations">Regulated organisations</HeaderMenuItem>
          <HeaderMenuItem href="/profiles/subject-matter-specialists">Subject matter specialists</HeaderMenuItem>
          <HeaderMenuItem href="/profiles/prospective-organisations">Prospective organisations</HeaderMenuItem>
        </HeaderMenu>
      </HeaderNavigation>
    </Header>
  );
}

export default AppHeader;
