import React, { useState, useEffect } from 'react';
import {
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
  Link,
  AILabel,
  AILabelContent,
  SkeletonText
} from '@carbon/react';
import { Document, DocumentPdf, Csv, Jpg, Png, Txt, Zip, Mp3, Mp4, DocumentWordProcessor, Xls } from '@carbon/icons-react';
import aiDocumentSummaries from '../data/ai-document-summaries.json';

const DocumentsTable = ({ documents }) => {
  const [documentRows, setDocumentRows] = useState([]);
  const [loadingAI, setLoadingAI] = useState(true);

  const getFileType = (fileName) => {
    const ext = fileName.split('.').pop().toUpperCase();
    return ext || 'FILE';
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === '-') return '-';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      return dateString;
    }
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    switch (ext) {
      case 'pdf':
        return DocumentPdf;
      case 'doc':
      case 'docx':
        return DocumentWordProcessor;
      case 'xls':
      case 'xlsx':
        return Xls;
      case 'csv':
        return Csv;
      case 'jpg':
      case 'jpeg':
        return Jpg;
      case 'png':
        return Png;
      case 'txt':
        return Txt;
      case 'zip':
      case 'rar':
        return Zip;
      case 'mp3':
        return Mp3;
      case 'mp4':
      case 'mov':
        return Mp4;
      default:
        return Document;
    }
  };

  useEffect(() => {
    // Simulate AI processing delay
    setLoadingAI(true);
    setTimeout(() => {
      // Generate fake dates
      const fakeDates = [
        '2025-11-15',
        '2025-10-22',
        '2025-09-30',
        '2025-08-18',
        '2025-07-05',
        '2025-06-12',
        '2025-05-28',
        '2025-04-10',
        '2025-03-14',
        '2025-02-20',
        '2025-01-08',
        '2024-12-15',
        '2024-11-22',
        '2024-10-30',
        '2024-09-18'
      ];

      const rows = documents.map((doc, index) => {
        const fileName = doc.name || doc;
        const aiSummary = aiDocumentSummaries[fileName] || { summary: 'Document content summary not available' };
        
        return {
          id: `doc-${index}`,
          name: fileName,
          type: getFileType(fileName),
          date: formatDate(doc.uploadDate || doc.date || fakeDates[index % fakeDates.length]),
          aiSummary: aiSummary.summary,
          url: doc.url || '#'
        };
      });
      setDocumentRows(rows);
      setLoadingAI(false);
    }, 1500);
  }, [documents]);

  const aiSlug = (
    <AILabel size="mini">
      <AILabelContent>
        <div>
          <p className="secondary">AI-Powered</p>
          <h4>Document Summaries</h4>
          <p className="secondary">
            AI-generated summaries help you quickly identify document contents.
          </p>
        </div>
      </AILabelContent>
    </AILabel>
  );

  const headers = [
    { key: 'name', header: 'Document name' },
    { key: 'type', header: 'Type' },
    { key: 'date', header: 'Date' },
    { key: 'aiSummary', header: 'AI Summary' }
  ];

  return (
    <DataTable rows={documentRows} headers={headers}>
      {({
        rows,
        headers,
        getHeaderProps,
        getRowProps,
        getCellProps,
        getTableProps,
        getToolbarProps,
        getTableContainerProps,
        onInputChange
      }) => (
        <TableContainer
          {...getTableContainerProps()}
        >
          <TableToolbar {...getToolbarProps()}>
            <TableToolbarContent>
              <TableToolbarSearch
                placeholder="Search documents..."
                onChange={onInputChange}
              />
            </TableToolbarContent>
          </TableToolbar>
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableHeader
                    {...getHeaderProps({ header })}
                    key={header.key}
                    slug={header.key === 'aiSummary' ? aiSlug : undefined}
                  >
                    {header.header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow {...getRowProps({ row })} key={row.id}>
                  {row.cells.map((cell) => {
                    if (cell.info.header === 'name') {
                      const FileIcon = getFileIcon(cell.value);
                      return (
                        <TableCell key={cell.id} {...getCellProps({ cell })}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileIcon size={16} style={{ flexShrink: 0 }} />
                            <Link href={documentRows.find(d => d.id === row.id)?.url || '#'}>
                              {cell.value}
                            </Link>
                          </div>
                        </TableCell>
                      );
                    }
                    
                    if (cell.info.header === 'aiSummary') {
                      return (
                        <TableCell key={cell.id} {...getCellProps({ cell })} className="cds--table-cell--column-slug">
                          {loadingAI ? (
                            <SkeletonText width="90%" />
                          ) : (
                            cell.value
                          )}
                        </TableCell>
                      );
                    }
                    
                    return <TableCell key={cell.id} {...getCellProps({ cell })}>{cell.value}</TableCell>;
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </DataTable>
  );
};

export default DocumentsTable;
