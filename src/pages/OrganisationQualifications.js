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
  Button,
  Layer,
  Accordion,
  AccordionItem
} from '@carbon/react';
import AppHeader from '../components/AppHeader';
import OrganisationHeader from '../components/OrganisationHeader';
import regulatedOrganisationsData from '../data/regulated-organisations.json';
import qualificationsData from '../data/organisation-qualifications-data.json';

const getUnique = (arr, key) => Array.from(new Set(arr.map(item => item[key])));

function OrganisationQualifications() {
  const { rnNumber } = useParams();
  const navigate = useNavigate();
  const [organisationData, setOrganisationData] = useState(null);
  const [qualifications, setQualifications] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const pageSizeRef = useRef(pageSize);

  // Pending filters
  const [pendingTypeFilter, setPendingTypeFilter] = useState([]);
  const [pendingLevelFilter, setPendingLevelFilter] = useState([]);
  const [pendingStatusFilter, setPendingStatusFilter] = useState([]);

  // Applied filters
  const [appliedTypeFilter, setAppliedTypeFilter] = useState([]);
  const [appliedLevelFilter, setAppliedLevelFilter] = useState([]);
  const [appliedStatusFilter, setAppliedStatusFilter] = useState([]);

  useEffect(() => {
    const org = regulatedOrganisationsData.find(o => o.RNNumber === rnNumber);
    setOrganisationData(org);

    // Load qualifications for this organisation
    const orgQualifications = qualificationsData.filter(q => q.rnNumber === rnNumber);
    setQualifications(orgQualifications);
    setFilteredRows(orgQualifications);
  }, [rnNumber]);

  useEffect(() => {
    if (!qualifications) return;

    // Apply search filter
    let filtered = qualifications;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.accreditationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.level?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply Type filter
    if (appliedTypeFilter.length > 0) {
      filtered = filtered.filter(item => appliedTypeFilter.includes(item.type));
    }

    // Apply Level filter
    if (appliedLevelFilter.length > 0) {
      filtered = filtered.filter(item => appliedLevelFilter.includes(item.level?.toString()));
    }

    // Apply Status filter
    if (appliedStatusFilter.length > 0) {
      filtered = filtered.filter(item => appliedStatusFilter.includes(item.status));
    }

    setFilteredRows(filtered);
    setCurrentPage(1);
  }, [qualifications, searchTerm, appliedTypeFilter, appliedLevelFilter, appliedStatusFilter]);

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
    { key: 'accreditationNumber', header: 'Accreditation Number' },
    { key: 'title', header: 'Title' },
    { key: 'type', header: 'Type' },
    { key: 'level', header: 'Level' },
    { key: 'status', header: 'Status' }
  ];

  // Get unique values for filter options
  const typeOptions = getUnique(qualifications, 'type').sort();
  const levelOptions = getUnique(qualifications, 'level').map(l => l?.toString()).filter(Boolean).sort((a, b) => parseInt(a) - parseInt(b));
  const statusOptions = getUnique(qualifications, 'status').sort();

  // Filter handlers
  const handleApplyFilters = () => {
    setAppliedTypeFilter(pendingTypeFilter);
    setAppliedLevelFilter(pendingLevelFilter);
    setAppliedStatusFilter(pendingStatusFilter);
  };

  const handleClearFilters = () => {
    setPendingTypeFilter([]);
    setPendingLevelFilter([]);
    setPendingStatusFilter([]);
    setAppliedTypeFilter([]);
    setAppliedLevelFilter([]);
    setAppliedStatusFilter([]);
  };

  const hasFilterChanges = () => {
    return JSON.stringify(pendingTypeFilter) !== JSON.stringify(appliedTypeFilter) ||
           JSON.stringify(pendingLevelFilter) !== JSON.stringify(appliedLevelFilter) ||
           JSON.stringify(pendingStatusFilter) !== JSON.stringify(appliedStatusFilter);
  };

  const clearPendingTypeFilter = () => {
    setPendingTypeFilter([]);
    setAppliedTypeFilter([]);
  };

  const clearPendingLevelFilter = () => {
    setPendingLevelFilter([]);
    setAppliedLevelFilter([]);
  };

  const clearPendingStatusFilter = () => {
    setPendingStatusFilter([]);
    setAppliedStatusFilter([]);
  };

  const getStatusTagType = (status) => {
    const statusMap = {
      'Live': 'green',
      'Withdrawn': 'red',
      'Suspended': 'purple'
    };
    return statusMap[status] || 'gray';
  };

  const rows = filteredRows.map(qual => ({
    id: qual.accreditationNumber,
    ...qual
  }));

  return (
    <Theme theme="white" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <Content style={{ width: '100%', margin: '0 auto', flex: 1, padding: 0, paddingTop: '1em' }}>
        <Grid fullWidth columns={16} mode="narrow" gutter={16}>
          <Column sm={4} md={8} lg={16}>
            <OrganisationHeader 
              organisationData={organisationData}
              activePage="qualifications"
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
                {/* Type Filter */}
                <AccordionItem 
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>Type</span>
                      {appliedTypeFilter.length > 0 && (
                        <>
                          <Tag type="high-contrast" size="sm">{appliedTypeFilter.length}</Tag>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearPendingTypeFilter();
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '0.25rem',
                              marginLeft: 'auto'
                            }}
                            aria-label="Clear Type filter"
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
                    {typeOptions.map(option => (
                      <Checkbox
                        key={option}
                        id={`type-${option}`}
                        labelText={option}
                        checked={pendingTypeFilter.includes(option)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPendingTypeFilter([...pendingTypeFilter, option]);
                          } else {
                            setPendingTypeFilter(pendingTypeFilter.filter(t => t !== option));
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
              getToolbarProps,
              onInputChange,
              getTableContainerProps
            }) => (
              <TableContainer
                {...getTableContainerProps()}
              >
                <TableToolbar {...getToolbarProps()}>
                  <TableToolbarContent>
                    <TableToolbarSearch 
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        onInputChange(e);
                      }}
                      placeholder="Search qualifications..."
                      persistent
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
                          navigate(`/organisations/${rnNumber}/qualifications/${encodeURIComponent(row.id)}`);
                        }}
                        tabIndex={0}
                        style={{ cursor: 'pointer' }}
                        aria-label={`View details for qualification ${row.id}`}
                      >
                        {row.cells.map((cell) => {
                          if (cell.info.header === 'Status') {
                            return (
                              <TableCell key={cell.id}>
                                <Tag type={getStatusTagType(cell.value)} size="sm">
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
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>

          <Pagination
            page={currentPage}
            pageSize={pageSize}
            pageSizes={[10, 20, 50, 100]}
            totalItems={filteredRows.length}
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

export default OrganisationQualifications;
