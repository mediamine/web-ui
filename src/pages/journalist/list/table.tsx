'use client';

import { StyledTableCell, StyledTableRow } from '@/components/mui/table/styledComponents';
import { usePermissions } from '@/providers/AuthProvider';
import { AsyncState } from '@/types/asyncState';
import { JournalistProps } from '@/types/journalist';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  Tooltip,
  Typography
} from '@mui/material';
import TableRow from '@mui/material/TableRow';
import { flatMap, uniq } from 'lodash';
import React, { ChangeEvent, Dispatch, SetStateAction } from 'react';
import { classes, stylesheet } from 'typestyle';

const HOSTNAME = process.env.NEXT_PUBLIC_MEDIAMINE_API_HOSTNAME;

type Format = Array<{ name: string; mediatypes?: string | string[]; tiers?: string | string[] }>;

interface Column {
  id?: 'first_name' | 'email' | 'format_types' | 'news_types' | 'role_types' | 'publications' | 'regions';
  label?: string;
  minWidth?: number;
  width?: number;
  align?: 'right';
  Cell?: (o: { value: Format | string; row: JournalistProps }) => string | JSX.Element;
}

interface JournalistsTableProps {
  journalists: AsyncState<Array<JournalistProps>>;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  rowsPerPage: number;
  setRowsPerPage: Dispatch<SetStateAction<number>>;
  total: number;
  selected: Array<string>;
  setSelected: Dispatch<SetStateAction<Array<string>>>;
  selectAll: boolean;
  setSelectAll: Dispatch<SetStateAction<boolean>>;
  setJournalistId: Dispatch<SetStateAction<string | undefined>>;
  setOpenEditDrawer: Dispatch<SetStateAction<boolean>>;
  setOpenDetailsDrawer: Dispatch<SetStateAction<boolean>>;
}

export default function JournalistListTable({
  journalists = {
    isLoading: true,
    hasError: false,
    value: []
  },
  page,
  setPage,
  rowsPerPage,
  setRowsPerPage,
  total,
  selected,
  setSelected,
  selectAll,
  setSelectAll,
  setJournalistId,
  setOpenEditDrawer,
  setOpenDetailsDrawer
}: JournalistsTableProps) {
  const { isEditor } = usePermissions();

  const columns: Column[] = [
    {
      id: 'first_name',
      label: 'Journalist Name',
      width: 300,
      Cell: ({ row }) => (
        <Button
          onClick={() => {
            if (row.uuid) {
              setJournalistId(row.uuid);
              if (isEditor) {
                setOpenEditDrawer(true);
              } else {
                setOpenDetailsDrawer(true);
              }
            }

            // TODO:
            // push && push(`publications/${rowId}`);
          }}
          disableRipple
        >
          {`${row.first_name} ${row.last_name}`}
        </Button>
      )
    },
    {
      id: 'news_types',
      label: 'News Types',
      width: 200,
      Cell: ({ value }) => {
        const title = (value as Format)?.map((p) => p.name).join(', ');
        return (
          <Tooltip arrow {...{ title }}>
            <span className="truncate">
              <span>{title}</span>
            </span>
          </Tooltip>
        );
      }
    },
    {
      id: 'role_types',
      label: 'Job Titles',
      width: 200,
      Cell: ({ value }) => {
        const title = (value as Format)?.map((p) => p.name).join(', ');
        return (
          <Tooltip arrow {...{ title }}>
            <span className="truncate">
              <span>{title}</span>
            </span>
          </Tooltip>
        );
      }
    },
    {
      id: 'format_types',
      label: 'Formats',
      width: 200,
      Cell: ({ value }) => {
        const title = (value as Format)?.map((p) => p.name).join(', ');
        return (
          <Tooltip arrow {...{ title }}>
            <span className="truncate">
              <span>{title}</span>
            </span>
          </Tooltip>
        );
      }
    },
    {
      id: 'publications',
      label: 'Publications',
      width: 200,
      Cell: ({ value }) => {
        const title = (value as Format)?.map((p) => p.name).join(', ');
        return (
          <Tooltip arrow {...{ title }}>
            <span className="truncate">
              <span>{title}</span>
            </span>
          </Tooltip>
        );
      }
    },
    {
      id: 'publications',
      label: 'MediaTypes',
      width: 200,
      Cell: ({ value }) => {
        const title = uniq(flatMap((value as Format)?.map((p) => p.mediatypes))).join(', ');
        return (
          <Tooltip arrow {...{ title }}>
            <span className="truncate">
              <span>{title}</span>
            </span>
          </Tooltip>
        );
      }
    },
    {
      id: 'publications',
      label: 'Tier',
      width: 100,
      Cell: ({ value }) => {
        const title = uniq(flatMap((value as Format)?.map((p) => p.tiers))).join(', ');
        return (
          <Tooltip arrow {...{ title }}>
            <span className="truncate">
              <span>{title}</span>
            </span>
          </Tooltip>
        );
      }
    },
    {
      id: 'regions',
      label: 'Regions',
      width: 200,
      Cell: ({ value }) => {
        const title = (value as Format)?.map((p) => p.name).join(', ');
        return (
          <Tooltip arrow {...{ title }}>
            <span className="truncate">
              <span>{title}</span>
            </span>
          </Tooltip>
        );
      }
    }
  ];

  if (isEditor) {
    columns.splice(1, 0, {
      id: 'email',
      label: 'Email',
      width: 300
    });
  }

  return (
    <>
      {journalists.isLoading ? (
        <Box className={classes('flex justify-center items-center', styles.loader)}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {isEditor && (
            <Alert
              variant="standard"
              severity="info"
              className={`mb-2 py-0 ${selected.length === rowsPerPage ? 'visible' : 'invisible'}`}
              icon={false}
            >
              {selectAll ? (
                <Typography variant="body2" className="leading-6">
                  All journalists are selected
                </Typography>
              ) : (
                <div className="flex">
                  <Typography variant="body2" className="leading-6">
                    All journalists on this page are selected.
                  </Typography>
                  <Button variant="text" className="py-0 leading-6" onClick={() => setSelectAll(true)}>
                    Select all journalists
                  </Button>
                </div>
              )}
            </Alert>
          )}
          <TableContainer className={classes(styles.table)}>
            <Table stickyHeader padding="none" aria-label="sticky table">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      indeterminate={selected.length > 0 && selected.length < rowsPerPage}
                      checked={selected.length === rowsPerPage}
                      onChange={(event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
                        if (checked) {
                          setSelected(journalists.value?.map((d: JournalistProps) => d.uuid!) ?? []);
                        } else {
                          setSelected([]);
                          setSelectAll(false);
                        }
                      }}
                    />
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell key={column.id} align={column.align} style={{ minWidth: column.minWidth, width: column.width }}>
                      <Typography variant="body2" className="px-4">
                        {column.label}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {journalists.value?.map((row: JournalistProps) => {
                  return (
                    <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={selected.includes(row.uuid!)}
                          onChange={(event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
                            if (checked && !selected.includes(row.uuid!)) {
                              setSelected(selected.concat(row.uuid!));
                            }
                            if (!checked && selected.includes(row.uuid!)) {
                              setSelected(selected.filter((d) => d !== row.uuid));
                            }
                          }}
                        />
                      </TableCell>
                      {columns.map((column) => {
                        const value = row[column.id!]!;
                        return (
                          <StyledTableCell key={column.id} align={column.align} style={{ minWidth: column.minWidth, width: column.width }}>
                            <div className="inline-block" style={{ width: column.width }}>
                              <Typography variant="body2" gutterBottom className="w-full flex px-4">
                                <>
                                  {column.Cell
                                    ? column.Cell(
                                        { value, row }
                                        //TODO: router.push when clicked on a link element
                                      )
                                    : value}
                                </>
                              </Typography>
                            </div>
                          </StyledTableCell>
                        );
                      })}
                    </StyledTableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(event: React.MouseEvent<HTMLButtonElement> | null, newPage: number): void => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[25, 50, 100, 200]}
            onRowsPerPageChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
          />
        </>
      )}
    </>
  );
}

const styles = stylesheet({
  table: {
    maxHeight: 'calc(100vh - 350px)'
  },
  loader: {
    minHeight: 'calc(100vh - 150px)'
  }
});
