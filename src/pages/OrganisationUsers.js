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
  Pagination,
  Tag
} from '@carbon/react';
import AppHeader from '../components/AppHeader';
import OrganisationHeader from '../components/OrganisationHeader';
import regulatedOrganisationsData from '../data/regulated-organisations.json';
import usersData from '../data/organisation-users-data.json';

function OrganisationUsers() {
  const { rnNumber } = useParams();
  const [organisationData, setOrganisationData] = useState(null);
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const org = regulatedOrganisationsData.find(o => o.RNNumber === rnNumber);
    setOrganisationData(org);

    // Load users for this organisation
    const orgUsers = usersData.filter(u => u.rnNumber === rnNumber);
    setUsers(orgUsers);
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
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role' },
    { key: 'status', header: 'Status' }
  ];

  const getRoleTagType = (role) => {
    const roleMap = {
      'Responsible Officer': 'purple',
      'Regulation team': 'blue',
      'Chair of governing body': 'teal',
      'CEO': 'magenta',
      'Data admin': 'cyan',
      'Qualification admin': 'green',
      'Standard user': 'gray'
    };
    return roleMap[role] || 'gray';
  };

  const getStatusTagType = (status) => {
    const statusMap = {
      'Active': 'green',
      'Inactive': 'gray'
    };
    return statusMap[status] || 'gray';
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUsers = users.slice(startIndex, endIndex);

  const rows = paginatedUsers.map(user => ({
    id: user.email,
    ...user
  }));

  return (
    <Theme theme="white" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <Content style={{ width: '100%', margin: '0 auto', flex: 1, padding: 0, paddingTop: '1em' }}>
        <Grid fullWidth columns={16} mode="narrow" gutter={16}>
          <Column sm={4} md={8} lg={16}>
            <OrganisationHeader 
              organisationData={organisationData}
              activePage="users"
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
                      placeholder="Search users..."
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
                          No users data available
                        </TableCell>
                      </TableRow>
                    ) : (
                      rows.map((row) => (
                        <TableRow {...getRowProps({ row })} key={row.id}>
                          {row.cells.map((cell) => {
                            if (cell.info.header === 'Role') {
                              return (
                                <TableCell key={cell.id}>
                                  <Tag type={getRoleTagType(cell.value)}>
                                    {cell.value}
                                  </Tag>
                                </TableCell>
                              );
                            }
                            if (cell.info.header === 'Status') {
                              return (
                                <TableCell key={cell.id}>
                                  <Tag type={getStatusTagType(cell.value)}>
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
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>

          {users.length > 0 && (
            <Pagination
              page={currentPage}
              pageSize={pageSize}
              pageSizes={[10, 20, 30, 50]}
              totalItems={users.length}
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

export default OrganisationUsers;
