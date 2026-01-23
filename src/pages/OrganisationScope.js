import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Content,
  Grid, 
  Column, 
  Theme,
  Tile,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Pagination,
  Tag,
  Checkbox,
  FilterableMultiSelect,
  Button,
  Layer,
  Accordion,
  AccordionItem
} from '@carbon/react';
import AppHeader from '../components/AppHeader';
import OrganisationHeader from '../components/OrganisationHeader';
import regulatedOrganisationsData from '../data/regulated-organisations.json';

const getUnique = (arr, key) => Array.from(new Set(arr.map(item => item[key])));

function OrganisationScope() {
  const { rnNumber } = useParams();
  const [organisationData, setOrganisationData] = useState(null);
  const [expandedRowIds, setExpandedRowIds] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const pageSizeRef = useRef(pageSize);
  
  // Pending filters
  const [pendingSsaTier1Filter, setPendingSsaTier1Filter] = useState([]);
  const [pendingSsaTier2Filter, setPendingSsaTier2Filter] = useState([]);
  const [pendingPermissionTypeFilter, setPendingPermissionTypeFilter] = useState([]);
  const [pendingLevelFilter, setPendingLevelFilter] = useState([]);
  const [pendingStatusFilter, setPendingStatusFilter] = useState([]);
  const [pendingScopeInclusionFilter, setPendingScopeInclusionFilter] = useState([]);
  
  // Applied filters
  const [appliedSsaTier1Filter, setAppliedSsaTier1Filter] = useState([]);
  const [appliedSsaTier2Filter, setAppliedSsaTier2Filter] = useState([]);
  const [appliedPermissionTypeFilter, setAppliedPermissionTypeFilter] = useState([]);
  const [appliedLevelFilter, setAppliedLevelFilter] = useState([]);
  const [appliedStatusFilter, setAppliedStatusFilter] = useState([]);
  const [appliedScopeInclusionFilter, setAppliedScopeInclusionFilter] = useState([]);

  useEffect(() => {
    const org = regulatedOrganisationsData.find(o => o.RNNumber === rnNumber);
    setOrganisationData(org);
  }, [rnNumber]);

  useEffect(() => {
    if (!organisationData) return;
    
    const scope = organisationData.scope || [];
    
    // Apply search filter
    let filtered = scope;
    
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.ssaCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ssaTier1?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ssaTier2?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.permissionType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.level?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply SSA Tier 1 filter
    if (appliedSsaTier1Filter.length > 0) {
      filtered = filtered.filter(item => appliedSsaTier1Filter.includes(item.ssaTier1));
    }
    
    // Apply SSA Tier 2 filter
    if (appliedSsaTier2Filter.length > 0) {
      filtered = filtered.filter(item => appliedSsaTier2Filter.includes(item.ssaTier2));
    }
    
    // Apply Permission Type filter
    if (appliedPermissionTypeFilter.length > 0) {
      filtered = filtered.filter(item => appliedPermissionTypeFilter.includes(item.permissionType));
    }
    
    // Apply Level filter
    if (appliedLevelFilter.length > 0) {
      filtered = filtered.filter(item => appliedLevelFilter.includes(item.level));
    }
    
    // Apply Status filter
    if (appliedStatusFilter.length > 0) {
      filtered = filtered.filter(item => appliedStatusFilter.includes(item.status));
    }
    
    // Apply Scope Inclusion filter
    if (appliedScopeInclusionFilter.length > 0) {
      filtered = filtered.filter(item => appliedScopeInclusionFilter.includes(item.scopeInclusion));
    }
    
    setFilteredRows(filtered);
    setCurrentPage(1);
  }, [organisationData, searchTerm, appliedSsaTier1Filter, appliedSsaTier2Filter, appliedPermissionTypeFilter, appliedLevelFilter, appliedStatusFilter, appliedScopeInclusionFilter]);

  const onExpand = (rowId) => {
    setExpandedRowIds((prev) =>
      prev.includes(rowId)
        ? prev.filter((id) => id !== rowId)
        : [...prev, rowId]
    );
  };

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

  const scope = organisationData.scope || [];

  // Get unique values for filter options
  const ssaTier1Options = getUnique(scope, 'ssaTier1').sort();
  const ssaTier2Options = getUnique(scope, 'ssaTier2').sort();
  const permissionTypeOptions = getUnique(scope, 'permissionType').sort();
  const levelOptions = getUnique(scope, 'level').sort((a, b) => {
    // Sort Entry levels first, then numeric
    if (a.startsWith('Entry')) return -1;
    if (b.startsWith('Entry')) return 1;
    return parseInt(a) - parseInt(b);
  });
  const statusOptions = getUnique(scope, 'status').sort();
  const scopeInclusionOptions = getUnique(scope, 'scopeInclusion').sort();

  // Filter handlers
  const handleApplyFilters = () => {
    setAppliedSsaTier1Filter(pendingSsaTier1Filter);
    setAppliedSsaTier2Filter(pendingSsaTier2Filter);
    setAppliedPermissionTypeFilter(pendingPermissionTypeFilter);
    setAppliedLevelFilter(pendingLevelFilter);
    setAppliedStatusFilter(pendingStatusFilter);
    setAppliedScopeInclusionFilter(pendingScopeInclusionFilter);
  };

  const handleClearFilters = () => {
    setPendingSsaTier1Filter([]);
    setPendingSsaTier2Filter([]);
    setPendingPermissionTypeFilter([]);
    setPendingLevelFilter([]);
    setPendingStatusFilter([]);
    setPendingScopeInclusionFilter([]);
    setAppliedSsaTier1Filter([]);
    setAppliedSsaTier2Filter([]);
    setAppliedPermissionTypeFilter([]);
    setAppliedLevelFilter([]);
    setAppliedStatusFilter([]);
    setAppliedScopeInclusionFilter([]);
  };

  const hasFilterChanges = () => {
    return JSON.stringify(pendingSsaTier1Filter) !== JSON.stringify(appliedSsaTier1Filter) ||
           JSON.stringify(pendingSsaTier2Filter) !== JSON.stringify(appliedSsaTier2Filter) ||
           JSON.stringify(pendingPermissionTypeFilter) !== JSON.stringify(appliedPermissionTypeFilter) ||
           JSON.stringify(pendingLevelFilter) !== JSON.stringify(appliedLevelFilter) ||
           JSON.stringify(pendingStatusFilter) !== JSON.stringify(appliedStatusFilter) ||
           JSON.stringify(pendingScopeInclusionFilter) !== JSON.stringify(appliedScopeInclusionFilter);
  };

  const clearPendingSsaTier1Filter = () => {
    setPendingSsaTier1Filter([]);
    setAppliedSsaTier1Filter([]);
  };

  const clearPendingSsaTier2Filter = () => {
    setPendingSsaTier2Filter([]);
    setAppliedSsaTier2Filter([]);
  };

  const clearPendingPermissionTypeFilter = () => {
    setPendingPermissionTypeFilter([]);
    setAppliedPermissionTypeFilter([]);
  };

  const clearPendingLevelFilter = () => {
    setPendingLevelFilter([]);
    setAppliedLevelFilter([]);
  };

  const clearPendingStatusFilter = () => {
    setPendingStatusFilter([]);
    setAppliedStatusFilter([]);
  };

  const clearPendingScopeInclusionFilter = () => {
    setPendingScopeInclusionFilter([]);
    setAppliedScopeInclusionFilter([]);
  };

  const headers = [
    { key: 'ssaCode', header: 'SSA Code' },
    { key: 'ssaTier1', header: 'SSA Tier 1' },
    { key: 'ssaTier2', header: 'SSA Tier 2' },
    { key: 'permissionType', header: 'Permission Type' },
    { key: 'level', header: 'Level' },
    { key: 'status', header: 'Status' },
    { key: 'scopeInclusion', header: 'Scope Inclusion' }
  ];

  const rows = filteredRows.map((item, index) => ({
    id: `${index}`,
    ssaCode: item.ssaCode,
    ssaTier1: item.ssaTier1,
    ssaTier2: item.ssaTier2,
    permissionType: item.permissionType,
    level: item.level,
    status: item.status,
    scopeInclusion: item.scopeInclusion,
    qualificationType: item.qualificationType,
    qualificationDescription: item.qualificationDescription
  }));

  return (
    <Theme theme="white" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <Content style={{ width: '100%', margin: '0 auto', flex: 1, padding: 0, paddingTop: '1em' }}>
        <Grid fullWidth columns={16} mode="narrow" gutter={16}>
          <Column sm={4} md={8} lg={16}>
            <OrganisationHeader 
              organisationData={organisationData}
              activePage="scope"
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
                {/* SSA Tier 1 Filter */}
                <AccordionItem 
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>SSA Tier 1</span>
                      {appliedSsaTier1Filter.length > 0 && (
                        <>
                          <Tag type="high-contrast" size="sm">{appliedSsaTier1Filter.length}</Tag>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearPendingSsaTier1Filter();
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '0.25rem',
                              marginLeft: 'auto'
                            }}
                            aria-label="Clear SSA Tier 1 filter"
                          >
                            ×
                          </button>
                        </>
                      )}
                    </div>
                  }
                  open={false}
                >
                  <div style={{ padding: '0.5rem 0' }}>
                    {ssaTier1Options.map(option => (
                      <Checkbox
                        key={option}
                        id={`ssa-tier1-${option}`}
                        labelText={option}
                        checked={pendingSsaTier1Filter.includes(option)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPendingSsaTier1Filter([...pendingSsaTier1Filter, option]);
                          } else {
                            setPendingSsaTier1Filter(pendingSsaTier1Filter.filter(t => t !== option));
                          }
                        }}
                      />
                    ))}
                  </div>
                </AccordionItem>

                {/* SSA Tier 2 Filter */}
                <AccordionItem 
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>SSA Tier 2</span>
                      {appliedSsaTier2Filter.length > 0 && (
                        <>
                          <Tag type="high-contrast" size="sm">{appliedSsaTier2Filter.length}</Tag>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearPendingSsaTier2Filter();
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '0.25rem',
                              marginLeft: 'auto'
                            }}
                            aria-label="Clear SSA Tier 2 filter"
                          >
                            ×
                          </button>
                        </>
                      )}
                    </div>
                  }
                  open={false}
                >
                  <div style={{ padding: '0.5rem 0' }}>
                    {ssaTier2Options.map(option => (
                      <Checkbox
                        key={option}
                        id={`ssa-tier2-${option}`}
                        labelText={option}
                        checked={pendingSsaTier2Filter.includes(option)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPendingSsaTier2Filter([...pendingSsaTier2Filter, option]);
                          } else {
                            setPendingSsaTier2Filter(pendingSsaTier2Filter.filter(t => t !== option));
                          }
                        }}
                      />
                    ))}
                  </div>
                </AccordionItem>

                {/* Permission Type Filter */}
                <AccordionItem 
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>Permission Type</span>
                      {appliedPermissionTypeFilter.length > 0 && (
                        <>
                          <Tag type="high-contrast" size="sm">{appliedPermissionTypeFilter.length}</Tag>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearPendingPermissionTypeFilter();
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '0.25rem',
                              marginLeft: 'auto'
                            }}
                            aria-label="Clear Permission Type filter"
                          >
                            ×
                          </button>
                        </>
                      )}
                    </div>
                  }
                  open={false}
                >
                  <div style={{ padding: '0.5rem 0' }}>
                    {permissionTypeOptions.map(option => (
                      <Checkbox
                        key={option}
                        id={`permission-type-${option}`}
                        labelText={option}
                        checked={pendingPermissionTypeFilter.includes(option)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPendingPermissionTypeFilter([...pendingPermissionTypeFilter, option]);
                          } else {
                            setPendingPermissionTypeFilter(pendingPermissionTypeFilter.filter(t => t !== option));
                          }
                        }}
                      />
                    ))}
                  </div>
                </AccordionItem>

                {/* Level Filter */}
                <AccordionItem 
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>Level</span>
                      {appliedLevelFilter.length > 0 && (
                        <>
                          <Tag type="high-contrast" size="sm">{appliedLevelFilter.length}</Tag>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearPendingLevelFilter();
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '0.25rem',
                              marginLeft: 'auto'
                            }}
                            aria-label="Clear Level filter"
                          >
                            ×
                          </button>
                        </>
                      )}
                    </div>
                  }
                  open={false}
                >
                  <div style={{ padding: '0.5rem 0' }}>
                    {levelOptions.map(option => (
                      <Checkbox
                        key={option}
                        id={`level-${option}`}
                        labelText={option}
                        checked={pendingLevelFilter.includes(option)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPendingLevelFilter([...pendingLevelFilter, option]);
                          } else {
                            setPendingLevelFilter(pendingLevelFilter.filter(l => l !== option));
                          }
                        }}
                      />
                    ))}
                  </div>
                </AccordionItem>

                {/* Status Filter */}
                <AccordionItem 
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>Status</span>
                      {appliedStatusFilter.length > 0 && (
                        <>
                          <Tag type="high-contrast" size="sm">{appliedStatusFilter.length}</Tag>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearPendingStatusFilter();
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '0.25rem',
                              marginLeft: 'auto'
                            }}
                            aria-label="Clear Status filter"
                          >
                            ×
                          </button>
                        </>
                      )}
                    </div>
                  }
                  open={false}
                >
                  <div style={{ padding: '0.5rem 0' }}>
                    {statusOptions.map(option => (
                      <Checkbox
                        key={option}
                        id={`status-${option}`}
                        labelText={option}
                        checked={pendingStatusFilter.includes(option)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPendingStatusFilter([...pendingStatusFilter, option]);
                          } else {
                            setPendingStatusFilter(pendingStatusFilter.filter(s => s !== option));
                          }
                        }}
                      />
                    ))}
                  </div>
                </AccordionItem>

                {/* Scope Inclusion Filter */}
                <AccordionItem 
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>Scope Inclusion</span>
                      {appliedScopeInclusionFilter.length > 0 && (
                        <>
                          <Tag type="high-contrast" size="sm">{appliedScopeInclusionFilter.length}</Tag>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearPendingScopeInclusionFilter();
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '0.25rem',
                              marginLeft: 'auto'
                            }}
                            aria-label="Clear Scope Inclusion filter"
                          >
                            ×
                          </button>
                        </>
                      )}
                    </div>
                  }
                  open={false}
                >
                  <div style={{ padding: '0.5rem 0' }}>
                    {scopeInclusionOptions.map(option => (
                      <Checkbox
                        key={option}
                        id={`scope-inclusion-${option}`}
                        labelText={option}
                        checked={pendingScopeInclusionFilter.includes(option)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPendingScopeInclusionFilter([...pendingScopeInclusionFilter, option]);
                          } else {
                            setPendingScopeInclusionFilter(pendingScopeInclusionFilter.filter(s => s !== option));
                          }
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

            <DataTable rows={rows.slice((currentPage - 1) * pageSize, currentPage * pageSize)} headers={headers}>
              {({
                rows,
                headers,
                getHeaderProps,
                getRowProps,
                getTableProps,
                getTableContainerProps
              }) => {
                // Calculate the starting index for the current page
                const pageStartIdx = (currentPage - 1) * pageSize;
                
                return (
                <TableContainer {...getTableContainerProps()}>
                  <TableToolbar>
                    <TableToolbarContent>
                      <TableToolbarSearch
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search scope..."
                        persistent
                      />
                    </TableToolbarContent>
                  </TableToolbar>
                  <Table {...getTableProps()} size="lg">
                    <TableHead>
                      <TableRow>
                        <TableExpandHeader />
                        {headers.map((header) => (
                          <TableHeader {...getHeaderProps({ header })} key={header.key}>
                            {header.header}
                          </TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row, rowIdx) => {
                        const actualIdx = pageStartIdx + rowIdx;
                        const originalRow = filteredRows[actualIdx];
                        const hasExpandable = originalRow && 
                           originalRow.permissionType === 'Specific qualification description';
                        
                        return (
                          <React.Fragment key={row.id}>
                            {hasExpandable ? (
                              <TableExpandRow
                                {...getRowProps({ row })}
                                isExpanded={expandedRowIds.includes(row.id)}
                                onExpand={() => onExpand(row.id)}
                                expandHeader="expand"
                              >
                                {row.cells.map((cell) => {
                                  if (cell.info.header === 'Level') {
                                    return (
                                      <TableCell key={cell.id}>
                                        <Tag type="blue" size="sm">
                                          {cell.value}
                                        </Tag>
                                      </TableCell>
                                    );
                                  }
                                  if (cell.info.header === 'Status') {
                                    return (
                                      <TableCell key={cell.id}>
                                        <Tag type={cell.value === 'Active' ? 'green' : 'gray'} size="sm">
                                          {cell.value}
                                        </Tag>
                                      </TableCell>
                                    );
                                  }
                                  if (cell.info.header === 'Scope Inclusion') {
                                    return (
                                      <TableCell key={cell.id}>
                                        <Tag type={cell.value === 'Included' ? 'green' : 'red'} size="sm">
                                          {cell.value}
                                        </Tag>
                                      </TableCell>
                                    );
                                  }
                                  return (
                                    <TableCell key={cell.id}>
                                      {cell.value}
                                    </TableCell>
                                  );
                                })}
                              </TableExpandRow>
                            ) : (
                              <TableRow {...getRowProps({ row })}>
                                <TableCell></TableCell>
                                {row.cells.map((cell) => {
                                  if (cell.info.header === 'Level') {
                                    return (
                                      <TableCell key={cell.id}>
                                        <Tag type="blue" size="sm">
                                          {cell.value}
                                        </Tag>
                                      </TableCell>
                                    );
                                  }
                                  if (cell.info.header === 'Status') {
                                    return (
                                      <TableCell key={cell.id}>
                                        <Tag type={cell.value === 'Active' ? 'green' : 'gray'} size="sm">
                                          {cell.value}
                                        </Tag>
                                      </TableCell>
                                    );
                                  }
                                  if (cell.info.header === 'Scope Inclusion') {
                                    return (
                                      <TableCell key={cell.id}>
                                        <Tag type={cell.value === 'Included' ? 'green' : 'red'} size="sm">
                                          {cell.value}
                                        </Tag>
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
                            )}
                            {expandedRowIds.includes(row.id) && hasExpandable && (
                              <TableExpandedRow colSpan={headers.length + 1}>
                                <div style={{ padding: '1rem' }}>
                                  {originalRow.permissionType === 'Specific qualification description' && (
                                    <div>
                                      <strong>Qualification Description:</strong> {originalRow.qualificationDescription || 'Not specified'}
                                    </div>
                                  )}
                                </div>
                              </TableExpandedRow>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                );
              }}
            </DataTable>
            <Pagination
              totalItems={filteredRows.length}
              pageSize={pageSize}
              pageSizes={[10, 20, 50, 100]}
              page={currentPage}
              onChange={({ page, pageSize: newPageSize }) => {
                setCurrentPage(page);
                if (newPageSize !== pageSizeRef.current) {
                  setPageSize(newPageSize);
                  pageSizeRef.current = newPageSize;
                  setCurrentPage(1);
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

export default OrganisationScope;
