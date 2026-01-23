import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Content, Grid, Column, DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell, TableContainer, TableToolbar, TableToolbarContent, TableToolbarSearch, Checkbox, Tag, FilterableMultiSelect, Pagination, Button, DatePicker, DatePickerInput, Layer, Accordion, AccordionItem } from '@carbon/react';
import regulatedOrgsData from '../data/regulated-organisations.json';
import AppHeader from '../components/AppHeader';

const headers = [
  { key: 'RNNumber', header: 'RN number' },
  { key: 'Name', header: 'Name' },
  { key: 'LegalName', header: 'Legal name' },
  { key: 'Acronym', header: 'Acronym' },
  { key: 'RecognisedOn', header: 'Recognised on' },
  { key: 'PortfolioLead', header: 'Portfolio lead' }
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

function RegulatedOrganisations() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  
  // Pending filters (user selections before applying)
  const [pendingNameFilter, setPendingNameFilter] = useState([]);
  const [pendingAcronymFilter, setPendingAcronymFilter] = useState([]);
  const [pendingPortfolioLeadFilter, setPendingPortfolioLeadFilter] = useState([]);
  const [pendingDateRange, setPendingDateRange] = useState([null, null]);
  
  // Applied filters (used for actual filtering)
  const [appliedNameFilter, setAppliedNameFilter] = useState([]);
  const [appliedAcronymFilter, setAppliedAcronymFilter] = useState([]);
  const [appliedPortfolioLeadFilter, setAppliedPortfolioLeadFilter] = useState([]);
  const [appliedDateRange, setAppliedDateRange] = useState([null, null]);
  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const pageSizeRef = useRef(pageSize);

  useEffect(() => {
    const allRows = regulatedOrgsData.map((item, idx) => ({
      id: idx.toString(),
      ...item,
      RecognisedOn: formatDate(item.RecognisedOn),
      OriginalRecognisedOn: item.RecognisedOn
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
    
    // Apply date range filter
    if (appliedDateRange[0] && appliedDateRange[1]) {
      const startDate = new Date(appliedDateRange[0]);
      const endDate = new Date(appliedDateRange[1]);
      
      filtered = filtered.filter(row => {
        const recognisedDate = new Date(row.OriginalRecognisedOn);
        return recognisedDate >= startDate && recognisedDate <= endDate;
      });
    }
    
    // Apply name filter
    if (appliedNameFilter.length > 0) {
      filtered = filtered.filter(row => appliedNameFilter.includes(row.Name));
    }
    
    // Apply acronym filter
    if (appliedAcronymFilter.length > 0) {
      filtered = filtered.filter(row => appliedAcronymFilter.includes(row.Acronym));
    }
    
    // Apply portfolio lead filter
    if (appliedPortfolioLeadFilter.length > 0) {
      filtered = filtered.filter(row => appliedPortfolioLeadFilter.includes(row.PortfolioLead));
    }
    
    setFilteredRows(filtered);
    setPage(1); // Reset to first page when filters change
  }, [appliedNameFilter, appliedAcronymFilter, appliedPortfolioLeadFilter, appliedDateRange, rows, searchTerm]);

  const nameOptions = getUnique(regulatedOrgsData, 'Name');
  const acronymOptions = getUnique(regulatedOrgsData, 'Acronym');
  const portfolioLeadOptions = getUnique(regulatedOrgsData, 'PortfolioLead');

  const totalItems = filteredRows.length;
  const pagedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  // Handle applying filters
  const handleApplyFilters = () => {
    setAppliedNameFilter(pendingNameFilter);
    setAppliedAcronymFilter(pendingAcronymFilter);
    setAppliedPortfolioLeadFilter(pendingPortfolioLeadFilter);
    setAppliedDateRange(pendingDateRange);
  };

  // Handle clearing filters
  const handleClearFilters = () => {
    setPendingNameFilter([]);
    setPendingAcronymFilter([]);
    setPendingPortfolioLeadFilter([]);
    setPendingDateRange([null, null]);
    setAppliedNameFilter([]);
    setAppliedAcronymFilter([]);
    setAppliedPortfolioLeadFilter([]);
    setAppliedDateRange([null, null]);
  };

  // Check if there are pending changes to show apply button state
  const hasFilterChanges = () => {
    return JSON.stringify(pendingNameFilter) !== JSON.stringify(appliedNameFilter) ||
           JSON.stringify(pendingAcronymFilter) !== JSON.stringify(appliedAcronymFilter) ||
           JSON.stringify(pendingPortfolioLeadFilter) !== JSON.stringify(appliedPortfolioLeadFilter) ||
           JSON.stringify(pendingDateRange) !== JSON.stringify(appliedDateRange);
  };

  // Clear individual pending filter sections
  const clearPendingNameFilter = () => setPendingNameFilter([]);
  const clearPendingAcronymFilter = () => setPendingAcronymFilter([]);
  const clearPendingPortfolioLeadFilter = () => setPendingPortfolioLeadFilter([]);
  const clearPendingDateRangeFilter = () => setPendingDateRange([null, null]);

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
                  {/* Name Filter */}
                  <AccordionItem 
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>Name</span>
                        {pendingNameFilter.length > 0 && (
                          <Tag 
                            type="high-contrast" 
                            size="sm"
                            filter
                            onClose={(e) => {
                              e.stopPropagation();
                              clearPendingNameFilter();
                            }}
                            title="Clear name selections"
                          >
                            {pendingNameFilter.length}
                          </Tag>
                        )}
                      </div>
                    }
                    open={false}
                  >
                    <div style={{ paddingTop: '0.5rem' }}>
                      <FilterableMultiSelect
                        id="name-filter"
                        items={nameOptions.map(name => ({ id: name, text: name }))}
                        itemToString={item => item?.text || ''}
                        titleText="Name"
                        onChange={({ selectedItems }) => setPendingNameFilter(selectedItems.map(item => item.text))}
                        selectedItems={pendingNameFilter.map(name => ({ id: name, text: name }))}
                      />
                    </div>
                  </AccordionItem>

                  {/* Acronym Filter */}
                  <AccordionItem 
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>Acronym</span>
                        {pendingAcronymFilter.length > 0 && (
                          <Tag 
                            type="high-contrast" 
                            size="sm"
                            filter
                            onClose={(e) => {
                              e.stopPropagation();
                              clearPendingAcronymFilter();
                            }}
                            title="Clear acronym selections"
                          >
                            {pendingAcronymFilter.length}
                          </Tag>
                        )}
                      </div>
                    }
                    open={false}
                  >
                    <div role="group" aria-label="Acronym filters" style={{ paddingTop: '0.5rem' }}>
                      {acronymOptions.map(acronym => (
                        <Checkbox
                          key={acronym}
                          id={`acronym-checkbox-${acronym}`}
                          labelText={acronym}
                          checked={pendingAcronymFilter.includes(acronym)}
                          onChange={(e, { checked }) => {
                            setPendingAcronymFilter(checked
                              ? [...pendingAcronymFilter, acronym]
                              : pendingAcronymFilter.filter(a => a !== acronym)
                            );
                          }}
                        />
                      ))}
                    </div>
                  </AccordionItem>

                  {/* Recognised On Date Range Filter */}
                  <AccordionItem 
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>Recognised on</span>
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
                        onChange={(dates) => setPendingDateRange(dates)}
                        value={pendingDateRange}
                      >
                        <DatePickerInput
                          id="recognised-date-start"
                          placeholder=""
                          labelText="Start date"
                          size="md"
                        />
                        <DatePickerInput
                          id="recognised-date-end"
                          placeholder=""
                          labelText="End date"
                          size="md"
                        />
                      </DatePicker>
                    </div>
                  </AccordionItem>

                  {/* Portfolio Lead Filter */}
                  <AccordionItem 
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>Portfolio lead</span>
                        {pendingPortfolioLeadFilter.length > 0 && (
                          <Tag 
                            type="high-contrast" 
                            size="sm"
                            filter
                            onClose={(e) => {
                              e.stopPropagation();
                              clearPendingPortfolioLeadFilter();
                            }}
                            title="Clear portfolio lead selections"
                          >
                            {pendingPortfolioLeadFilter.length}
                          </Tag>
                        )}
                      </div>
                    }
                    open={false}
                  >
                    <div style={{ paddingTop: '0.5rem' }}>
                      <FilterableMultiSelect
                        id="portfolio-lead-filter"
                        items={portfolioLeadOptions.map(lead => ({ id: lead, text: lead }))}
                        itemToString={item => item?.text || ''}
                        titleText="Portfolio lead"
                        onChange={({ selectedItems }) => setPendingPortfolioLeadFilter(selectedItems.map(item => item.text))}
                        selectedItems={pendingPortfolioLeadFilter.map(lead => ({ id: lead, text: lead }))}
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
                <h2 style={{ 
                  padding: '1rem 1rem 0.5rem 1rem', 
                  margin: 0,
                  fontSize: '1.75rem',
                  fontWeight: 400
                }}>
                  Regulated organisations
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
                                                placeholder="Search organisations..."
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
                                            {rows.map(row => {
                                                const originalRow = pagedRows.find(r => r.id === row.id);
                                                return (
                                                    <TableRow 
                                                        key={row.id} 
                                                        {...getRowProps({ row })}
                                                        className="clickable-row"
                                                        onClick={() => {
                                                            if (originalRow?.RNNumber) {
                                                                navigate(`/organisations/${originalRow.RNNumber}`);
                                                            }
                                                        }}
                                                        tabIndex={0}
                                                        style={{ cursor: 'pointer' }}
                                                        aria-label={`View details for ${originalRow?.Name}`}
                                                    >
                                                        {row.cells.map(cell => (
                                                            <TableCell key={cell.id}>
                                                                {cell.value}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                );
                                            })}
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

export default RegulatedOrganisations;
