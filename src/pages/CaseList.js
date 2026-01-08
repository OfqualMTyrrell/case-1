import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DataTable,
  Content,
  Grid,
  Column,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableContainer,
  Tag,
  Theme,
  Pagination
} from '@carbon/react';
import './CaseList.css';
import casesData from '../cases.json';
import AppHeader from '../components/AppHeader';
import TableToolbarFilter from '../components/TableToolbarFilter';

const headers = [
  { key: 'CaseID', header: 'CaseID' },
  { key: 'Title', header: 'Title' },
  { key: 'CaseType', header: 'Case type' },
  { key: 'SubmittedBy', header: 'Submitted by' },
  { key: 'ReceivedDate', header: 'Received date' },
  { key: 'Status', header: 'Status' },
  { key: 'CaseLead', header: 'Case lead' },
  { key: 'LastUpdatedDate', header: 'Last updated date' }
];


function CaseList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [allRows, setAllRows] = useState([]);
  const [renderedRows, setRenderedRows] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [caseTypeOptions, setCaseTypeOptions] = useState([]);
  const [submittedByOptions, setSubmittedByOptions] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({
    status: new Set(),
    caseType: new Set(),
    submittedBy: new Set()
  });
  const pageSizeRef = useRef(pageSize);



  const handleOnResetFilter = () => {
    setSelectedFilters({
      status: new Set(),
      caseType: new Set(),
      submittedBy: new Set()
    });
    setRenderedRows(allRows);
  };

  const totalItems = renderedRows.length;
  const pagedRows = renderedRows.slice((page - 1) * pageSize, page * pageSize);
  // Map status to Carbon tag types and classes
  const statusTagProps = status => {
    switch ((status || '').toLowerCase()) {
      case 'received':
        return { type: 'gray', className: 'some-class' };
      case 'triage':
        return { type: 'cyan', className: 'some-class' };
      case 'review':
        return { type: 'teal', className: 'some-class' };
      case 'closed':
        return { type: 'outline', className: 'some-class' };
      default:
        return { type: 'red', className: 'some-class' };
    }
  };

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

  useEffect(() => {
    const formattedRows = casesData.map((item, idx) => ({
      id: idx.toString(),
      ...item,
      ReceivedDate: formatDate(item.ReceivedDate),
      LastUpdatedDate: formatDate(item.LastUpdatedDate),
    }));
    setAllRows(formattedRows);
    setRenderedRows(formattedRows);
    setStatusOptions([...new Set(formattedRows.map(row => row.Status))]);
    setCaseTypeOptions([...new Set(formattedRows.map(row => row.CaseType))]);
    setSubmittedByOptions([...new Set(formattedRows.map(row => row.SubmittedBy))]);
  }, []);

  return (
    <Theme theme="white" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <Content style={{ width: '100%', margin: '0 auto', flex: 1 }}>
        <Grid fullWidth narrow>
            <Column sm={4} md={8} lg={16}>
              <h1 style={{ margin: '2rem 0 1rem 0' }}>All cases</h1>
              <DataTable 
                rows={pagedRows} 
                headers={headers} 
                isSortable
              >
                {({
                  rows,
                  headers,
                  getHeaderProps,
                  getRowProps,
                  getTableProps,
                  getSelectionProps,
                  getToolbarProps,
                  onInputChange,
                  selectedRows,
                  getTableContainerProps,
                }) => (
                  <>
                    <TableContainer>
                      <TableToolbarFilter
                        {...getToolbarProps()}
                        statusOptions={statusOptions}
                        caseTypeOptions={caseTypeOptions}
                        submittedByOptions={submittedByOptions}
                        caseLeadOptions={[...new Set(allRows.map(row => row.CaseLead).filter(Boolean))]}
                        selectedFilters={selectedFilters}
                        onSearch={onInputChange}
                        onApplyFilter={(filters) => {
                          setSelectedFilters(filters);
                          const filteredRows = allRows.filter(row => {
                            return (filters.status.size === 0 || filters.status.has(row.Status)) &&
                                   (filters.caseType.size === 0 || filters.caseType.has(row.CaseType)) &&
                                   (filters.submittedBy.size === 0 || filters.submittedBy.has(row.SubmittedBy)) &&
                                   (!filters.caseLead || filters.caseLead.size === 0 || filters.caseLead.has(row.CaseLead));
                          });
                          setRenderedRows(filteredRows);
                        }}
                        onResetFilter={handleOnResetFilter}
                        statusTagProps={statusTagProps}
                        open={getToolbarProps().active}
                        onClose={getToolbarProps().onClose}
                      />
                      <Table {...getTableProps()} size="lg">
                        <TableHead>
                          <TableRow>
                            {headers.map(header => (
                              <TableHeader key={header.key} {...getHeaderProps({ header })}>
                                {header.header}
                              </TableHeader>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {rows.map(row => (
                            <TableRow
                              key={row.id}
                              {...getRowProps({ row })}
                              className="clickable-row"
                              onClick={() => {
                                const caseIdCell = row.cells.find(cell => cell.info && cell.info.header === 'CaseID');
                                if (caseIdCell) {
                                  navigate(`/case/${caseIdCell.value}`);
                                }
                              }}
                              tabIndex={0}
                              style={{ cursor: 'pointer' }}
                              aria-label={`View details for case ${row.id}`}
                            >
                              {row.cells.map(cell => (
                                <TableCell key={cell.id}>
                                  {cell.info && cell.info.header === 'Status' ? (
                                    cell.value.toLowerCase() === 'closed' ? (
                                      <span>Closed</span>
                                    ) : (
                                      <Tag {...statusTagProps(cell.value)}>
                                        {cell.value}
                                      </Tag>
                                    )
                                  ) : (
                                    cell.value
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Pagination
                      page={page}
                      pageSize={pageSize}
                      pageSizes={[10, 20, 50, 100]}
                      totalItems={totalItems}
                      onChange={({ page, pageSize, pageSizes }) => {
                        // If the page size changes, reset to first page
                        if (pageSize !== pageSizeRef.current) {
                          setPageSize(pageSize);
                          setPage(1);
                          pageSizeRef.current = pageSize;
                        } else {
                          setPage(page);
                        }
                      }}
                    />

                  </>
                )}
              </DataTable>
            </Column>
        </Grid>
      </Content>
    </Theme>
  );
}

export default CaseList;
