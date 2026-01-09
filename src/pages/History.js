
import React, { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Content, Grid, Column, Theme, DataTable, TableContainer, Table, TableHead,
  TableRow, TableHeader, TableBody, TableCell, TableToolbar, TableToolbarContent, TableToolbarSearch,
  Pagination
} from '@carbon/react';
import casesData from '../cases.json';
import AppHeader from '../components/AppHeader';
import CaseHeader from '../components/CaseHeader';
import CaseNavigation from '../components/CaseNavigation';

/**
 * Parse "DD/MM/YYYY HH:mm:ss" (fixed format) into a Date (local time).
 * Example: "05/07/2025 10:27:12"
 */
function parseFixedDate(dStr) {
  if (!dStr || typeof dStr !== 'string') return new Date(0);
  const [datePart, timePart = '00:00:00'] = dStr.split(' ');
  const [dd, mm, yyyy] = datePart.split('/').map(Number);
  const [hh, min, ss] = timePart.split(':').map(Number);
  // Basic validation
  if (!dd || !mm || !yyyy) return new Date(0);
  return new Date(yyyy, (mm - 1), dd, hh || 0, min || 0, ss || 0);
}

/**
 * Small, deterministic hash for a string to produce stable IDs.
 */
function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0; // convert to 32-bit int
  }
  return Math.abs(h).toString(36);
}

function History() {
  const { caseId } = useParams();
  const caseData = casesData.find(c => c.CaseID === caseId);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const headers = [
    { key: 'date', header: 'Date' },
    { key: 'activity', header: 'Activity' },
    { key: 'user', header: 'User' },
  ];

  // Prepare rows: sort newest first and add stable ephemeral IDs.
  const normalizedRows = useMemo(() => {
    const items = (caseData?.history ?? [])
      .slice()
      .sort((a, b) => parseFixedDate(b.date) - parseFixedDate(a.date));

    return items.map((h, i) => {
      // Build a stable ID using the content; index used only as tie-breaker.
      const contentId = hashString(`${h.date}|${h.activity}|${h.user}`);
      return {
        id: `${caseId}-${contentId}-${i}`,
        date: h.date,
        activity: h.activity,
        user: h.user,
      };
    });
  }, [caseData, caseId]);

  // Filter rows based on search term
  const filteredRows = useMemo(() => {
    if (!searchTerm) return normalizedRows;
    return normalizedRows.filter(row =>
      row.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.user.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [normalizedRows, searchTerm]);

  // Paginate the filtered rows
  const currentPageRows = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredRows.slice(startIndex, endIndex);
  }, [filteredRows, currentPage, pageSize]);

  // Optional: early return if case not found
  if (!caseData) {
    return (
      <Theme theme="white">
        <AppHeader />
        <Content>
          <h2>Case not found</h2>
        </Content>
      </Theme>
    );
  }

  return (
    <Theme theme="white">
      <AppHeader />
      <CaseHeader caseData={caseData} />
      <Grid>
        <Column sm={4} md={8} lg={4}>
          <CaseNavigation caseId={caseId} activePage="history" />
        </Column>
        <Column sm={4} md={8} lg={12}>
          <Content>
            <DataTable rows={currentPageRows} headers={headers} isSortable>
              {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => (
                <TableContainer title="Case History">
                  <TableToolbar>
                    <TableToolbarContent>
                      <TableToolbarSearch
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search activity and users..."
                        persistent
                      />
                    </TableToolbarContent>
                  </TableToolbar>
                  <Table {...getTableProps()}>
                    <TableHead>
                      <TableRow>
                        {headers.map((header) => (
                          <TableHeader key={header.key} {...getHeaderProps({ header })}>
                            {header.header}
                          </TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow key={row.id} {...getRowProps({ row })}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>{cell.value}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DataTable>
            <Pagination
              totalItems={filteredRows.length}
              pageSize={pageSize}
              pageSizes={[10, 20, 50, 100]}
              currentPage={currentPage}
              onChange={({ page, pageSize }) => {
                setCurrentPage(page);
                setPageSize(pageSize);
              }}
            />
          </Content>
        </Column>
      </Grid>
    </Theme>
  );
}

export default History;
