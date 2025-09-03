import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Content, Grid, Column, DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell, TableContainer, TableToolbar, TableToolbarContent, TableToolbarSearch, Checkbox, Tag, FilterableMultiSelect, Pagination, Button, DatePicker, DatePickerInput, Layer } from '@carbon/react';
import casesData from '../cases.json';
import AppHeader from '../components/AppHeader';
import { getDisplayStatus } from '../utils/caseStatusUtils';
import '@carbon/styles/css/styles.css';

const headers = [
  { key: 'CaseID', header: 'CaseID' },
  { key: 'Title', header: 'Title' },
  { key: 'CaseType', header: 'Case type' },
  { key: 'SubmittedBy', header: 'Submitted by' },
  { key: 'ReceivedDate', header: 'Received date' },
  { key: 'Status', header: 'Status' },
  { key: 'CaseLead', header: 'Case lead' }
];

const getUnique = (arr, key) => Array.from(new Set(arr.map(item => item[key])));

// Helper function to render status with appropriate tag
const renderStatusTag = (status) => {
  switch (status) {
    case 'Received':
      return <Tag type="gray" size="sm">{status}</Tag>;
    case 'Triage':
      return <Tag type="cyan" size="sm">{status}</Tag>;
    case 'Review':
      return <Tag type="teal" size="sm">{status}</Tag>;
    case 'Closed':
      return status; // Just text, no tag
    default:
      return status;
  }
};

// Helper function to format date from YYYY-MM-DD to DD/MM/YYYY
const formatDate = (dateString) => {
  if (!dateString) return dateString;
  
  try {
    // Handle YYYY-MM-DD format specifically
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
    
    // Fallback for other formats
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    return dateString; // Return original if parsing fails
  }
};

function CaseListV2() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0); // Add refresh trigger
  
  // Pending filters (user selections before applying)
  const [pendingStatusFilter, setPendingStatusFilter] = useState([]);
  const [pendingCaseTypeFilter, setPendingCaseTypeFilter] = useState([]);
  const [pendingSubmittedByFilter, setPendingSubmittedByFilter] = useState([]);
  const [pendingDateRange, setPendingDateRange] = useState([null, null]);
  
  // Applied filters (used for actual filtering)
  const [appliedStatusFilter, setAppliedStatusFilter] = useState([]);
  const [appliedCaseTypeFilter, setAppliedCaseTypeFilter] = useState([]);
  const [appliedSubmittedByFilter, setAppliedSubmittedByFilter] = useState([]);
  const [appliedDateRange, setAppliedDateRange] = useState([null, null]);
  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const pageSizeRef = useRef(pageSize);

  // Function to refresh data from session storage
  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Listen for storage events and focus events to refresh data
  useEffect(() => {
    const handleStorageChange = () => {
      refreshData();
    };
    
    const handleFocus = () => {
      refreshData();
    };
    
    // Custom event for immediate data refresh
    const handleDataRefresh = () => {
      refreshData();
    };

    // Listen for storage events (when data changes in other tabs/windows)
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for focus events (when user returns to this tab)
    window.addEventListener('focus', handleFocus);
    
    // Listen for custom refresh events
    window.addEventListener('caseDataRefresh', handleDataRefresh);
    
    // Listen for visibility change (when tab becomes visible)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('caseDataRefresh', handleDataRefresh);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const allRows = casesData.map((item, idx) => ({
      id: idx.toString(),
      ...item,
      ReceivedDate: formatDate(item.ReceivedDate), // Format the date for display
      OriginalReceivedDate: item.ReceivedDate, // Keep original for filtering
      Status: getDisplayStatus(item.CaseID, item.Status) // Use dynamic status
    }));
    setRows(allRows);
    setFilteredRows(allRows);
  }, [refreshKey]); // Depend on refreshKey to trigger updates

  useEffect(() => {
    let filtered = rows;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(row => 
        Object.values(row).some(value => 
          value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Apply date range filter
    if (appliedDateRange[0] && appliedDateRange[1]) {
      const startDate = new Date(appliedDateRange[0]);
      const endDate = new Date(appliedDateRange[1]);
      
      filtered = filtered.filter(row => {
        const receivedDate = new Date(row.OriginalReceivedDate);
        return receivedDate >= startDate && receivedDate <= endDate;
      });
    }
    
    // Apply status filter
    if (appliedStatusFilter.length > 0) {
      filtered = filtered.filter(row => appliedStatusFilter.includes(row.Status));
    }
    
    // Apply case type filter
    if (appliedCaseTypeFilter.length > 0) {
      filtered = filtered.filter(row => appliedCaseTypeFilter.includes(row.CaseType));
    }
    
    // Apply submitted by filter
    if (appliedSubmittedByFilter.length > 0) {
      filtered = filtered.filter(row => appliedSubmittedByFilter.includes(row.SubmittedBy));
    }
    
    setFilteredRows(filtered);
    setPage(1); // Reset to first page when filters change
  }, [appliedStatusFilter, appliedCaseTypeFilter, appliedSubmittedByFilter, appliedDateRange, rows, searchTerm]);

  const statusOptions = getUnique(casesData, 'Status');
  const caseTypeOptions = getUnique(casesData, 'CaseType');
  const submittedByOptions = getUnique(casesData, 'SubmittedBy');

  const totalItems = filteredRows.length;
  const pagedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  // Handle applying filters
  const handleApplyFilters = () => {
    setAppliedStatusFilter(pendingStatusFilter);
    setAppliedCaseTypeFilter(pendingCaseTypeFilter);
    setAppliedSubmittedByFilter(pendingSubmittedByFilter);
    setAppliedDateRange(pendingDateRange);
  };

  // Handle clearing filters
  const handleClearFilters = () => {
    setPendingStatusFilter([]);
    setPendingCaseTypeFilter([]);
    setPendingSubmittedByFilter([]);
    setPendingDateRange([null, null]);
    setAppliedStatusFilter([]);
    setAppliedCaseTypeFilter([]);
    setAppliedSubmittedByFilter([]);
    setAppliedDateRange([null, null]);
  };

  // Check if there are pending changes to show apply button state
  const hasFilterChanges = () => {
    return JSON.stringify(pendingStatusFilter) !== JSON.stringify(appliedStatusFilter) ||
           JSON.stringify(pendingCaseTypeFilter) !== JSON.stringify(appliedCaseTypeFilter) ||
           JSON.stringify(pendingSubmittedByFilter) !== JSON.stringify(appliedSubmittedByFilter) ||
           JSON.stringify(pendingDateRange) !== JSON.stringify(appliedDateRange);
  };

  // Check if there are any applied filters to show clear button
  const hasAppliedFilters = () => {
    return appliedStatusFilter.length > 0 || 
           appliedCaseTypeFilter.length > 0 || 
           appliedSubmittedByFilter.length > 0 ||
           (appliedDateRange[0] && appliedDateRange[1]);
  };

  return (
    <>
      <AppHeader />
      <Content>
        <Grid fullWidth columns={16} mode="narrow" gutter={16}>
          <Column lg={4} md={4} sm={4}>
            <Layer>
              <div style={{ 
                padding: '1.5rem', 
                minWidth: 0,
                borderRight: '1px solid var(--cds-border-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                  <h6 className="cds--label" style={{ margin: 0 }}>Status</h6>
                  {pendingStatusFilter.length > 0 && (
                    <Tag 
                      type="high-contrast" 
                      size="md" 
                      style={{ marginLeft: 8 }}
                      filter
                      onClose={() => {
                        setPendingStatusFilter([]);
                      }}
                    title="Click to clear status filter selections"
                  >
                    {pendingStatusFilter.length}
                  </Tag>
                )}
              </div>
              <div role="group" aria-label="Status filters">
                {statusOptions.map(status => (
                  <Checkbox
                    key={status}
                    id={`status-checkbox-${status}`}
                    labelText={status}
                    checked={pendingStatusFilter.includes(status)}
                    onChange={(e, { checked }) => {
                      setPendingStatusFilter(checked
                        ? [...pendingStatusFilter, status]
                        : pendingStatusFilter.filter(s => s !== status)
                      );
                    }}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0 1rem 0' }}>
                <h6 className="cds--label" style={{ margin: 0 }}>Case Type</h6>
                {pendingCaseTypeFilter.length > 0 && (
                  <Tag 
                    type="high-contrast" 
                    size="md" 
                    style={{ marginLeft: 8 }}
                    filter
                    onClose={() => {
                      setPendingCaseTypeFilter([]);
                    }}
                    title="Click to clear case type filter selections"
                  >
                    {pendingCaseTypeFilter.length}
                  </Tag>
                )}
              </div>
              <div role="group" aria-label="Case type filters">
                {caseTypeOptions.map(type => (
                  <Checkbox
                    key={type}
                    id={`case-type-checkbox-${type}`}
                    labelText={type}
                    checked={pendingCaseTypeFilter.includes(type)}
                    onChange={(e, { checked }) => {
                      setPendingCaseTypeFilter(checked
                        ? [...pendingCaseTypeFilter, type]
                        : pendingCaseTypeFilter.filter(t => t !== type)
                      );
                    }}
                  />
                ))}
              </div>
              
              <div style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                  <h6 className="cds--label" style={{ margin: 0 }}>Received date range</h6>
                  {(pendingDateRange[0] && pendingDateRange[1]) && (
                    <Tag 
                      type="high-contrast" 
                      size="md" 
                      style={{ marginLeft: 8 }}
                      filter
                      onClose={() => {
                        setPendingDateRange([null, null]);
                      }}
                      title="Click to clear date range selection"
                    >
                      Range
                    </Tag>
                  )}
                </div>
                <DatePicker 
                  datePickerType="range"
                  dateFormat="d/m/Y"
                  onChange={(dates) => {
                    setPendingDateRange(dates);
                  }}
                  value={pendingDateRange}
                >
                  <DatePickerInput
                    id="date-picker-input-id-start"
                    placeholder=""
                    labelText="Start date"
                    size="md"
                  />
                  <DatePickerInput
                    id="date-picker-input-id-finish"
                    placeholder=""
                    labelText="End date"
                    size="md"
                  />
                </DatePicker>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0 1rem 0' }}>
                <h6 className="cds--label" style={{ margin: 0 }}>Submitted By</h6>
                {pendingSubmittedByFilter.length > 0 && (
                  <Tag 
                    type="high-contrast" 
                    size="md" 
                    style={{ marginLeft: 8 }}
                    filter
                    onClose={() => {
                      setPendingSubmittedByFilter([]);
                    }}
                    title="Click to clear submitted by filter selections"
                  >
                    {pendingSubmittedByFilter.length}
                  </Tag>
                )}
              </div>
              <div role="group" aria-label="Submitted by filters">
                <FilterableMultiSelect
                  id="submitted-by-filter-v2"
                  items={submittedByOptions.map(submitter => ({ id: submitter, text: submitter }))}
                  itemToString={item => item?.text || ''}
                  titleText=""
                  onChange={({ selectedItems }) => setPendingSubmittedByFilter(selectedItems.map(item => item.text))}
                  selectedItems={pendingSubmittedByFilter.map(submitter => ({ id: submitter, text: submitter }))}
                  className="left-aligned-multiselect"
                />
              </div>
              
              {/* Filter Action Buttons */}
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1px' }}>
                <Button
                  kind="ghost"
                  size="lg"
                  onClick={handleClearFilters}
                  style={{ flex: 1, maxWidth: 'none' }}
                >
                  Clear filters
                </Button>
                <Button
                  kind="primary"
                  size="lg"
                  onClick={handleApplyFilters}
                  disabled={!hasFilterChanges()}
                  style={{ flex: 1, maxWidth: 'none' }}
                >
                  Apply filters
                </Button>
              </div>
              </div>
            </Layer>
          </Column>
          <Column lg={12} md={8} sm={4}>
            <Layer level={0}>
              <div style={{ 
                backgroundColor: 'var(--cds-layer)',
                borderLeft: '1px solid var(--cds-border-subtle)'
              }}>
                <DataTable rows={pagedRows} headers={headers} isSortable>
                        {({
                            rows,
                            headers,
                            getHeaderProps,
                            getRowProps,
                            getTableProps,
                            getTableContainerProps,
                            getToolbarProps,
                            onInputChange,
                        }) => (
                            <>
                                <TableContainer title="" {...getTableContainerProps()}>
                                    <TableToolbar {...getToolbarProps()}>
                                        <TableToolbarContent>
                                            <TableToolbarSearch 
                                                onChange={(evt) => {
                                                    setSearchTerm(evt.target.value);
                                                    onInputChange(evt);
                                                }} 
                                                persistent={true}
                                                placeholder="Search cases..."
                                            />
                                        </TableToolbarContent>
                                    </TableToolbar>
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
                                                            {cell.info?.header === 'Status' 
                                                                ? renderStatusTag(cell.value)
                                                                : cell.value
                                                            }
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        )}
                    </DataTable>
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
                </div>
                </Layer>
                </Column>
            </Grid>
        </Content>
    </>
);
}

export default CaseListV2;
