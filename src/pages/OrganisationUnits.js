import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  Pagination
} from '@carbon/react';
import AppHeader from '../components/AppHeader';
import OrganisationHeader from '../components/OrganisationHeader';
import regulatedOrganisationsData from '../data/regulated-organisations.json';
import unitsData from '../data/organisation-units-data.json';

function OrganisationUnits() {
  const { rnNumber } = useParams();
  const [organisationData, setOrganisationData] = useState(null);
  const [units, setUnits] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const org = regulatedOrganisationsData.find(o => o.RNNumber === rnNumber);
    setOrganisationData(org);

    // Load units for this organisation
    const orgUnits = unitsData.filter(u => u.rnNumber === rnNumber);
    setUnits(orgUnits);
  }, [rnNumber]);

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
    { key: 'unitCode', header: 'Unit Code' },
    { key: 'title', header: 'Title' },
    { key: 'level', header: 'Level' },
    { key: 'glh', header: 'GLH' },
    { key: 'creditValue', header: 'Credit Value' }
  ];

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUnits = units.slice(startIndex, endIndex);

  const rows = paginatedUnits.map(unit => ({
    id: unit.unitCode,
    ...unit
  }));

  return (
    <Theme theme="white" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <Content style={{ width: '100%', margin: '0 auto', flex: 1, padding: 0, paddingTop: '1em' }}>
        <Grid fullWidth columns={16} mode="narrow" gutter={16}>
          <Column sm={4} md={8} lg={16}>
            <OrganisationHeader 
              organisationData={organisationData}
              activePage="units"
            />
          </Column>
          <Column sm={4} md={8} lg={12} xlg={10}>
            <DataTable rows={rows} headers={headers}>
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
                style={{ marginBottom: '2rem' }}
              >
                <TableToolbar {...getToolbarProps()}>
                  <TableToolbarContent>
                    <TableToolbarSearch 
                      onChange={onInputChange}
                      placeholder="Search units..."
                    />
                  </TableToolbarContent>
                </TableToolbar>
                <Table {...getTableProps()}>
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
                    {rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={headers.length}>
                          No units data available
                        </TableCell>
                      </TableRow>
                    ) : (
                      rows.map((row) => (
                        <TableRow {...getRowProps({ row })} key={row.id}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>
                              {cell.value}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>

          {units.length > 0 && (
            <Pagination
              page={currentPage}
              pageSize={pageSize}
              pageSizes={[10, 20, 30, 50]}
              totalItems={units.length}
              onChange={({ page, pageSize }) => {
                setCurrentPage(page);
                setPageSize(pageSize);
              }}
            />
          )}
          </Column>
        </Grid>
      </Content>
    </Theme>
  );
}

export default OrganisationUnits;
