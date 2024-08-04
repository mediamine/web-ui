'use client';

import { FormControlAutocompleteMulti } from '@/components/mui/formControls/autocomplete/multi';
import { FormControlTextField } from '@/components/mui/formControls/textField';
import { StyledTableCell, StyledTableRow } from '@/components/mui/table/styledComponents';
import {
  FormatTypeProps,
  JournalistProps,
  NewsTypeProps,
  PublicationMediaTypeProps,
  PublicationProps,
  PublicationTierProps,
  RegionProps,
  RoleTypeProps
} from '@/models/journalist';
import { JournalistDetails } from '@/pages/journalist/details/page';
import EditJournalist from '@/pages/journalist/edit/page';
import { AdvancedSearch } from '@/pages/journalist/list/search';
import { ToastProvider } from '@/providers/ToastProvider';
import AddIcon from '@mui/icons-material/Add';
import ArchiveIcon from '@mui/icons-material/Archive';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import {
  Alert,
  AppBar,
  Badge,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  ClickAwayListener,
  Divider,
  Drawer,
  IconButton,
  MenuItem,
  MenuList,
  Paper,
  Popover,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material';
import TableRow from '@mui/material/TableRow';
import axios from 'axios';
import { debounce, flatMap, isEmpty, uniq } from 'lodash';
import { useRouter } from 'next/navigation';
import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
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

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default function Journalists() {
  const router = useRouter();
  const [isEditor, setIsEditor] = useState(false);
  const [username, setUsername] = useState<string | null>();

  const [openUserAccountActions, setOpenUserAccountActions] = useState(false);
  const anchorRefUserAccountActions = useRef<HTMLButtonElement>(null);

  const [journalists, setJournalists] = useState<Array<JournalistProps>>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [total, setTotal] = useState(0);

  const [filterByName, setFilterByName] = useState<string>('');
  const [filterByNameDebounced, setFilterByNameDebounced] = useState<string>('');
  const [publications, setPublications] = useState<Array<PublicationProps>>([]);
  const [publicationsInput, setPublicationsInput] = useState<string | null>();
  const [filterByPublications, setFilterByPublications] = useState<Array<PublicationProps>>([]);
  const [publicationMediatypes, setPublicationMediatypes] = useState<Array<PublicationMediaTypeProps>>([]);
  const [filterByPublicationMediatypes, setFilterByPublicationMediatypes] = useState<Array<PublicationMediaTypeProps>>([]);
  const [publicationTiers, setPublicationTiers] = useState<Array<PublicationTierProps>>([]);
  const [filterByPublicationTiers, setFilterByPublicationTiers] = useState<Array<PublicationTierProps>>([]);
  const [formatTypes, setFormatTypes] = useState<Array<FormatTypeProps>>([]);
  const [filterByFormatTypes, setFilterByFormatTypes] = useState<Array<FormatTypeProps>>([]);
  const [newsTypes, setNewsTypes] = useState<Array<NewsTypeProps>>([]);
  const [filterByNewsTypes, setFilterByNewsTypes] = useState<Array<NewsTypeProps>>([]);
  const [roleTypes, setRoleTypes] = useState<Array<RoleTypeProps>>([]);
  const [filterByRoleTypes, setFilterByRoleType] = useState<Array<RoleTypeProps>>([]);
  const [regions, setRegions] = useState<Array<RegionProps>>([]);
  const [filterByRegions, setFilterByRegions] = useState<Array<RegionProps>>([]);

  const [journalistsWithFailedEmailValidation, setJournalistsWithFailedEmailValidation] = useState(0);
  const [showFailedEmailValidation, setShowFailedEmailValidation] = useState<boolean>(false);

  const [selected, setSelected] = useState<Array<string>>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [openDetailsDrawer, setOpenDetailsDrawer] = useState<boolean>(false);
  const [openEditDrawer, setOpenEditDrawer] = useState<boolean>(false);
  const [openSearchDrawer, setOpenSearchDrawer] = useState<boolean>(false);
  const [journalistId, setJournalistId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // TODO: for saving journalists selected
  // const [searchName, setSearchName] = useState<string | null>();
  // const [filterByJournalistSearchesUuid, setFilterByJournalistSearchesUuid] = useState<string>();

  const getJournalists = () => {
    setIsLoading(true);

    axios
      .get(`${HOSTNAME}/journalist`, {
        params: {
          marker: String(page * rowsPerPage),
          limit: String(rowsPerPage),
          sort: 'name:asc',
          name: filterByNameDebounced,
          ...(!isEmpty(filterByPublications) && { publicationIds: filterByPublications.map((p) => p.id) }),
          ...(!isEmpty(filterByPublicationMediatypes) && {
            publicationMediatypes: filterByPublicationMediatypes.map((p) => p.mediatype)
          }),
          ...(!isEmpty(filterByPublicationTiers) && { publicationTiers: filterByPublicationTiers.map((p) => p.name) }),
          ...(!isEmpty(filterByRegions) && { regionIds: filterByRegions.map((r) => r.id) }),
          ...(!isEmpty(filterByFormatTypes) && { formatTypeIds: filterByFormatTypes.map((ft) => ft.id) }),
          ...(!isEmpty(filterByNewsTypes) && { newsTypeIds: filterByNewsTypes.map((nt) => nt.id) }),
          ...(!isEmpty(filterByRoleTypes) && { roleTypeIds: filterByRoleTypes.map((rt) => rt.id) }),
          validEmail: !showFailedEmailValidation
        }
      })
      .then(({ data }) => {
        setJournalists(data.items);
        setTotal(data.total);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err.response.status === 401) {
          router.push('/login?referrer=/journalist');
        }
      });

    axios
      .get(`${HOSTNAME}/journalist`, {
        params: {
          validEmail: showFailedEmailValidation
        }
      })
      .then(({ data }) => {
        setJournalistsWithFailedEmailValidation(data.total);
      });
  };

  const getPublications = () =>
    axios
      .get(
        `${HOSTNAME}/publication?${new URLSearchParams({
          hasJournalist: 'true',
          limit: '500'
        }).toString()}`
      )
      .then(({ data }) => {
        setPublications(data.items);
      })
      .catch((err) => console.error(err));

  const getPublicationMediaTypes = () =>
    axios
      .get(`${HOSTNAME}/publication-media-type`, {
        params: {
          ...(!isEmpty(filterByPublications) && { publicationIds: filterByPublications.map((p) => p.id) })
        }
      })
      .then(({ data }) => {
        setPublicationMediatypes(data.items);
      })
      .catch((err) => console.error(err));

  // TODO: for saving journalists selected
  // const saveJournalistSearch = (copy: boolean) => {
  //   const payload = {
  //     name: searchName,
  //     description: searchName,
  //     journalists: JSON.stringify(selected)
  //   };

  //   if (filterByJournalistSearchesUuid && !copy) {
  //     axios
  //       .put(`${HOSTNAME}/journalist-search/${filterByJournalistSearchesUuid}`, payload)
  //       .then(() => {
  //         useToast('Journalist Search Details are saved successfully.');
  //         setOpenSearchDrawer(false);
  //         setSearchName(null);
  //       })
  //       .catch((err) => {
  //         if (err.response.status === 401) {
  //           router.push('/login?referrer=/journalist');
  //         }
  //       });
  //   } else {
  //     axios
  //       .post(`${HOSTNAME}/journalist-search`, payload)
  //       .then(() => {
  //         useToast('Journalist Search Details are saved successfully.');
  //         setOpenSearchDrawer(false);
  //         setSearchName(null);
  //       })
  //       .catch((err) => {
  //         if (err.response.status === 401) {
  //           router.push('/login?referrer=/journalist');
  //         }
  //       })
  //       .finally(() => setShowConfirmSaveSearchDialog(false));
  //   }
  // };

  const exportJournalists = () =>
    axios

      .post(`${HOSTNAME}/journalist/export`, {
        ids: selected,
        selectAll,
        sort: 'name:asc',
        name: filterByNameDebounced,
        ...(!isEmpty(filterByPublications) && { publicationIds: filterByPublications.map((p) => p.id) }),
        ...(!isEmpty(filterByPublicationMediatypes) && {
          publicationMediatypes: filterByPublicationMediatypes.map((p) => p.mediatype)
        }),
        ...(!isEmpty(filterByPublicationTiers) && { publicationTiers: filterByPublicationTiers.map((p) => p.name) }),
        ...(!isEmpty(filterByRegions) && { regionIds: filterByRegions.map((r) => r.id) }),
        ...(!isEmpty(filterByFormatTypes) && { formatTypeIds: filterByFormatTypes.map((ft) => ft.id) }),
        ...(!isEmpty(filterByNewsTypes) && { newsTypeIds: filterByNewsTypes.map((nt) => nt.id) }),
        ...(!isEmpty(filterByRoleTypes) && { roleTypeIds: filterByRoleTypes.map((rt) => rt.id) }),
        validEmail: !showFailedEmailValidation
      })
      .then((resp) => {
        const url = window.URL.createObjectURL(new Blob([resp.data], { type: 'text/csv' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `journalist.csv`);

        // Append to html link element page
        document.body.appendChild(link);

        // Start download
        link.click();

        // Clean up and remove the link
        link.parentNode?.removeChild(link);
      });

  const archiveJournalists = () =>
    axios
      .put(`${HOSTNAME}/journalist/batch`, {
        enabled: false,
        ids: selected,
        selectAll,
        sort: 'name:asc',
        name: filterByNameDebounced,
        ...(!isEmpty(filterByPublications) && { publicationIds: filterByPublications.map((p) => p.id) }),
        ...(!isEmpty(filterByPublicationMediatypes) && {
          publicationMediatypes: filterByPublicationMediatypes.map((p) => p.mediatype)
        }),
        ...(!isEmpty(filterByPublicationTiers) && { publicationTiers: filterByPublicationTiers.map((p) => p.name) }),
        ...(!isEmpty(filterByRegions) && { regionIds: filterByRegions.map((r) => r.id) }),
        ...(!isEmpty(filterByFormatTypes) && { formatTypeIds: filterByFormatTypes.map((ft) => ft.id) }),
        ...(!isEmpty(filterByNewsTypes) && { newsTypeIds: filterByNewsTypes.map((nt) => nt.id) }),
        ...(!isEmpty(filterByRoleTypes) && { roleTypeIds: filterByRoleTypes.map((rt) => rt.id) }),
        validEmail: !showFailedEmailValidation
      })
      .then(() => {
        console.log('Journalists are archived successfully.');
        setSelected([]);
        getJournalists();
      })
      .catch((err) => console.error(err));

  const validateJournalists = () =>
    axios
      .post(`${HOSTNAME}/journalist/validate`, {
        ids: selected,
        selectAll,
        sort: 'name:asc',
        name: filterByNameDebounced,
        ...(!isEmpty(filterByPublications) && { publicationIds: filterByPublications.map((p) => p.id) }),
        ...(!isEmpty(filterByPublicationMediatypes) && {
          publicationMediatypes: filterByPublicationMediatypes.map((p) => p.mediatype)
        }),
        ...(!isEmpty(filterByPublicationTiers) && { publicationTiers: filterByPublicationTiers.map((p) => p.name) }),
        ...(!isEmpty(filterByRegions) && { regionIds: filterByRegions.map((r) => r.id) }),
        ...(!isEmpty(filterByFormatTypes) && { formatTypeIds: filterByFormatTypes.map((ft) => ft.id) }),
        ...(!isEmpty(filterByNewsTypes) && { newsTypeIds: filterByNewsTypes.map((nt) => nt.id) }),
        ...(!isEmpty(filterByRoleTypes) && { roleTypeIds: filterByRoleTypes.map((rt) => rt.id) }),
        validEmail: !showFailedEmailValidation
      })
      .then(() => {
        console.log('Journalists are validated successfully.');
        setSelected([]);
        getJournalists();
      })
      .catch((err) => console.error(err));

  useEffect(() => {
    setUsername(localStorage?.getItem('username'));
    setIsEditor(localStorage?.getItem('editor') === 'true');

    getPublications();

    getPublicationMediaTypes();

    axios
      .get(`${HOSTNAME}/publication-tier`)
      .then(({ data }) => {
        setPublicationTiers(data.items);
      })
      .catch((err) => console.error(err));

    axios
      .get(`${HOSTNAME}/format-type`)
      .then(({ data }) => {
        setFormatTypes(data.items);
      })
      .catch((err) => console.error(err));

    axios
      .get(`${HOSTNAME}/news-type`)
      .then(({ data }) => setNewsTypes(data.items))
      .catch((err) => console.error(err));

    axios
      .get(`${HOSTNAME}/role-type`)
      .then(({ data }) => setRoleTypes(data.items))
      .catch((err) => console.error(err));

    axios
      .get(
        `${HOSTNAME}/region?${new URLSearchParams({
          hasJournalist: 'true'
        }).toString()}`
      )
      .then(({ data }) => {
        setRegions(data.items);
      })
      .catch((err) => console.error(err));
  }, []);

  const dPublications = useMemo(() => debounce((value) => setPublicationsInput(value), 500), []);
  useEffect(() => {
    if (publicationsInput && (publicationsInput.length === 0 || publicationsInput.length > 2)) {
      axios
        .get(
          `${HOSTNAME}/publication?${new URLSearchParams({
            name: publicationsInput,
            hasJournalist: 'true',
            limit: '500'
          }).toString()}`
        )
        .then(({ data }) => {
          // setPublications(uniqBy([...publications, ...data.items], 'id'));
          setPublications(data.items);
        })
        .catch((err) => console.error(err));
    }
  }, [publicationsInput]);

  const dFilterByName = useMemo(() => debounce((value) => setFilterByNameDebounced(value), 500), []);
  useEffect(() => {
    if (filterByName.length === 0 || filterByName.length > 2) {
      dFilterByName(filterByName);
      setPage(0);
    }
  }, [filterByName]);

  useEffect(() => {
    if (!(openEditDrawer || openDetailsDrawer)) {
      getJournalists();
      getPublications();
      getPublicationMediaTypes();
    }
  }, [
    filterByNameDebounced,
    filterByPublications,
    filterByPublicationMediatypes,
    filterByPublicationTiers,
    filterByRegions,
    filterByFormatTypes,
    filterByNewsTypes,
    filterByRoleTypes,
    showFailedEmailValidation,
    page,
    rowsPerPage,
    openEditDrawer,
    openDetailsDrawer
  ]);

  const columns: Column[] = [
    {
      id: 'first_name',
      label: 'Journalist Name',
      width: 300,
      Cell: ({ row }) => (
        <Button
          onClick={() => {
            setJournalistId(row.uuid);
            if (isEditor) {
              setOpenEditDrawer(true);
            } else {
              setOpenDetailsDrawer(true);
            }

            // TODO: push && push(`publications/${rowId}`);
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

  const resetSearch = () => {
    setFilterByName('');
    setFilterByPublications([]);
    setFilterByPublicationMediatypes([]);
    setFilterByPublicationTiers([]);
    setFilterByFormatTypes([]);
    setFilterByNewsTypes([]);
    setFilterByRoleType([]);
    setFilterByRegions([]);
  };

  return (
    <ToastProvider>
      <div className="mt-16 mb-8">
        <AppBar position="relative" className="px-8">
          <Toolbar disableGutters className="flex justify-between">
            <Box className="flex gap-8">
              <Typography variant="h6">Journalist Directory</Typography>
            </Box>
            <Box className="flex gap-8">
              {/* TODO: Save Journalists
                <Badge color="error" badgeContent={selected.length}>
                  <Tooltip title="Save Journalists" arrow>
                    <Button
                      variant="contained"
                      color="inherit"
                      aria-label="save"
                      onClick={() => setShowConfirmSaveSearchDialog(true)}
                      disabled={selected.length === 0}
                    >
                      <SaveIcon fontSize="small" color="primary" />
                    </Button>
                  </Tooltip>
                </Badge>
              */}
              <Badge color="error" badgeContent={selected.length}>
                <Tooltip title="Email Journalists" arrow>
                  <Button
                    variant="contained"
                    color="inherit"
                    aria-label="email"
                    href={`mailto:?bcc=${journalists
                      .filter((j) => selected.includes(j.uuid ?? ''))
                      .map((j) => j.email)
                      .join(';')}`}
                    disabled={selected.length === 0}
                  >
                    <EmailIcon fontSize="small" color="primary" />
                  </Button>
                </Tooltip>
              </Badge>
              <Badge color="error" badgeContent={selectAll ? total : selected.length}>
                <Tooltip title="Export Journalists" arrow>
                  <Button
                    variant="contained"
                    color="inherit"
                    aria-label="export"
                    onClick={() => exportJournalists()}
                    disabled={selected.length === 0}
                  >
                    <DownloadIcon fontSize="small" color="primary" />
                  </Button>
                </Tooltip>
              </Badge>
              <IconButton
                ref={anchorRefUserAccountActions}
                id="composition-button"
                aria-controls={openUserAccountActions ? 'composition-menu' : undefined}
                aria-expanded={openUserAccountActions ? 'true' : undefined}
                aria-haspopup="true"
                color="inherit"
                onClick={() => setOpenUserAccountActions((prevOpen) => !prevOpen)}
              >
                <PersonIcon />
              </IconButton>
              <Popover
                open={openUserAccountActions}
                anchorEl={anchorRefUserAccountActions.current}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right'
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right'
                }}
              >
                <Paper>
                  <ClickAwayListener
                    onClickAway={(event: Event | React.SyntheticEvent) => {
                      if (anchorRefUserAccountActions.current && anchorRefUserAccountActions.current.contains(event.target as HTMLElement))
                        return;
                      setOpenUserAccountActions(false);
                    }}
                  >
                    <MenuList
                      autoFocusItem={openUserAccountActions}
                      id="composition-menu"
                      aria-labelledby="composition-button"
                      onKeyDown={(event: React.KeyboardEvent) => {
                        if (event.key === 'Tab') {
                          event.preventDefault();
                          setOpenUserAccountActions(false);
                        } else if (event.key === 'Escape') {
                          setOpenUserAccountActions(false);
                        }
                      }}
                    >
                      <MenuItem className="flex gap-4 p-4">
                        <Typography>{username}</Typography>
                      </MenuItem>
                      <Divider />
                      <MenuItem
                        className="flex gap-4 p-4"
                        onClick={() => {
                          localStorage.removeItem('token');
                          router.push('/login?referrer=/journalist');
                        }}
                      >
                        <LogoutIcon fontSize="small" color="primary" />
                        <Typography>Logout</Typography>
                      </MenuItem>
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Popover>
            </Box>
          </Toolbar>
        </AppBar>
        <Paper className="px-8 py-2 rounded-none">
          <div className="py-2 flex justify-between">
            <div className="flex gap-4">
              <FormControlTextField
                addClassName="w-60"
                id={'journalist-name'}
                value={filterByName}
                label={'Journalist Name'}
                onChange={(e) => setFilterByName(e.target.value)}
              />

              <FormControlAutocompleteMulti
                addClassName="w-72"
                id={'publications'}
                options={publications}
                renderOption={(props, option, { selected }) => (
                  <span {...props} key={option.id}>
                    <Checkbox
                      icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                      checkedIcon={<CheckBoxIcon fontSize="small" />}
                      checked={selected || filterByPublications?.map((p) => p.id).includes(option.id!)}
                    />
                    {option.name}
                  </span>
                )}
                value={filterByPublications}
                label={'Publications'}
                onInputChange={(_, newValue) => dPublications(newValue)}
                onChange={(_, newValue) => {
                  setFilterByPublications(newValue as Array<PublicationProps>);
                  setPage(0);
                }}
              />

              <Badge
                variant="dot"
                {...((filterByNameDebounced ||
                  !isEmpty(filterByPublications) ||
                  !isEmpty(filterByPublicationMediatypes) ||
                  !isEmpty(filterByPublicationTiers) ||
                  !isEmpty(filterByFormatTypes) ||
                  !isEmpty(filterByNewsTypes) ||
                  !isEmpty(filterByRoleTypes) ||
                  !isEmpty(filterByRegions)) && { color: 'primary' })}
              >
                <Button variant="outlined" onClick={() => setOpenSearchDrawer(true)}>
                  Filters
                </Button>
              </Badge>
              <Divider orientation="vertical" flexItem />
              <Button
                variant="text"
                onClick={() => {
                  resetSearch();
                  setOpenSearchDrawer(false);
                }}
              >
                Reset Filters
              </Button>
            </div>
            <div className="flex gap-8">
              {isEditor && (
                <Tooltip title="Add Journalist" arrow>
                  <Button
                    variant="contained"
                    aria-label="add"
                    onClick={() => {
                      // TODO: router.push(`publications/add`);
                      setOpenEditDrawer(true);
                      setJournalistId(undefined);
                    }}
                  >
                    <AddIcon fontSize="small" />
                  </Button>
                </Tooltip>
              )}
              {isEditor && (
                <Badge
                  {...(journalistsWithFailedEmailValidation > 0 && { color: 'error' })}
                  badgeContent={journalistsWithFailedEmailValidation}
                >
                  <Tooltip
                    arrow
                    {...{ title: `Show Journalists with ${showFailedEmailValidation ? 'Passed' : 'Failed'} Email Validation` }}
                  >
                    <Button variant="contained" onClick={() => setShowFailedEmailValidation(!showFailedEmailValidation)}>
                      {showFailedEmailValidation ? <PersonIcon fontSize="small" /> : <PersonOffIcon fontSize="small" />}
                    </Button>
                  </Tooltip>
                </Badge>
              )}
              {isEditor && (
                <Badge color="error" badgeContent={selectAll ? total : selected.length}>
                  <Tooltip title="Validate Journalists" arrow>
                    <Button
                      variant="contained"
                      aria-label="validate"
                      onClick={() => validateJournalists()}
                      disabled={selected.length === 0}
                    >
                      <VerifiedUserIcon fontSize="small" />
                    </Button>
                  </Tooltip>
                </Badge>
              )}
              {isEditor && (
                <Badge color="error" badgeContent={selectAll ? total : selected.length}>
                  <Tooltip title="Archive Journalists" arrow>
                    <Button
                      variant="contained"
                      color="error"
                      aria-label="archive"
                      onClick={() => archiveJournalists()}
                      disabled={selected.length === 0}
                    >
                      <ArchiveIcon fontSize="small" />
                    </Button>
                  </Tooltip>
                </Badge>
              )}
            </div>
          </div>
          {isLoading ? (
            <Box className="flex justify-center items-center">
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
                              setSelected(journalists.map((d: JournalistProps) => d.uuid!));
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
                    {journalists.map((row: JournalistProps) => {
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
                              <StyledTableCell
                                key={column.id}
                                align={column.align}
                                style={{ minWidth: column.minWidth, width: column.width }}
                              >
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
        </Paper>
        <Drawer
          anchor={'right'}
          open={openEditDrawer}
          onClose={() => {
            setJournalistId(undefined);
            setOpenEditDrawer(false);
          }}
          PaperProps={{ classes: { root: 'w-2/5' } }}
        >
          <EditJournalist {...{ id: journalistId, setOpenEditDrawer }} />
        </Drawer>
        <Drawer
          anchor={'right'}
          open={openDetailsDrawer}
          onClose={() => {
            setJournalistId(undefined);
            setOpenDetailsDrawer(false);
          }}
          PaperProps={{ classes: { root: 'w-2/5' } }}
        >
          <JournalistDetails {...{ id: journalistId, setOpenDetailsDrawer }} />
        </Drawer>
        <Drawer
          anchor={'right'}
          open={openSearchDrawer}
          onClose={() => {
            setOpenSearchDrawer(false);
          }}
          PaperProps={{ classes: { root: 'w-2/5' } }}
        >
          <AdvancedSearch
            {...{
              setOpenSearchDrawer,
              filterByName,
              setFilterByName,
              filterByNameDebounced,
              publications,
              filterByPublications,
              setFilterByPublications,
              dPublications,
              publicationMediatypes,
              filterByPublicationMediatypes,
              setFilterByPublicationMediatypes,
              publicationTiers,
              filterByPublicationTiers,
              setFilterByPublicationTiers,
              formatTypes,
              filterByFormatTypes,
              setFilterByFormatTypes,
              newsTypes,
              filterByNewsTypes,
              setFilterByNewsTypes,
              roleTypes,
              filterByRoleTypes,
              setFilterByRoleType,
              regions,
              filterByRegions,
              setFilterByRegions,
              setPage,
              setSelected,
              resetSearch
            }}
          />
        </Drawer>
      </div>
    </ToastProvider>
  );
}

const styles = stylesheet({
  table: {
    maxHeight: 'calc(100vh - 350px)'
  }
});
