import React, { useState } from 'react';
import {
  Content, TableContainer, Table, TableHead,
  TableRow, TableHeader, TableBody, TableCell, TableExpandedRow, TableExpandHeader, TableExpandRow
} from '@carbon/react';
import AppHeader from '../components/AppHeader';

function Test() {
  const [expandedRowIds, setExpandedRowIds] = useState([]);

  const rows = [
    {
      id: '1',
      date: '2025-01-01',
      text: 'First entry',
      details: 'This is the detailed content for the first entry.',
      isExpandable: true,
    },
    {
      id: '2',
      date: '2025-01-02',
      text: 'Second entry',
      details: 'This is the detailed content for the second entry.',
      isExpandable: true,
    },
    {
      id: '3',
      date: '2025-01-03',
      text: 'Third entry',
      isExpandable: false,
    },
    {
      id: '4',
      date: '2025-01-04',
      text: 'Fourth entry',
      details: 'This is the detailed content for the fourth entry.',
      isExpandable: true,
    },
  ];

  const onExpand = (rowId) => {
    setExpandedRowIds((prev) =>
      prev.includes(rowId)
        ? prev.filter((id) => id !== rowId)
        : [...prev, rowId]
    );
  };

  return (
    <>
      <AppHeader />
      <Content>
        <TableContainer title="Test Data Table">
          <Table>
            <TableHead>
              <TableRow>
                <TableExpandHeader />
                <TableHeader>Date</TableHeader>
                <TableHeader>Text</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <React.Fragment key={row.id}>
                  {row.isExpandable ? (
                    <TableExpandRow
                      isExpanded={expandedRowIds.includes(row.id)}
                      onExpand={() => onExpand(row.id)}
                      expandHeader="expand"
                    >
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.text}</TableCell>
                    </TableExpandRow>
                  ) : (
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.text}</TableCell>
                    </TableRow>
                  )}
                  {expandedRowIds.includes(row.id) && row.details && (
                    <TableExpandedRow colSpan={3}>
                      <div style={{ padding: '1rem' }}>
                        <strong>Details:</strong> {row.details}
                      </div>
                    </TableExpandedRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Content>
    </>
  );
}

export default Test;