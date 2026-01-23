import React from 'react';
import { render } from '@testing-library/react';
import OrganisationMessageReplyRedirect from '../OrganisationMessageReplyRedirect';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Basic smoke test - redirect behavior is run in useEffect; we assert component mounts without crashing
test('OrganisationMessageReplyRedirect mounts', () => {
  render(
    <MemoryRouter initialEntries={["/organisations/RN5123/messages/reply/msg-001"]}>
      <Routes>
        <Route path="/organisations/:rnNumber/messages/reply/:messageId" element={<OrganisationMessageReplyRedirect />} />
      </Routes>
    </MemoryRouter>
  );
});
