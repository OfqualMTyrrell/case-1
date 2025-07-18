import React from 'react';
import {
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Button,
  Checkbox,
    FilterableMultiSelect,
  MultiSelect,
  Tag,
} from '@carbon/react';
import { Filter } from '@carbon/icons-react';

const TableToolbarFilter = ({
  statusOptions = [],
  caseTypeOptions = [],
  submittedByOptions = [],
  caseLeadOptions = [],
  selectedFilters,
  onApplyFilter,
  onResetFilter,
  onSearch,
  statusTagProps,
}) => {
  const [currentFilters, setCurrentFilters] = React.useState({
    status: new Set(),
    caseType: new Set(),
    submittedBy: new Set(),
  });

  React.useEffect(() => {
    setCurrentFilters(selectedFilters);
  }, [selectedFilters]);

  const handleFilterChange = (filterType, value, checked) => {
    const newFilters = { ...currentFilters };
    const filterSet = new Set(currentFilters[filterType]);
    
    if (checked) {
      filterSet.add(value);
    } else {
      filterSet.delete(value);
    }
    
    newFilters[filterType] = filterSet;
    setCurrentFilters(newFilters);
    onApplyFilter(newFilters);
  };

  return (
    <TableToolbar>
      <TableToolbarContent>
        <TableToolbarSearch onChange={onSearch} persistent={true} />
        <div className="cds--table-toolbar-filter-container">
          <Button
            hasIconOnly
            renderIcon={Filter}
            iconDescription="Filter"
            kind="ghost"
            onClick={() => {
              const toolbar = document.querySelector('.cds--table-toolbar-filter-container');
              toolbar?.classList.toggle('cds--table-toolbar-filter-container--active');
            }}
            className="cds--table-toolbar-filter-button"
          />
          <div className="cds--table-toolbar-filter-content">
            <div style={{ padding: '1rem', width: '300px' }}>
              <div className="cds--fieldset">
                <MultiSelect
                  id="status-filter"
                  items={statusOptions.map(status => ({ 
                    id: status, 
                    text: status 
                  }))}
                  itemToString={(item) => item?.text || ''}
                  placeholder="Select"
                  titleText="Statuses"
                  filterable
                  onChange={({ selectedItems }) => {
                    const newFilters = {
                      ...currentFilters,
                      status: new Set(selectedItems.map(item => item.text))
                    };
                    setCurrentFilters(newFilters);
                    onApplyFilter(newFilters);
                  }}
                  selectedItems={[...currentFilters.status].map(status => ({ 
                    id: status, 
                    text: status 
                  }))}
                />
              </div>
              <div className="cds--fieldset" style={{ marginTop: '1rem' }}>
                <FilterableMultiSelect
                  id="case-type-filter"
                  items={caseTypeOptions.map(type => ({ id: type, text: type }))}
                    itemToString={(item) => item?.text || ''}
                    
                  titleText="Case types"
                  filterable
                  onChange={({ selectedItems }) => {
                    const newFilters = {
                      ...currentFilters,
                      caseType: new Set(selectedItems.map(item => item.text))
                    };
                    setCurrentFilters(newFilters);
                    onApplyFilter(newFilters);
                  }}
                  selectedItems={[...currentFilters.caseType].map(type => ({ 
                    id: type, 
                    text: type 
                  }))}
                />
              </div>
              <div className="cds--fieldset" style={{ marginTop: '1rem' }}>
                <FilterableMultiSelect
                  id="submitted-by-filter"
                  items={submittedByOptions.map(submitter => ({ id: submitter, text: submitter }))}
                  itemToString={(item) => item?.text || ''}
                  titleText="Submitted by"
                  filterable
                  onChange={({ selectedItems }) => {
                    const newFilters = {
                      ...currentFilters,
                      submittedBy: new Set(selectedItems.map(item => item.text))
                    };
                    setCurrentFilters(newFilters);
                    onApplyFilter(newFilters);
                  }}
                  selectedItems={[...currentFilters.submittedBy].map(submitter => ({ 
                    id: submitter, 
                    text: submitter 
                  }))}
                />
              </div>
              <div className="cds--fieldset" style={{ marginTop: '1rem' }}>
                <FilterableMultiSelect
                  id="case-lead-filter"
                  items={caseLeadOptions.map(lead => ({ id: lead, text: lead }))}
                  itemToString={(item) => item?.text || ''}
                  titleText="Case lead"
                  filterable
                  onChange={({ selectedItems }) => {
                    const newFilters = {
                      ...currentFilters,
                      caseLead: new Set(selectedItems.map(item => item.text))
                    };
                    setCurrentFilters(newFilters);
                    onApplyFilter(newFilters);
                  }}
                  selectedItems={[...(currentFilters.caseLead || new Set())].map(lead => ({ 
                    id: lead, 
                    text: lead 
                  }))}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
                <Button
                  size="sm"
                  kind="ghost"
                  onClick={() => {
                    onResetFilter();
                    setCurrentFilters({
                      status: new Set(),
                      caseType: new Set(),
                      submittedBy: new Set()
                    });
                    const toolbar = document.querySelector('.cds--table-toolbar-filter-container');
                    toolbar?.classList.remove('cds--table-toolbar-filter-container--active');
                  }}
                >
                  Reset filters
                </Button>
              </div>
            </div>
          </div>
        </div>
        <style jsx global>{`
          .cds--table-toolbar-filter-container {
            position: relative;
            display: inline-block;
          }

          .cds--table-toolbar-filter-content {
            display: none;
            position: absolute;
            top: 100%;
            right: 0;
            margin-top: 0.5rem;
            background: var(--cds-layer);
            border: 1px solid var(--cds-border-subtle);
            box-shadow: 0 2px 6px var(--cds-shadow);
            z-index: 1000;
            --cds-field: var(--cds-field-02, #393939);
          }

          /* Ensure MultiSelect dropdowns use the correct field background color */
          .cds--multi-select__filter,
          .cds--list-box__menu,
          .cds--list-box__field {
            background-color: var(--cds-field) !important;
          }

          .cds--table-toolbar-filter-container--active .cds--table-toolbar-filter-content {
            display: block;
          }
        `}</style>
      </TableToolbarContent>
    </TableToolbar>
  );
};

export default TableToolbarFilter;
