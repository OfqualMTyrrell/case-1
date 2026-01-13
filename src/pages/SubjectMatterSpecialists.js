import React, { useEffect, useState, useRef } from 'react';
import { Content, Grid, Column, DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell, TableContainer, TableToolbar, TableToolbarContent, TableToolbarSearch, Checkbox, Tag, FilterableMultiSelect, Pagination, Button, DatePicker, DatePickerInput, Layer, Accordion, AccordionItem } from '@carbon/react';
import specialistsData from '../data/subject-matter-specialists.json';
import AppHeader from '../components/AppHeader';

const headers = [
  { key: 'ID', header: 'ID' },
  { key: 'FullName', header: 'Full name' },
  { key: 'Status', header: 'Status' },
  { key: 'DateFirstApproved', header: 'Date first approved' },
  { key: 'RenewalDate', header: 'Renewal date' },
  { key: 'NumberOfCommissions', header: 'Number of commissions' },
];

const getUnique = (arr, key) => Array.from(new Set(arr.map(item => item[key])));

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

function SubjectMatterSpecialists() {
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  
  // Pending filters (user selections before applying)
  const [pendingFullNameFilter, setPendingFullNameFilter] = useState([]);
  const [pendingStatusFilter, setPendingStatusFilter] = useState([]);
  const [pendingDateFirstApprovedRange, setPendingDateFirstApprovedRange] = useState([null, null]);
  const [pendingRenewalDateRange, setPendingRenewalDateRange] = useState([null, null]);
  const [pendingCommissionsFilter, setPendingCommissionsFilter] = useState([]);
  
  // Applied filters (used for actual filtering)
  const [appliedFullNameFilter, setAppliedFullNameFilter] = useState([]);
  const [appliedStatusFilter, setAppliedStatusFilter] = useState([]);
  const [appliedDateFirstApprovedRange, setAppliedDateFirstApprovedRange] = useState([null, null]);
  const [appliedRenewalDateRange, setAppliedRenewalDateRange] = useState([null, null]);
  const [appliedCommissionsFilter, setAppliedCommissionsFilter] = useState([]);
  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const pageSizeRef = useRef(pageSize);

  useEffect(() => {
    const allRows = specialistsData.map((item, idx) => ({
      id: idx.toString(),
      ...item,
      DateFirstApproved: formatDate(item.DateFirstApproved),
      OriginalDateFirstApproved: item.DateFirstApproved,
      RenewalDate: formatDate(item.RenewalDate),
      OriginalRenewalDate: item.RenewalDate
    }));
    setRows(allRows);
    setFilteredRows(allRows);
  }, []);

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
    
    // Apply date first approved range filter
    if (appliedDateFirstApprovedRange[0] && appliedDateFirstApprovedRange[1]) {
      const startDate = new Date(appliedDateFirstApprovedRange[0]);
      const endDate = new Date(appliedDateFirstApprovedRange[1]);
      
      filtered = filtered.filter(row => {
        const approvedDate = new Date(row.OriginalDateFirstApproved);
        return approvedDate >= startDate && approvedDate <= endDate;
      });
    }
    
    // Apply renewal date range filter
    if (appliedRenewalDateRange[0] && appliedRenewalDateRange[1]) {
      const startDate = new Date(appliedRenewalDateRange[0]);
      const endDate = new Date(appliedRenewalDateRange[1]);
      
      filtered = filtered.filter(row => {
        const renewalDate = new Date(row.OriginalRenewalDate);
        return renewalDate >= startDate && renewalDate <= endDate;
      });
    }
    
    // Apply full name filter
    if (appliedFullNameFilter.length > 0) {
      filtered = filtered.filter(row => appliedFullNameFilter.includes(row.FullName));
    }
    
    // Apply status filter
    if (appliedStatusFilter.length > 0) {
      filtered = filtered.filter(row => appliedStatusFilter.includes(row.Status));
    }
    
    // Apply commissions filter
    if (appliedCommissionsFilter.length > 0) {
      filtered = filtered.filter(row => appliedCommissionsFilter.includes(row.NumberOfCommissions.toString()));
    }
    
    setFilteredRows(filtered);
    setPage(1); // Reset to first page when filters change
  }, [appliedFullNameFilter, appliedStatusFilter, appliedDateFirstApprovedRange, appliedRenewalDateRange, appliedCommissionsFilter, rows, searchTerm]);

  const fullNameOptions = getUnique(specialistsData, 'FullName');
  const statusOptions = getUnique(specialistsData, 'Status');
  const commissionsOptions = getUnique(specialistsData, 'NumberOfCommissions').map(n => n.toString()).sort((a, b) => parseInt(a) - parseInt(b));

  const totalItems = filteredRows.length;
  const pagedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  // Handle applying filters
  const handleApplyFilters = () => {
    setAppliedFullNameFilter(pendingFullNameFilter);
    setAppliedStatusFilter(pendingStatusFilter);
    setAppliedDateFirstApprovedRange(pendingDateFirstApprovedRange);
    setAppliedRenewalDateRange(pendingRenewalDateRange);
    setAppliedCommissionsFilter(pendingCommissionsFilter);
  };

  // Handle clearing filters
  const handleClearFilters = () => {
    setPendingFullNameFilter([]);
    setPendingStatusFilter([]);
    setPendingDateFirstApprovedRange([null, null]);
    setPendingRenewalDateRange([null, null]);
    setPendingCommissionsFilter([]);
    setAppliedFullNameFilter([]);
    setAppliedStatusFilter([]);
    setAppliedDateFirstApprovedRange([null, null]);
    setAppliedRenewalDateRange([null, null]);
    setAppliedCommissionsFilter([]);
  };

  // Check if there are pending changes to show apply button state
  const hasFilterChanges = () => {
    return JSON.stringify(pendingFullNameFilter) !== JSON.stringify(appliedFullNameFilter) ||
           JSON.stringify(pendingStatusFilter) !== JSON.stringify(appliedStatusFilter) ||
           JSON.stringify(pendingDateFirstApprovedRange) !== JSON.stringify(appliedDateFirstApprovedRange) ||
           JSON.stringify(pendingRenewalDateRange) !== JSON.stringify(appliedRenewalDateRange) ||
           JSON.stringify(pendingCommissionsFilter) !== JSON.stringify(appliedCommissionsFilter);
  };

  // Clear individual pending filter sections
  const clearPendingFullNameFilter = () => setPendingFullNameFilter([]);
  const clearPendingStatusFilter = () => setPendingStatusFilter([]);
  const clearPendingDateFirstApprovedFilter = () => setPendingDateFirstApprovedRange([null, null]);
  const clearPendingRenewalDateFilter = () => setPendingRenewalDateRange([null, null]);
  const clearPendingCommissionsFilter = () => setPendingCommissionsFilter([]);

  return (
    <>
      <AppHeader />
      <Content>
        <Grid fullWidth columns={16} mode="narrow" gutter={16}>
          <Column lg={4} md={4} sm={4}>
            <div style={{  
              minWidth: 0,
              borderRight: '1px solid var(--cds-border-subtle)'
            }}>
              <style>{`
                  .filters-heading {
                    font-size: 1rem !important;
                    line-height: 1.29 !important;
                    font-weight: 600 !important;
                  }
                  .cds--accordion__title,
                  .cds--accordion__content {
                    font-size: 1rem !important;
                    line-height: 1.5 !important;
                  }
                `}</style>
                <h3 className="filters-heading" style={{ 
                  padding: '1rem 1rem 0.5rem 1rem', 
                  margin: 0
                }}>
                  Filters
                </h3>
                <Accordion isFlush>
                  {/* Full Name Filter */}
                  <AccordionItem 
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>Full name</span>
                        {pendingFullNameFilter.length > 0 && (
                          <Tag 
                            type="high-contrast" 
                            size="sm"
                            filter
                            onClose={(e) => {
                              e.stopPropagation();
                              clearPendingFullNameFilter();
                            }}
                            title="Clear full name selections"
                          >
                            {pendingFullNameFilter.length}
                          </Tag>
                        )}
                      </div>
                    }
                    open={false}
                  >
                    <div style={{ paddingTop: '0.5rem' }}>
                      <FilterableMultiSelect
                        id="fullname-filter"
                        items={fullNameOptions.map(name => ({ id: name, text: name }))}
                        itemToString={item => item?.text || ''}
                        titleText="Full name"
                        onChange={({ selectedItems }) => setPendingFullNameFilter(selectedItems.map(item => item.text))}
                        selectedItems={pendingFullNameFilter.map(name => ({ id: name, text: name }))}
                      />
                    </div>
                  </AccordionItem>

                  {/* Status Filter */}
                  <AccordionItem 
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>Status</span>
                        {pendingStatusFilter.length > 0 && (
                          <Tag 
                            type="high-contrast" 
                            size="sm"
                            filter
                            onClose={(e) => {
                              e.stopPropagation();
                              clearPendingStatusFilter();
                            }}
                            title="Clear status selections"
                          >
                            {pendingStatusFilter.length}
                          </Tag>
                        )}
                      </div>
                    }
                    open={false}
                  >
                    <div role="group" aria-label="Status filters" style={{ paddingTop: '0.5rem' }}>
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
                  </AccordionItem>

                  {/* Date First Approved Range Filter */}
                  <AccordionItem 
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>Date first approved</span>
                        {(pendingDateFirstApprovedRange[0] && pendingDateFirstApprovedRange[1]) && (
                          <Tag 
                            type="high-contrast" 
                            size="sm"
                            filter
                            onClose={(e) => {
                              e.stopPropagation();
                              clearPendingDateFirstApprovedFilter();
                            }}
                            title="Clear date first approved range"
                          >
                            Range
                          </Tag>
                        )}
                      </div>
                    }
                    open={pendingDateFirstApprovedRange[0] && pendingDateFirstApprovedRange[1]}
                  >
                    <div style={{ paddingTop: '0.5rem' }}>
                      <DatePicker 
                        datePickerType="range"
                        dateFormat="d/m/Y"
                        onChange={(dates) => setPendingDateFirstApprovedRange(dates)}
                        value={pendingDateFirstApprovedRange}
                      >
                        <DatePickerInput
                          id="approved-date-start"
                          placeholder=""
                          labelText="Start date"
                          size="md"
                        />
                        <DatePickerInput
                          id="approved-date-end"
                          placeholder=""
                          labelText="End date"
                          size="md"
                        />
                      </DatePicker>
                    </div>
                  </AccordionItem>

                  {/* Renewal Date Range Filter */}
                  <AccordionItem 
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>Renewal date</span>
                        {(pendingRenewalDateRange[0] && pendingRenewalDateRange[1]) && (
                          <Tag 
                            type="high-contrast" 
                            size="sm"
                            filter
                            onClose={(e) => {
                              e.stopPropagation();
                              clearPendingRenewalDateFilter();
                            }}
                            title="Clear renewal date range"
                          >
                            Range
                          </Tag>
                        )}
                      </div>
                    }
                    open={pendingRenewalDateRange[0] && pendingRenewalDateRange[1]}
                  >
                    <div style={{ paddingTop: '0.5rem' }}>
                      <DatePicker 
                        datePickerType="range"
                        dateFormat="d/m/Y"
                        onChange={(dates) => setPendingRenewalDateRange(dates)}
                        value={pendingRenewalDateRange}
                      >
                        <DatePickerInput
                          id="renewal-date-start"
                          placeholder=""
                          labelText="Start date"
                          size="md"
                        />
                        <DatePickerInput
                          id="renewal-date-end"
                          placeholder=""
                          labelText="End date"
                          size="md"
                        />
                      </DatePicker>
                    </div>
                  </AccordionItem>

                  {/* Number of Commissions Filter */}
                  <AccordionItem 
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>Number of commissions</span>
                        {pendingCommissionsFilter.length > 0 && (
                          <Tag 
                            type="high-contrast" 
                            size="sm"
                            filter
                            onClose={(e) => {
                              e.stopPropagation();
                              clearPendingCommissionsFilter();
                            }}
                            title="Clear commissions selections"
                          >
                            {pendingCommissionsFilter.length}
                          </Tag>
                        )}
                      </div>
                    }
                    open={false}
                  >
                    <div role="group" aria-label="Commissions filters" style={{ paddingTop: '0.5rem' }}>
                      {commissionsOptions.map(num => (
                        <Checkbox
                          key={num}
                          id={`commissions-checkbox-${num}`}
                          labelText={num}
                          checked={pendingCommissionsFilter.includes(num)}
                          onChange={(e, { checked }) => {
                            setPendingCommissionsFilter(checked
                              ? [...pendingCommissionsFilter, num]
                              : pendingCommissionsFilter.filter(n => n !== num)
                            );
                          }}
                        />
                      ))}
                    </div>
                  </AccordionItem>
                </Accordion>
                
                {/* Filter Action Buttons */}
                <div style={{ margin: '1rem', display: 'flex', gap: '1px' }}>
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
          </Column>
          <Column lg={12} md={8} sm={4}>
            <Layer level={0}>
              <div style={{ 
                backgroundColor: 'var(--cds-layer)',
                borderLeft: '1px solid var(--cds-border-subtle)'
              }}>
                <h2 style={{ 
                  padding: '1rem 1rem 0.5rem 1rem', 
                  margin: 0,
                  fontSize: '1.75rem',
                  fontWeight: 400
                }}>
                  Subject matter specialists
                </h2>
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
                                                placeholder="Search specialists..."
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
                                                        console.log('Subject matter specialist clicked:', row.id);
                                                    }}
                                                    tabIndex={0}
                                                    style={{ cursor: 'pointer' }}
                                                    aria-label={`View details for ${row.cells.find(c => c.info?.header === 'Full name')?.value}`}
                                                >
                                                    {row.cells.map(cell => (
                                                        <TableCell key={cell.id}>
                                                            {cell.value}
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

export default SubjectMatterSpecialists;
