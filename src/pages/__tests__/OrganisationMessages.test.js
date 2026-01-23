import React from 'react';
import { render, screen } from '@testing-library/react';
import OrganisationMessages from '../OrganisationMessages';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

test('renders organisation messages page', () => {
  render(
    <MemoryRouter initialEntries={["/organisations/RN5123/messages"]}>
      <Routes>
        <Route path="/organisations/:rnNumber/messages" element={<OrganisationMessages />} />
      </Routes>
    </MemoryRouter>
  );

  expect(screen.getByText(/Messages/i)).toBeInTheDocument();
});
