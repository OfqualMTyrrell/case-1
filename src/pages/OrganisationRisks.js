import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DataTable,
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
  Layer,
  Tag,
  Accordion,
  AccordionItem,
  Checkbox,
  Button,
  Grid,
  Column,
  Content,
  Theme
} from '@carbon/react';
import AppHeader from '../components/AppHeader';
import OrganisationHeader from '../components/OrganisationHeader';
import risksData from '../data/risks-data.json';
import organisationsData from '../data/regulated-organisations.json';

const OrganisationRisks = () => {
  const { rnNumber } = useParams();
  const navigate = useNavigate();
  const pageSizeRef = useRef(10);
  
  const [organisationData, setOrganisationData] = useState(null);
  const [risks, setRisks] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [firstRowIndex, setFirstRowIndex] = useState(0);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState('');
  
  // Separate pending and applied filter states
  const [pendingRiskLevelFilters, setPendingRiskLevelFilters] = useState([]);
  const [appliedRiskLevelFilters, setAppliedRiskLevelFilters] = useState([]);
  
  const [pendingStatusFilters, setPendingStatusFilters] = useState([]);
  const [appliedStatusFilters, setAppliedStatusFilters] = useState([]);
  
  const [pendingDateFilters, setPendingDateFilters] = useState([]);
  const [appliedDateFilters, setAppliedDateFilters] = useState([]);

  // Load organisation and risks data
  useEffect(() => {
    const organisation = organisationsData.find(org => org.RNNumber === rnNumber);
    setOrganisationData(organisation);
    
    if (organisation) {
      const orgRisks = risksData.filter(risk => risk.rnNumber === rnNumber);
      setRisks(orgRisks);
    }
  }, [rnNumber]);

  // Apply filters and search whenever they change
  useEffect(() => {
    let filtered = [...risks];

    // Apply search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter(risk => 
        risk.id?.toLowerCase().includes(searchLower) ||
        risk.description?.toLowerCase().includes(searchLower) ||
        risk.riskLevel?.toLowerCase().includes(searchLower) ||
        risk.status?.toLowerCase().includes(searchLower)
      );
    }

    // Apply risk level filter
    if (appliedRiskLevelFilters.length > 0) {
      filtered = filtered.filter(risk => appliedRiskLevelFilters.includes(risk.riskLevel));
    }

    // Apply status filter
    if (appliedStatusFilters.length > 0) {
      filtered = filtered.filter(risk => appliedStatusFilters.includes(risk.status));
    }

    // Apply date filter (by year)
    if (appliedDateFilters.length > 0) {
      filtered = filtered.filter(risk => {
        const year = risk.dateIdentified ? risk.dateIdentified.substring(0, 4) : '';
        return appliedDateFilters.includes(year);
      });
    }

    setFilteredRows(filtered);
    setFirstRowIndex(0);
  }, [risks, searchValue, appliedRiskLevelFilters, appliedStatusFilters, appliedDateFilters]);

  if (!organisationData) {
    return (
      <Theme theme="white">
        <Content style={{ width: '100%', margin: '0 auto', flex: 1, padding: 0, paddingTop: '1em' }}>
          <p>Loading...</p>
        </Content>
      </Theme>
    );
  }

  // Helper function to get unique values
  const getUnique = (arr, key) => [...new Set(arr.map(item => item[key]).filter(Boolean))].sort();

  // Define table headers
  const headers = [
    { key: 'id', header: 'Risk ID' },
    { key: 'description', header: 'Description' },
    { key: 'riskLevel', header: 'Risk Level' },
    { key: 'dateIdentified', header: 'Date Identified' },
    { key: 'status', header: 'Status' }
  ];

  // Get filter options from all organisation risks
  const riskLevelOptions = getUnique(risks, 'riskLevel');
  const statusOptions = getUnique(risks, 'status');
  const dateOptions = getUnique(risks.map(r => ({ dateIdentified: r.dateIdentified ? r.dateIdentified.substring(0, 4) : '' })), 'dateIdentified');

  // Filter handlers
  const handleApplyFilters = () => {
    setAppliedRiskLevelFilters([...pendingRiskLevelFilters]);
    setAppliedStatusFilters([...pendingStatusFilters]);
    setAppliedDateFilters([...pendingDateFilters]);
  };

  const handleClearFilters = () => {
    setPendingRiskLevelFilters([]);
    setAppliedRiskLevelFilters([]);
    setPendingStatusFilters([]);
    setAppliedStatusFilters([]);
    setPendingDateFilters([]);
    setAppliedDateFilters([]);
  };

  const hasFilterChanges = () => {
    return JSON.stringify(pendingRiskLevelFilters) !== JSON.stringify(appliedRiskLevelFilters) ||
           JSON.stringify(pendingStatusFilters) !== JSON.stringify(appliedStatusFilters) ||
           JSON.stringify(pendingDateFilters) !== JSON.stringify(appliedDateFilters);
  };

  const clearRiskLevelFilters = () => {
    setPendingRiskLevelFilters([]);
    setAppliedRiskLevelFilters([]);
  };

  const clearStatusFilters = () => {
    setPendingStatusFilters([]);
    setAppliedStatusFilters([]);
  };

  const clearDateFilters = () => {
    setPendingDateFilters([]);
    setAppliedDateFilters([]);
  };

  // Format date to DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Get tag type based on risk level
  const getRiskLevelTagType = (riskLevel) => {
    if (riskLevel === 'High' || riskLevel === 'Medium-High') return 'red';
    if (riskLevel === 'Medium') return 'orange';
    if (riskLevel === 'Low') return 'green';
    return 'gray';
  };

  // Transform risks to table rows
  const rows = filteredRows.map(risk => ({
    id: risk.id,
    description: risk.description,
    riskLevel: risk.riskLevel,
    dateIdentified: risk.dateIdentified,
    status: risk.status
  }));

  return (
    <Theme theme="white" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <Content style={{ width: '100%', margin: '0 auto', flex: 1, padding: 0, paddingTop: '1em' }}>
        <Grid fullWidth columns={16} mode="narrow" style={{ gutter: 16 }}>
          <Column sm={4} md={8} lg={16}>
            <OrganisationHeader organisationData={organisationData} activePage="risks" />
          </Column>
          
          <Column lg={4} md={4} sm={4} style={{ borderRight: '1px solid var(--cds-border-subtle)' }}>
            {/* Filter Panel */}
            <div style={{ padding: '1rem' }}>
              <h4 style={{ marginBottom: '1rem' }}>Filters</h4>
              
              <Accordion isFlush>
                {/* Risk Level Filter */}
                <AccordionItem
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <span>Risk Level</span>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {appliedRiskLevelFilters.length > 0 && (
                          <>
                            <Tag size="sm" type="blue">{appliedRiskLevelFilters.length}</Tag>
                            <Button
                              kind="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                clearRiskLevelFilters();
                              }}
                            >
                              Clear
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  }
                >
                  <div style={{ padding: '1rem 0' }}>
                    {riskLevelOptions.map(riskLevel => (
                      <Checkbox
                        key={riskLevel}
                        labelText={riskLevel}
                        id={`riskLevel-${riskLevel}`}
                        checked={pendingRiskLevelFilters.includes(riskLevel)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPendingRiskLevelFilters([...pendingRiskLevelFilters, riskLevel]);
                          } else {
                            setPendingRiskLevelFilters(pendingRiskLevelFilters.filter(t => t !== riskLevel));
                          }
                        }}
                      />
                    ))}
                  </div>
                </AccordionItem>

                {/* Status Filter */}
                <AccordionItem
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <span>Status</span>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {appliedStatusFilters.length > 0 && (
                          <>
                            <Tag size="sm" type="blue">{appliedStatusFilters.length}</Tag>
                            <Button
                              kind="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                clearStatusFilters();
                              }}
                            >
                              Clear
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  }
                >
                  <div style={{ padding: '1rem 0' }}>
                    {statusOptions.map(status => (
                      <Checkbox
                        key={status}
                        labelText={status}
                        id={`status-${status}`}
                        checked={pendingStatusFilters.includes(status)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPendingStatusFilters([...pendingStatusFilters, status]);
                          } else {
                            setPendingStatusFilters(pendingStatusFilters.filter(s => s !== status));
                          }
                        }}
                      />
                    ))}
                  </div>
                </AccordionItem>

                {/* Date Identified Filter */}
                <AccordionItem
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <span>Year Identified</span>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {appliedDateFilters.length > 0 && (
                          <>
                            <Tag size="sm" type="blue">{appliedDateFilters.length}</Tag>
                            <Button
                              kind="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                clearDateFilters();
                              }}
                            >
                              Clear
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  }
                >
                  <div style={{ padding: '1rem 0' }}>
                    {dateOptions.map(year => (
                      <Checkbox
                        key={year}
                        labelText={year}
                        id={`date-${year}`}
                        checked={pendingDateFilters.includes(year)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPendingDateFilters([...pendingDateFilters, year]);
                          } else {
                            setPendingDateFilters(pendingDateFilters.filter(d => d !== year));
                          }
                        }}
                      />
                    ))}
                  </div>
                </AccordionItem>
              </Accordion>

              {/* Apply/Clear Filter Buttons */}
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                <Button
                  kind="primary"
                  size="lg"
                  onClick={handleApplyFilters}
                  disabled={!hasFilterChanges()}
                  style={{ width: '100%' }}
                >
                  Apply Filters
                </Button>
                <Button
                  kind="ghost"
                  size="lg"
                  onClick={handleClearFilters}
                  style={{ width: '100%' }}
                >
                  Clear All
                </Button>
              </div>
            </div>
          </Column>

          <Column sm={4} md={8} lg={12} xlg={10}>
            <Layer level={0} style={{ backgroundColor: 'var(--cds-layer)', borderLeft: '1px solid var(--cds-border-subtle)' }}>
              <DataTable rows={rows.slice(firstRowIndex, firstRowIndex + currentPageSize)} headers={headers}>
                {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
                  <>
                    <TableToolbar>
                      <TableToolbarContent>
                        <TableToolbarSearch
                          expanded
                          value={searchValue}
                          onChange={(e) => setSearchValue(e.target.value)}
                          placeholder="Search risks..."
                        />
                      </TableToolbarContent>
                    </TableToolbar>
                    <Table {...getTableProps()}>
                      <TableHead>
                        <TableRow>
                          {headers.map((header) => {
                            const { key, ...headerProps } = getHeaderProps({ header });
                            return (
                              <TableHeader key={key} {...headerProps}>
                                {header.header}
                              </TableHeader>
                            );
                          })}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.map((row) => {
                          const { key, ...rowProps } = getRowProps({ row });
                          return (
                            <TableRow
                              key={key}
                              {...rowProps}
                              onClick={() => navigate(`/organisations/${rnNumber}/risks/${encodeURIComponent(row.id)}`)}
                              style={{ cursor: 'pointer' }}
                            >
                              {row.cells.map((cell) => {
                                if (cell.info.header === 'riskLevel') {
                                  return (
                                    <TableCell key={cell.id}>
                                      <Tag type={getRiskLevelTagType(cell.value)}>
                                        {cell.value}
                                      </Tag>
                                    </TableCell>
                                  );
                                }
                                if (cell.info.header === 'dateIdentified') {
                                  return (
                                    <TableCell key={cell.id}>
                                      {formatDate(cell.value)}
                                    </TableCell>
                                  );
                                }
                                return <TableCell key={cell.id}>{cell.value}</TableCell>;
                              })}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                    <Pagination
                      backwardText="Previous page"
                      forwardText="Next page"
                      itemsPerPageText="Items per page:"
                      page={Math.floor(firstRowIndex / currentPageSize) + 1}
                      pageNumberText="Page Number"
                      pageSize={currentPageSize}
                      pageSizes={[10, 20, 50, 100]}
                      totalItems={filteredRows.length}
                      onChange={({ page, pageSize }) => {
                        if (pageSize !== pageSizeRef.current) {
                          setCurrentPageSize(pageSize);
                          pageSizeRef.current = pageSize;
                          setFirstRowIndex(0);
                        } else {
                          setFirstRowIndex((page - 1) * pageSize);
                        }
                      }}
                    />
                  </>
                )}
              </DataTable>
            </Layer>
          </Column>
        </Grid>
      </Content>
    </Theme>
  );
};

export default OrganisationRisks;
