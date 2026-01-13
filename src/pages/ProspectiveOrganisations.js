import React, { useEffect, useState, useRef } from 'react';
import { Content, Grid, Column, DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell, TableContainer, TableToolbar, TableToolbarContent, TableToolbarSearch, Checkbox, Tag, FilterableMultiSelect, Pagination, Button, Layer, Accordion, AccordionItem } from '@carbon/react';
import prospectiveOrgsData from '../data/prospective-organisations.json';
import AppHeader from '../components/AppHeader';

const headers = [
  { key: 'ID', header: 'ID' },
  { key: 'Name', header: 'Name' },
  { key: 'LegalName', header: 'Legal name' },
  { key: 'Acronym', header: 'Acronym' },
  { key: 'ApplicationVersion', header: 'Application version' },
  { key: 'EngagementLead', header: 'Engagement lead' }
];

const getUnique = (arr, key) => Array.from(new Set(arr.map(item => item[key])));

function ProspectiveOrganisations() {
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  
  // Pending filters (user selections before applying)
  const [pendingNameFilter, setPendingNameFilter] = useState([]);
  const [pendingAcronymFilter, setPendingAcronymFilter] = useState([]);
  const [pendingApplicationVersionFilter, setPendingApplicationVersionFilter] = useState([]);
  const [pendingEngagementLeadFilter, setPendingEngagementLeadFilter] = useState([]);
  
  // Applied filters (used for actual filtering)
  const [appliedNameFilter, setAppliedNameFilter] = useState([]);
  const [appliedAcronymFilter, setAppliedAcronymFilter] = useState([]);
  const [appliedApplicationVersionFilter, setAppliedApplicationVersionFilter] = useState([]);
  const [appliedEngagementLeadFilter, setAppliedEngagementLeadFilter] = useState([]);
  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const pageSizeRef = useRef(pageSize);

  useEffect(() => {
    const allRows = prospectiveOrgsData.map((item, idx) => ({
      id: idx.toString(),
      ...item
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
    
    // Apply name filter
    if (appliedNameFilter.length > 0) {
      filtered = filtered.filter(row => appliedNameFilter.includes(row.Name));
    }
    
    // Apply acronym filter
    if (appliedAcronymFilter.length > 0) {
      filtered = filtered.filter(row => appliedAcronymFilter.includes(row.Acronym));
    }
    
    // Apply application version filter
    if (appliedApplicationVersionFilter.length > 0) {
      filtered = filtered.filter(row => appliedApplicationVersionFilter.includes(row.ApplicationVersion));
    }
    
    // Apply engagement lead filter
    if (appliedEngagementLeadFilter.length > 0) {
      filtered = filtered.filter(row => appliedEngagementLeadFilter.includes(row.EngagementLead));
    }
    
    setFilteredRows(filtered);
    setPage(1); // Reset to first page when filters change
  }, [appliedNameFilter, appliedAcronymFilter, appliedApplicationVersionFilter, appliedEngagementLeadFilter, rows, searchTerm]);

  const nameOptions = getUnique(prospectiveOrgsData, 'Name');
  const acronymOptions = getUnique(prospectiveOrgsData, 'Acronym');
  const applicationVersionOptions = getUnique(prospectiveOrgsData, 'ApplicationVersion').sort();
  const engagementLeadOptions = getUnique(prospectiveOrgsData, 'EngagementLead');

  const totalItems = filteredRows.length;
  const pagedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  // Handle applying filters
  const handleApplyFilters = () => {
    setAppliedNameFilter(pendingNameFilter);
    setAppliedAcronymFilter(pendingAcronymFilter);
    setAppliedApplicationVersionFilter(pendingApplicationVersionFilter);
    setAppliedEngagementLeadFilter(pendingEngagementLeadFilter);
  };

  // Handle clearing filters
  const handleClearFilters = () => {
    setPendingNameFilter([]);
    setPendingAcronymFilter([]);
    setPendingApplicationVersionFilter([]);
    setPendingEngagementLeadFilter([]);
    setAppliedNameFilter([]);
    setAppliedAcronymFilter([]);
    setAppliedApplicationVersionFilter([]);
    setAppliedEngagementLeadFilter([]);
  };

  // Check if there are pending changes to show apply button state
  const hasFilterChanges = () => {
    return JSON.stringify(pendingNameFilter) !== JSON.stringify(appliedNameFilter) ||
           JSON.stringify(pendingAcronymFilter) !== JSON.stringify(appliedAcronymFilter) ||
           JSON.stringify(pendingApplicationVersionFilter) !== JSON.stringify(appliedApplicationVersionFilter) ||
           JSON.stringify(pendingEngagementLeadFilter) !== JSON.stringify(appliedEngagementLeadFilter);
  };

  // Clear individual pending filter sections
  const clearPendingNameFilter = () => setPendingNameFilter([]);
  const clearPendingAcronymFilter = () => setPendingAcronymFilter([]);
  const clearPendingApplicationVersionFilter = () => setPendingApplicationVersionFilter([]);
  const clearPendingEngagementLeadFilter = () => setPendingEngagementLeadFilter([]);

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

                  {/* Application Version Filter */}
                  <AccordionItem 
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>Application version</span>
                        {pendingApplicationVersionFilter.length > 0 && (
                          <Tag 
                            type="high-contrast" 
                            size="sm"
                            filter
                            onClose={(e) => {
                              e.stopPropagation();
                              clearPendingApplicationVersionFilter();
                            }}
                            title="Clear application version selections"
                          >
                            {pendingApplicationVersionFilter.length}
                          </Tag>
                        )}
                      </div>
                    }
                    open={false}
                  >
                    <div role="group" aria-label="Application version filters" style={{ paddingTop: '0.5rem' }}>
                      {applicationVersionOptions.map(version => (
                        <Checkbox
                          key={version}
                          id={`app-version-checkbox-${version}`}
                          labelText={version}
                          checked={pendingApplicationVersionFilter.includes(version)}
                          onChange={(e, { checked }) => {
                            setPendingApplicationVersionFilter(checked
                              ? [...pendingApplicationVersionFilter, version]
                              : pendingApplicationVersionFilter.filter(v => v !== version)
                            );
                          }}
                        />
                      ))}
                    </div>
                  </AccordionItem>

                  {/* Engagement Lead Filter */}
                  <AccordionItem 
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>Engagement lead</span>
                        {pendingEngagementLeadFilter.length > 0 && (
                          <Tag 
                            type="high-contrast" 
                            size="sm"
                            filter
                            onClose={(e) => {
                              e.stopPropagation();
                              clearPendingEngagementLeadFilter();
                            }}
                            title="Clear engagement lead selections"
                          >
                            {pendingEngagementLeadFilter.length}
                          </Tag>
                        )}
                      </div>
                    }
                    open={false}
                  >
                    <div style={{ paddingTop: '0.5rem' }}>
                      <FilterableMultiSelect
                        id="engagement-lead-filter"
                        items={engagementLeadOptions.map(lead => ({ id: lead, text: lead }))}
                        itemToString={item => item?.text || ''}
                        titleText="Engagement lead"
                        onChange={({ selectedItems }) => setPendingEngagementLeadFilter(selectedItems.map(item => item.text))}
                        selectedItems={pendingEngagementLeadFilter.map(lead => ({ id: lead, text: lead }))}
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
                  Prospective organisations
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
                                            {rows.map(row => (
                                                <TableRow 
                                                    key={row.id} 
                                                    {...getRowProps({ row })}
                                                    className="clickable-row"
                                                    onClick={() => {
                                                        console.log('Prospective organisation clicked:', row.id);
                                                    }}
                                                    tabIndex={0}
                                                    style={{ cursor: 'pointer' }}
                                                    aria-label={`View details for ${row.cells.find(c => c.info?.header === 'Name')?.value}`}
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

export default ProspectiveOrganisations;
