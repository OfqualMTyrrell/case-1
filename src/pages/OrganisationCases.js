import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Content,
  Grid, 
  Column, 
  Theme,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Pagination,
  Tag,
  Checkbox,
  FilterableMultiSelect,
  Button,
  DatePicker,
  DatePickerInput,
  Layer,
  Accordion,
  AccordionItem
} from '@carbon/react';
import AppHeader from '../components/AppHeader';
import OrganisationHeader from '../components/OrganisationHeader';
import regulatedOrganisationsData from '../data/regulated-organisations.json';
import casesData from '../cases.json';
import { getDisplayStatus } from '../utils/caseStatusUtils';

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

function OrganisationCases() {
  const { rnNumber } = useParams();
  const navigate = useNavigate();
  const [organisationData, setOrganisationData] = useState(null);
  const [orgCases, setOrgCases] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const pageSizeRef = useRef(pageSize);
  
  // Pending filters (user selections before applying)
  const [pendingCaseTypeFilter, setPendingCaseTypeFilter] = useState([]);
  const [pendingDateRange, setPendingDateRange] = useState([null, null]);
  const [pendingStatusFilter, setPendingStatusFilter] = useState([]);
  const [pendingCaseLeadFilter, setPendingCaseLeadFilter] = useState([]);
  
  // Applied filters (used for actual filtering)
  const [appliedCaseTypeFilter, setAppliedCaseTypeFilter] = useState([]);
  const [appliedDateRange, setAppliedDateRange] = useState([null, null]);
  const [appliedStatusFilter, setAppliedStatusFilter] = useState([]);
  const [appliedCaseLeadFilter, setAppliedCaseLeadFilter] = useState([]);

  useEffect(() => {
    // Find organisation by RN number
    const org = regulatedOrganisationsData.find(o => o.RNNumber === rnNumber);
    setOrganisationData(org);

    if (org) {
      // Filter cases by organisation name (SubmittedBy field)
      const filteredCases = casesData.filter(c => 
        c.SubmittedBy === org.Name || 
        c.SubmittedBy === org.LegalName ||
        c.SubmittedBy === org.Acronym
      ).map((item, idx) => ({
        id: idx.toString(),
        ...item,
        ReceivedDate: formatDate(item.ReceivedDate), // Format the date for display
        OriginalReceivedDate: item.ReceivedDate, // Keep original for filtering
        Status: getDisplayStatus(item.CaseID, item.Status) // Use dynamic status
      }));
      setOrgCases(filteredCases);
      setFilteredRows(filteredCases);
    }
  }, [rnNumber]);

  useEffect(() => {
    let filtered = orgCases;
    
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
    
    // Apply case lead filter
    if (appliedCaseLeadFilter.length > 0) {
      filtered = filtered.filter(row => appliedCaseLeadFilter.includes(row.CaseLead));
    }
    
    setFilteredRows(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [appliedStatusFilter, appliedCaseTypeFilter, appliedCaseLeadFilter, appliedDateRange, orgCases, searchTerm]);

  if (!organisationData) {
    return (
      <Theme theme="white" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppHeader />
        <Content style={{ width: '100%', margin: '0 auto', flex: 1, padding: '1rem' }}>
          <div>Loading...</div>
        </Content>
      </Theme>
    );
  }

  const headers = [
    { key: 'CaseID', header: 'CaseID' },
    { key: 'Title', header: 'Title' },
    { key: 'CaseType', header: 'Case type' },
    { key: 'ReceivedDate', header: 'Received date' },
    { key: 'Status', header: 'Status' },
    { key: 'CaseLead', header: 'Case lead' }
  ];

  const caseTypeOptions = getUnique(orgCases, 'CaseType');
  const statusOptions = getUnique(orgCases, 'Status');
  const caseLeadOptions = getUnique(orgCases, 'CaseLead');

  const totalItems = filteredRows.length;
  const pagedRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const rows = pagedRows.map(caseItem => ({
    id: caseItem.CaseID,
    CaseID: caseItem.CaseID,
    Title: caseItem.Title,
    CaseType: caseItem.CaseType,
    ReceivedDate: caseItem.ReceivedDate,
    Status: caseItem.Status,
    CaseLead: caseItem.CaseLead
  }));

  // Handle applying filters
  const handleApplyFilters = () => {
    setAppliedCaseTypeFilter(pendingCaseTypeFilter);
    setAppliedDateRange(pendingDateRange);
    setAppliedStatusFilter(pendingStatusFilter);
    setAppliedCaseLeadFilter(pendingCaseLeadFilter);
  };

  // Handle clearing filters
  const handleClearFilters = () => {
    setPendingCaseTypeFilter([]);
    setPendingDateRange([null, null]);
    setPendingStatusFilter([]);
    setPendingCaseLeadFilter([]);
    setAppliedCaseTypeFilter([]);
    setAppliedDateRange([null, null]);
    setAppliedStatusFilter([]);
    setAppliedCaseLeadFilter([]);
  };

  // Check if there are pending changes to show apply button state
  const hasFilterChanges = () => {
    return JSON.stringify(pendingCaseTypeFilter) !== JSON.stringify(appliedCaseTypeFilter) ||
           JSON.stringify(pendingDateRange) !== JSON.stringify(appliedDateRange) ||
           JSON.stringify(pendingStatusFilter) !== JSON.stringify(appliedStatusFilter) ||
           JSON.stringify(pendingCaseLeadFilter) !== JSON.stringify(appliedCaseLeadFilter);
  };

  // Clear individual pending filter sections
  const clearPendingCaseTypeFilter = () => {
    setPendingCaseTypeFilter([]);
  };

  const clearPendingDateRangeFilter = () => {
    setPendingDateRange([null, null]);
  };

  const clearPendingStatusFilter = () => {
    setPendingStatusFilter([]);
  };

  const clearPendingCaseLeadFilter = () => {
    setPendingCaseLeadFilter([]);
  };

  return (
    <Theme theme="white" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <Content style={{ width: '100%', margin: '0 auto', flex: 1, padding: 0, paddingTop: '1em' }}>
        <Grid fullWidth columns={16} mode="narrow" gutter={16}>
          <Column sm={4} md={8} lg={16}>
            <OrganisationHeader 
              organisationData={organisationData}
              activePage="cases"
            />
          </Column>
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
                  {/* Case Type Filter */}
                  <AccordionItem 
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>Case type</span>
                        {pendingCaseTypeFilter.length > 0 && (
                          <Tag 
                            type="high-contrast" 
                            size="sm"
                            filter
                            onClose={(e) => {
                              e.stopPropagation();
                              clearPendingCaseTypeFilter();
                            }}
                            title="Clear case type selections"
                          >
                            {pendingCaseTypeFilter.length}
                          </Tag>
                        )}
                      </div>
                    }
                    open={false}
                  >
                    <div role="group" aria-label="Case type filters" style={{ paddingTop: '0.5rem' }}>
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
                  </AccordionItem>

                  {/* Date Range Filter */}
                  <AccordionItem 
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>Received date</span>
                        {(pendingDateRange[0] && pendingDateRange[1]) && (
                          <Tag 
                            type="high-contrast" 
                            size="sm"
                            filter
                            onClose={(e) => {
                              e.stopPropagation();
                              clearPendingDateRangeFilter();
                            }}
                            title="Clear date range selection"
                          >
                            Range
                          </Tag>
                        )}
                      </div>
                    }
                    open={pendingDateRange[0] && pendingDateRange[1]}
                  >
                    <div style={{ paddingTop: '0.5rem' }}>
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
                    open={pendingStatusFilter.length > 0}
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

                  {/* Case Lead Filter */}
                  <AccordionItem 
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>Case lead</span>
                        {pendingCaseLeadFilter.length > 0 && (
                          <Tag 
                            type="high-contrast" 
                            size="sm"
                            filter
                            onClose={(e) => {
                              e.stopPropagation();
                              clearPendingCaseLeadFilter();
                            }}
                            title="Clear case lead selections"
                          >
                            {pendingCaseLeadFilter.length}
                          </Tag>
                        )}
                      </div>
                    }
                    open={pendingCaseLeadFilter.length > 0}
                  >
                    <div style={{ paddingTop: '0.5rem' }}>
                      <FilterableMultiSelect
                        id="case-lead-filter-v2"
                        items={caseLeadOptions.map(lead => ({ id: lead, text: lead }))}
                        itemToString={item => item?.text || ''}
                        titleText="Case lead"
                        onChange={({ selectedItems }) => setPendingCaseLeadFilter(selectedItems.map(item => item.text))}
                        selectedItems={pendingCaseLeadFilter.map(lead => ({ id: lead, text: lead }))}
                      />
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
            <DataTable rows={rows} headers={headers} isSortable>
            {({
              rows,
              headers,
              getHeaderProps,
              getRowProps,
              getTableProps,
              getToolbarProps,
              onInputChange,
              getTableContainerProps
            }) => (
              <>
              <TableContainer
                {...getTableContainerProps()}
                title=""
              >
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
                      {headers.map((header) => (
                        <TableHeader {...getHeaderProps({ header })} key={header.key}>
                          {header.header}
                        </TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow 
                        {...getRowProps({ row })} 
                        key={row.id}
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
                        {row.cells.map((cell) => {
                          if (cell.info.header === 'Status') {
                            return (
                              <TableCell key={cell.id}>
                                {renderStatusTag(cell.value)}
                              </TableCell>
                            );
                          }
                          return (
                            <TableCell key={cell.id}>
                              {cell.value}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              </>
            )}
          </DataTable>
          <Pagination
            page={currentPage}
            pageSize={pageSize}
            pageSizes={[10, 20, 50, 100]}
            totalItems={totalItems}
            onChange={({ page, pageSize, pageSizes }) => {
              // If the page size changes, reset to first page
              if (pageSize !== pageSizeRef.current) {
                setPageSize(pageSize);
                setCurrentPage(1);
                pageSizeRef.current = pageSize;
              } else {
                setCurrentPage(page);
              }
            }}
          />
              </div>
            </Layer>
          </Column>
        </Grid>
      </Content>
    </Theme>
  );
}

export default OrganisationCases;
