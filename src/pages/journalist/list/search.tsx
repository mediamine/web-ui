import { DialogForm } from '@/components/mui/dialog';
import { FormControlAutocompleteMulti } from '@/components/mui/formControls/autocomplete/multi';
import { FormControlAutocompleteSingle } from '@/components/mui/formControls/autocomplete/single';
import { FormControlTextField } from '@/components/mui/formControls/textField';
import {
  FormatTypeProps,
  NewsTypeProps,
  PublicationMediaTypeProps,
  PublicationProps,
  PublicationTierProps,
  RegionProps,
  RoleTypeProps
} from '@/models/journalist';
import { useToast } from '@/providers/ToastProvider';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { Button, Checkbox, Divider, FormControl, Paper, TextField } from '@mui/material';
import axios from 'axios';
import { debounce, isEmpty, uniqBy } from 'lodash';
import { useRouter } from 'next/navigation';
import { Dispatch, FC, SetStateAction, useEffect, useMemo, useState } from 'react';

const HOSTNAME = process.env.NEXT_PUBLIC_MEDIAMINE_API_HOSTNAME;

interface AdvancedSearchProps {
  setOpenSearchDrawer: (open: boolean) => void;
  filterByName: string;
  setFilterByName: Dispatch<SetStateAction<string>>;
  filterByNameDebounced: string;
  publications: Array<PublicationProps>;
  filterByPublications: Array<PublicationProps>;
  setFilterByPublications: Dispatch<SetStateAction<Array<PublicationProps>>>;
  dPublications: (name: string) => void;
  publicationMediatypes: Array<PublicationMediaTypeProps>;
  filterByPublicationMediatypes: Array<PublicationMediaTypeProps>;
  setFilterByPublicationMediatypes: Dispatch<SetStateAction<Array<PublicationMediaTypeProps>>>;
  publicationTiers: Array<PublicationTierProps>;
  filterByPublicationTiers: Array<PublicationTierProps>;
  setFilterByPublicationTiers: Dispatch<SetStateAction<Array<PublicationTierProps>>>;
  formatTypes: Array<FormatTypeProps>;
  filterByFormatTypes: Array<FormatTypeProps>;
  setFilterByFormatTypes: Dispatch<SetStateAction<Array<FormatTypeProps>>>;
  newsTypes: Array<NewsTypeProps>;
  filterByNewsTypes: Array<NewsTypeProps>;
  setFilterByNewsTypes: Dispatch<SetStateAction<Array<NewsTypeProps>>>;
  roleTypes: Array<RoleTypeProps>;
  filterByRoleTypes: Array<RoleTypeProps>;
  setFilterByRoleType: Dispatch<SetStateAction<Array<RoleTypeProps>>>;
  regions: Array<RegionProps>;
  filterByRegions: Array<RegionProps>;
  setFilterByRegions: Dispatch<SetStateAction<Array<RegionProps>>>;
  setPage: Dispatch<SetStateAction<number>>;
  setSelected: Dispatch<SetStateAction<Array<string>>>;
  resetSearch: () => void;
}

interface JournalistSearchProps {
  uuid: string;
  name: string;
  search: string;
  journalists: string;
}

export const AdvancedSearch: FC<AdvancedSearchProps> = ({
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
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const [journalistSearches, setJournalistSearches] = useState<Array<JournalistSearchProps>>([]);
  const [journalistSearchesInput, setJournalistSearchesInput] = useState<string | null>();
  const [filterByJournalistSearches, setFilterByJournalistSearches] = useState<JournalistSearchProps>();
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);
  const [searchName, setSearchName] = useState<string | null>();
  const [showConfirmSaveSearchDialog, setShowConfirmSaveSearchDialog] = useState(false);
  const [showConfirmDeleteSearchDialog, setShowConfirmDeleteSearchDialog] = useState(false);

  useEffect(() => {
    axios
      .get(`${HOSTNAME}/journalist-search`)
      .then(({ data }) => {
        setJournalistSearches(data.items);
      })
      .catch((err) => {
        if (err.response.status === 401) {
          router.push('/login?referrer=/journalist');
        }
      });
  }, []);

  const dJournalistSearches = useMemo(() => debounce((value) => setJournalistSearchesInput(value), 500), []);
  useEffect(() => {
    if (journalistSearchesInput) {
      axios
        .get(
          `${HOSTNAME}/journalist-search?${new URLSearchParams({
            name: journalistSearchesInput
          }).toString()}`
        )
        .then(({ data }) => {
          setJournalistSearches(data.items);
        })
        .catch((err) => console.error(err));
    }
  }, [journalistSearchesInput]);

  useEffect(() => {
    if (filterByJournalistSearches?.search) {
      try {
        const d = JSON.parse(filterByJournalistSearches?.search as unknown as string);
        if (d.filterByNameDebounced) setFilterByName(d.filterByNameDebounced);
        if (d.filterByPublications) setFilterByPublications(d.filterByPublications);
        if (d.filterByPublicationMediatypes) setFilterByPublicationMediatypes(d.filterByPublicationMediatypes);
        if (d.filterByPublicationTiers) setFilterByPublicationTiers(d.filterByPublicationTiers);
        if (d.filterByFormatTypes) setFilterByFormatTypes(d.filterByFormatTypes);
        if (d.filterByNewsTypes) setFilterByNewsTypes(d.filterByNewsTypes);
        if (d.filterByRoleTypes) setFilterByRoleType(d.filterByRoleTypes);
      } catch (error) {
        console.error('Unable to parse the filterByJournalistSearches string');
      }
    }

    // TBD
    // if (filterByJournalistSearches?.journalists) {
    //   try {
    //     const d = JSON.parse(filterByJournalistSearches?.journalists as unknown as string);
    //     setSelected(d);
    //   } catch (error) {
    //     console.error('Unable to parse the filterByJournalistSearches string');
    //   }
    // }

    setSearchName(filterByJournalistSearches?.name);
  }, [filterByJournalistSearches]);

  const onSaveJournalistSearch = (copy: boolean) => {
    const payload = {
      name: searchName,
      description: searchName,
      search: JSON.stringify({
        ...(!isEmpty(filterByNameDebounced) && { filterByNameDebounced }),
        ...(!isEmpty(filterByPublications) && { filterByPublications }),
        ...(!isEmpty(filterByPublicationMediatypes) && { filterByPublicationMediatypes }),
        ...(!isEmpty(filterByPublicationTiers) && { filterByPublicationTiers }),
        ...(!isEmpty(filterByFormatTypes) && { filterByFormatTypes }),
        ...(!isEmpty(filterByNewsTypes) && { filterByNewsTypes }),
        ...(!isEmpty(filterByRoleTypes) && { filterByRoleTypes })
      })
    };

    if (filterByJournalistSearches?.uuid && !copy) {
      axios
        .put(`${HOSTNAME}/journalist-search/${filterByJournalistSearches?.uuid}`, payload)
        .then(() => {
          toast('Journalist Search Details are saved successfully.');
          setShowConfirmSaveSearchDialog(false);
          setOpenSearchDrawer(false);
          resetSearch();
        })
        .catch((err) => {
          if (err.response.status === 401) {
            router.push('/login?referrer=/journalist');
          }
        });
    } else {
      axios
        .post(`${HOSTNAME}/journalist-search`, payload)
        .then(() => {
          toast('Journalist Search Details are saved successfully.');
          setShowConfirmSaveSearchDialog(false);
          setOpenSearchDrawer(false);
          resetSearch();
        })
        .catch((err) => {
          if (err.response.status === 401) {
            router.push('/login?referrer=/journalist');
          }
        });
    }
  };

  const onDeleteJournalistSearch = () => {
    if (filterByJournalistSearches?.uuid) {
      axios
        .delete(`${HOSTNAME}/journalist-search/${filterByJournalistSearches?.uuid}`)
        .then(() => {
          toast('Journalist Search Details are deleted successfully.');
          setShowConfirmDeleteSearchDialog(false);
          setOpenSearchDrawer(false);
          resetSearch();
        })
        .catch((err) => {
          if (err.response.status === 401) {
            router.push('/login?referrer=/journalist');
          }
        });
    }
  };

  return (
    <>
      <Paper className="h-full p-8 flex flex-col gap-8">
        <FormControlAutocompleteSingle
          id="journalist-searches"
          options={journalistSearches}
          value={filterByJournalistSearches}
          label={'Load Saved List'}
          onInputChange={(_e, newValue): void => dJournalistSearches(newValue)}
          onChange={(_e, newValue) => {
            if (newValue) setFilterByJournalistSearches(newValue);
          }}
        />

        <Divider />

        <FormControlTextField
          id={'journalist-name'}
          value={filterByName}
          label={'Journalist Name'}
          onChange={(e) => {
            setFilterByName(e.target.value);
            setIsSaveEnabled(true);
          }}
        />

        <FormControlAutocompleteMulti
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
          onInputChange={(_e, newValue): void => dPublications(newValue)}
          onChange={(_e, newValue) => {
            setFilterByPublications(uniqBy(newValue, 'id'));
            setIsSaveEnabled(true);
            setPage(0);
          }}
        />

        <FormControlAutocompleteMulti
          id={'publication-mediatypes'}
          options={publicationMediatypes}
          getOptionLabel={(o) => o.mediatype}
          value={filterByPublicationMediatypes}
          label={'Publication Media Types'}
          onChange={(_e, newValue) => {
            setFilterByPublicationMediatypes(newValue);
            setIsSaveEnabled(true);
            setPage(0);
          }}
        />

        <FormControlAutocompleteMulti
          id={'publication-tiers'}
          options={publicationTiers}
          value={filterByPublicationTiers}
          label={'Publication Tiers'}
          onChange={(_e, newValue) => {
            setFilterByPublicationTiers(newValue);
            setIsSaveEnabled(true);
            setPage(0);
          }}
        />

        <FormControlAutocompleteMulti
          id={'regions'}
          options={regions}
          value={filterByRegions}
          label={'Regions'}
          onChange={(_e, newValue) => {
            setFilterByRegions(newValue);
            setIsSaveEnabled(true);
            setPage(0);
          }}
        />

        <FormControlAutocompleteMulti
          id={'news-types'}
          options={formatTypes}
          value={filterByFormatTypes}
          label={'Format Types'}
          onChange={(_e, newValue) => {
            setFilterByFormatTypes(newValue);
            setIsSaveEnabled(true);
            setPage(0);
          }}
        />

        <FormControlAutocompleteMulti
          id={'news-types'}
          options={newsTypes}
          value={filterByNewsTypes}
          label={'News Types'}
          onChange={(_e, newValue) => {
            setFilterByNewsTypes(newValue);
            setIsSaveEnabled(true);
            setPage(0);
          }}
        />

        <FormControlAutocompleteMulti
          id={'job-titles'}
          options={roleTypes}
          value={filterByRoleTypes}
          label={'Job Titles'}
          onChange={(_e, newValue) => {
            setFilterByRoleType(newValue);
            setIsSaveEnabled(true);
            setPage(0);
          }}
        />
      </Paper>

      <Paper className="sticky bottom-0 px-8 py-4 rounded-none z-50 shadow-sm flex justify-between">
        <div className="flex gap-2 justify-end">
          <Button
            variant="contained"
            color="error"
            onClick={() => setShowConfirmDeleteSearchDialog(true)}
            disabled={!filterByJournalistSearches}
          >
            Delete
          </Button>
        </div>
        <div className="flex gap-2 justify-end">
          <Button
            variant="outlined"
            onClick={() => {
              resetSearch();
              setOpenSearchDrawer(false);
            }}
          >
            Reset Filters
          </Button>
          <Button variant="contained" onClick={() => setShowConfirmSaveSearchDialog(true)} disabled={!isSaveEnabled}>
            Save
          </Button>
        </div>
      </Paper>

      <DialogForm
        open={showConfirmSaveSearchDialog}
        title={'Save List'}
        onCancel={() => setShowConfirmSaveSearchDialog(false)}
        moreActions={
          <>
            <Button variant="contained" color="primary" onClick={() => onSaveJournalistSearch(false)}>
              Save
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => onSaveJournalistSearch(true)}
              disabled={Boolean(searchName && journalistSearches.find((s) => s?.name === searchName))}
            >
              Save a Copy
            </Button>
          </>
        }
      >
        <FormControl size="small" className="w-full p-4">
          {showConfirmSaveSearchDialog && (
            <TextField
              id="search-name"
              variant="outlined"
              color="primary"
              size="small"
              label="Name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          )}
        </FormControl>
      </DialogForm>

      <DialogForm
        open={showConfirmDeleteSearchDialog}
        title={'Are you sure you want to delete the Saved List?'}
        onCancel={() => setShowConfirmDeleteSearchDialog(false)}
        moreActions={
          <Button variant="contained" color="error" onClick={onDeleteJournalistSearch}>
            Delete
          </Button>
        }
      />
    </>
  );
};

export default AdvancedSearch;
