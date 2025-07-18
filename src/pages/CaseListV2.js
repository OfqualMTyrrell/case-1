import React, { useEffect, useState } from 'react';
import { Content, Grid, Row, Column, DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell, TableContainer, Checkbox, Tag, MultiSelect } from '@carbon/react';
import casesData from '../cases.json';
import AppHeader from '../components/AppHeader';
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

function CaseListV2() {
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);
  const [caseTypeFilter, setCaseTypeFilter] = useState([]);
  const [submittedByFilter, setSubmittedByFilter] = useState([]);

  useEffect(() => {
    const allRows = casesData.map((item, idx) => ({ id: idx.toString(), ...item }));
    setRows(allRows);
    setFilteredRows(allRows);
  }, []);

  useEffect(() => {
    let filtered = rows;
    if (statusFilter.length > 0) {
      filtered = filtered.filter(row => statusFilter.includes(row.Status));
    }
    if (caseTypeFilter.length > 0) {
      filtered = filtered.filter(row => caseTypeFilter.includes(row.CaseType));
    }
    if (submittedByFilter.length > 0) {
      filtered = filtered.filter(row => submittedByFilter.includes(row.SubmittedBy));
    }
    setFilteredRows(filtered);
  }, [statusFilter, caseTypeFilter, submittedByFilter, rows]);

  const statusOptions = getUnique(casesData, 'Status');
  const caseTypeOptions = getUnique(casesData, 'CaseType');
  const submittedByOptions = getUnique(casesData, 'SubmittedBy');

  return (
    <>
      <AppHeader />
      <Content>
        <Grid fullWidth columns={16} mode="narrow" gutter={16}>
          <Column lg={16}>
            <h1 style={{ margin: '2rem 0 1rem 0' }}>All cases (V2)</h1>
          </Column>
          <Column lg={4} md={4} sm={4}>
            <div style={{ background: 'var(--cds-layer)', padding: '1.5rem', borderRadius: '0.5rem', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <h6 className="cds--label" style={{ margin: 0 }}>Status</h6>
                {statusFilter.length > 0 && (
                  <Tag type="outline" size="sm" style={{ marginLeft: 8 }}>
                    {statusFilter.length}
                  </Tag>
                )}
              </div>
              <div role="group" aria-label="Status filters">
                {statusOptions.map(status => (
                  <Checkbox
                    key={status}
                    id={`status-checkbox-${status}`}
                    labelText={status}
                    checked={statusFilter.includes(status)}
                    onChange={(e, { checked }) => {
                      setStatusFilter(checked
                        ? [...statusFilter, status]
                        : statusFilter.filter(s => s !== status)
                      );
                    }}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0 1rem 0' }}>
                <h6 className="cds--label" style={{ margin: 0 }}>Case Type</h6>
                {caseTypeFilter.length > 0 && (
                  <Tag type="outline" size="sm" style={{ marginLeft: 8 }}>
                    {caseTypeFilter.length}
                  </Tag>
                )}
              </div>
              <div role="group" aria-label="Case type filters">
                {caseTypeOptions.map(type => (
                  <Checkbox
                    key={type}
                    id={`case-type-checkbox-${type}`}
                    labelText={type}
                    checked={caseTypeFilter.includes(type)}
                    onChange={(e, { checked }) => {
                      setCaseTypeFilter(checked
                        ? [...caseTypeFilter, type]
                        : caseTypeFilter.filter(t => t !== type)
                      );
                    }}
                  />
                ))}
              </div>
              <div>
                <MultiSelect
                  id="submitted-by-filter-v2"
                  items={submittedByOptions.map(submitter => ({ id: submitter, text: submitter }))}
                  itemToString={item => item?.text || ''}
                  filterable
                    titleText=""
                  label={
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      Submitted By
                      {submittedByFilter.length > 0 && (
                        <Tag type="outline" size="sm" style={{ marginLeft: 8 }}>
                          {submittedByFilter.length}
                        </Tag>
                      )}
                    </span>
                  }
                                onChange={({ selectedItems }) => setSubmittedByFilter(selectedItems.map(item => item.text))}
                                selectedItems={submittedByFilter.map(submitter => ({ id: submitter, text: submitter }))}
                            />
                        </div>
                    </div>
                </Column>
                <Column lg={12} md={8} sm={4}>
                    <DataTable rows={filteredRows} headers={headers} isSortable>
                        {({
                            rows,
                            headers,
                            getHeaderProps,
                            getRowProps,
                            getTableProps,
                            getTableContainerProps,
                        }) => (
                            <TableContainer title="">
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
                                            <TableRow key={row.id} {...getRowProps({ row })}>
                                                {row.cells.map(cell => (
                                                    <TableCell key={cell.id}>{cell.value}</TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </DataTable>
                </Column>
            </Grid>
        </Content>
    </>
);
}

export default CaseListV2;
