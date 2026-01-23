import React, { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Content, Grid, Column, DataTable, TableContainer, Table, TableHead,
  TableRow, TableHeader, TableBody, TableCell, TableToolbar, TableToolbarContent, TableToolbarSearch,
  TableExpandHeader, TableExpandRow, TableExpandedRow, Pagination, Theme
} from '@carbon/react';
import AppHeader from '../components/AppHeader';
import OrganisationHeader from '../components/OrganisationHeader';
import { computeOrganisationActivity } from '../utils/activityUtils';
import regulatedOrganisationsData from '../data/regulated-organisations.json';

function OrganisationActivity() {
  const { rnNumber } = useParams();
  const organisationData = regulatedOrganisationsData.find(o => o.RNNumber === rnNumber);

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [expandedRowIds, setExpandedRowIds] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handleStorage = () => setRefreshKey(k => k + 1);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleStorage);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) handleStorage(); });
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleStorage);
    };
  }, []);

  const headers = [
    { key: 'date', header: 'Date' },
    { key: 'summary', header: 'Activity' },
    { key: 'user', header: 'User' },
    { key: 'caseId', header: 'Case' }
  ];

  const allRows = useMemo(() => computeOrganisationActivity(rnNumber), [rnNumber, refreshKey]);

  // search
  const filteredRows = useMemo(() => {
    if (!searchTerm) return allRows;
    const s = searchTerm.toLowerCase();
    return allRows.filter(r => (
      (r.summary || '').toLowerCase().includes(s) ||
      (r.user || '').toLowerCase().includes(s) ||
      (r.caseId || '').toLowerCase().includes(s)
    ));
  }, [allRows, searchTerm]);

  const totalItems = filteredRows.length;
  const pagedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  const onExpand = (rowId) => {
    setExpandedRowIds(prev => prev.includes(rowId) ? prev.filter(id => id !== rowId) : [...prev, rowId]);
  };

  return (
    <Theme theme="white">
      <AppHeader />
      <Content style={{ width: '100%', margin: '0 auto', flex: 1, padding: 0, paddingTop: '1em' }}>
        <Grid fullWidth columns={16} mode="narrow" gutter={16}>
          <Column sm={4} md={8} lg={16}>
            <OrganisationHeader organisationData={organisationData} activePage="activity" />
          </Column>

          <Column sm={4} md={8} lg={16}>
            <DataTable rows={pagedRows} headers={headers} isSortable>
              {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => (
                <TableContainer title="Organisation activity">
                  <TableToolbar>
                    <TableToolbarContent>
                      <TableToolbarSearch
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        placeholder="Search activity, users, or case..."
                        persistent
                      />
                    </TableToolbarContent>
                  </TableToolbar>

                  <Table {...getTableProps()}>
                    <TableHead>
                      <TableRow>
                        <TableExpandHeader />
                        {headers.map(header => (
                          <TableHeader key={header.key} {...getHeaderProps({ header })}>{header.header}</TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map(row => {
                        const original = filteredRows.find(r => r.id === row.id);
                        return (
                          <React.Fragment key={row.id}>
                            {original && original.description ? (
                              <TableExpandRow {...getRowProps({ row })} isExpanded={expandedRowIds.includes(row.id)} onExpand={() => onExpand(row.id)}>
                                {row.cells.map(cell => (
                                  <TableCell key={cell.id}>{cell.value}</TableCell>
                                ))}
                              </TableExpandRow>
                            ) : (
                              <TableRow {...getRowProps({ row })}>
                                <TableCell></TableCell>
                                {row.cells.map(cell => (<TableCell key={cell.id}>{cell.value}</TableCell>))}
                              </TableRow>
                            )}

                            {expandedRowIds.includes(row.id) && original && original.description && (
                              <TableExpandedRow colSpan={headers.length + 1}>
                                <div style={{ padding: '1rem', whiteSpace: 'pre-wrap' }}>{original.description}</div>
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

            <div style={{ marginTop: '1rem' }}>
              <Pagination
                totalItems={totalItems}
                pageSize={pageSize}
                pageSizes={[10, 20, 50]}
                currentPage={page}
                onChange={({ page: nextPage, pageSize: nextSize }) => {
                  setPage(nextPage);
                  setPageSize(nextSize);
                }}
              />
            </div>
          </Column>
        </Grid>
      </Content>
    </Theme>
  );
}

export default OrganisationActivity;