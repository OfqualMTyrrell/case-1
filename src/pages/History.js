
import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Content, Grid, Column, Theme, DataTable, TableContainer, Table, TableHead,
  TableRow, TableHeader, TableBody, TableCell, TableToolbar, TableToolbarContent, TableToolbarSearch,
  TableExpandHeader, TableExpandRow, TableExpandedRow,
  Button,
  Pagination
} from '@carbon/react';
import casesData from '../cases.json';
import AppHeader from '../components/AppHeader';
import CaseHeader from '../components/CaseHeader';
import CaseNavigation from '../components/CaseNavigation';
import './CaseInformation.css';

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
  const navigate = useNavigate();
  const caseData = casesData.find(c => c.CaseID === caseId);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [expandedRowIds, setExpandedRowIds] = useState([]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const headers = [
    { key: 'date', header: 'Date' },
    { key: 'summary', header: 'Activity' },
    { key: 'user', header: 'User' },
  ];

  // Prepare rows: sort newest first and add stable ephemeral IDs.
  const normalizedRows = useMemo(() => {
    const items = (caseData?.history ?? [])
      .slice()
      .sort((a, b) => parseFixedDate(b.date) - parseFixedDate(a.date));

    return items.map((h, i) => {
      // Build a stable ID using the content; index used only as tie-breaker.
      const contentId = hashString(`${h.date}|${h.summary}|${h.user}`);
      return {
        id: `${caseId}-${contentId}-${i}`,
        date: h.date,
        summary: h.summary,
        user: h.user,
        description: h.description || null,
      };
    });
  }, [caseData, caseId]);

  // Filter rows based on search term
  const filteredRows = useMemo(() => {
    if (!searchTerm) return normalizedRows;
    return normalizedRows.filter(row =>
      row.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.user.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [normalizedRows, searchTerm]);

  // Paginate the filtered rows
  const currentPageRows = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredRows.slice(startIndex, endIndex);
  }, [filteredRows, currentPage, pageSize]);

  const onExpand = (rowId) => {
    setExpandedRowIds((prev) =>
      prev.includes(rowId)
        ? prev.filter((id) => id !== rowId)
        : [...prev, rowId]
    );
  };

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
    <Theme theme="white" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <Content style={{ width: '100%', margin: '0 auto', flex: 1, padding: 0, paddingTop: '1em' }}>
        <Grid fullWidth columns={16} mode="narrow" gutter={16}>
          <Column sm={4} md={4} lg={3}>
            <CaseNavigation caseId={caseId} activePage="history" />
          </Column>
          <Column sm={4} md={8} lg={13}>
            <CaseHeader 
              caseData={caseData}
              breadcrumbs={[
                { 
                  title: caseData.Title, 
                  path: `/case/${caseId}` 
                }
              ]}
              currentPageTitle="History"
            />
          </Column>
          <Column sm={4} md={8} lg={13} className="cds--lg:col-start-4">
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
                      <Button onClick={() => navigate(`/case/${caseId}/add-note`)}>
                        Add case note
                      </Button>
                    </TableToolbarContent>
                  </TableToolbar>
                  <Table {...getTableProps()}>
                    <TableHead>
                      <TableRow>
                        <TableExpandHeader />
                        {headers.map((header) => (
                          <TableHeader key={header.key} {...getHeaderProps({ header })}>
                            {header.header}
                          </TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row) => {
                        const originalRow = filteredRows.find(r => r.id === row.id);
                        return (
                          <React.Fragment key={row.id}>
                            {originalRow && originalRow.description ? (
                              <TableExpandRow
                                {...getRowProps({ row })}
                                isExpanded={expandedRowIds.includes(row.id)}
                                onExpand={() => onExpand(row.id)}
                                expandHeader="expand"
                              >
                                {row.cells.map((cell) => (
                                  <TableCell key={cell.id}>{cell.value}</TableCell>
                                ))}
                              </TableExpandRow>
                            ) : (
                              <TableRow {...getRowProps({ row })}>
                                <TableCell></TableCell>
                                {row.cells.map((cell) => (
                                  <TableCell key={cell.id}>{cell.value}</TableCell>
                                ))}
                              </TableRow>
                            )}
                            {expandedRowIds.includes(row.id) && originalRow && originalRow.description && (
                              <TableExpandedRow colSpan={headers.length + 1}>
                                <div style={{ padding: '1rem' }}>
                                  {originalRow.description}
                                </div>
                              </TableExpandedRow>
                            )}
                          </React.Fragment>
                        );
                      })}
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
          </Column>
        </Grid>
      </Content>
    </Theme>
  );
}

export default History;
