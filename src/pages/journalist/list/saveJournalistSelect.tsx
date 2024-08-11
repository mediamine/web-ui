import { DialogForm } from '@/components/mui/dialog';
import { useToast } from '@/providers/ToastProvider';
import { JournalistSearchProps } from '@/types/journalist';
import { Button } from '@mui/material';
import axios from 'axios';
import { uniq } from 'lodash';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useState } from 'react';
import ListJournalistSearch from './listJournalistSearch';

const HOSTNAME = process.env.NEXT_PUBLIC_MEDIAMINE_API_HOSTNAME;

interface SaveJournalistSelectProps {
  selected: Array<string>;
  // TODO: remove
  // selectedByJournalistSearch?: JournalistSearchProps;
  showConfirmSaveSearchDialog: boolean;
  setShowConfirmSaveSearchDialog: Dispatch<SetStateAction<boolean>>;
  resetSearch: () => void;
}

export default function SaveJournalistSelect({
  selected,
  // TODO: remove
  // selectedByJournalistSearch,
  showConfirmSaveSearchDialog,
  setShowConfirmSaveSearchDialog,
  resetSearch
}: SaveJournalistSelectProps) {
  const router = useRouter();
  const { toast } = useToast();
  // TODO: remove
  // const [searchName, setSearchName] = useState<string | null>();
  // const [journalistSearches, setJournalistSearches] = useState<Array<JournalistSearchProps>>([]);
  const [journalistSearch, setJournalistSearch] = useState<JournalistSearchProps>();

  // TODO: remove
  // useEffect(() => {
  //   axios
  //     .get(`${HOSTNAME}/journalist-search`)
  //     .then(({ data }) => {
  //       setJournalistSearches(data.items);
  //     })
  //     .catch((err) => {
  //       if (err.response.status === 401) {
  //         router.push('/login?referrer=/journalist');
  //       }
  //     });
  // }, [selectedByJournalistSearch?.uuid]);
  //
  // useEffect(() => {
  //   setSearchName(selectedByJournalistSearch?.name);
  // }, [selectedByJournalistSearch?.name]);

  const onSaveJournalistSearch = () =>
    // TODO: remove
    // copy: boolean
    {
      const searchName = journalistSearch?.inputValue;
      const journalists = JSON.parse(journalistSearch?.journalists ?? '[]');
      const payload = {
        name: searchName,
        description: searchName,
        journalists: JSON.stringify(uniq(journalists.concat(selected)))
      };

      if (journalistSearch?.uuid) {
        axios
          .put(`${HOSTNAME}/journalist-search/${journalistSearch?.uuid}`, payload)
          .then(() => {
            toast('Journalist Search Details are saved successfully.');
            // TODO: remove
            // setSearchName(null);
            resetSearch();
          })
          .catch((err) => {
            if (err.response.status === 401) {
              router.push('/login?referrer=/journalist');
            }
          })
          .finally(() => setShowConfirmSaveSearchDialog(false));
      } else {
        axios
          .post(`${HOSTNAME}/journalist-search`, payload)
          .then(() => {
            toast('Journalist Search Details are saved successfully.');
            // TODO: remove
            // setSearchName(null);
            resetSearch();
          })
          .catch((err) => {
            if (err.response.status === 401) {
              router.push('/login?referrer=/journalist');
            }
          })
          .finally(() => setShowConfirmSaveSearchDialog(false));
      }
    };

  return (
    <DialogForm
      open={showConfirmSaveSearchDialog}
      setOpen={setShowConfirmSaveSearchDialog}
      title={'Save List'}
      onCancel={() => setShowConfirmSaveSearchDialog(false)}
      moreActions={
        <>
          {/* TODO: remove */}
          {/* {selectedByJournalistSearch?.uuid && (
            <Button variant="contained" color="primary" onClick={() => onSaveJournalistSearch(false)}>
              Save
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={() => onSaveJournalistSearch(true)}
            disabled={Boolean(searchName && journalistSearches.find((s) => s?.name === searchName))}
          >
            Save a Copy
          </Button> */}
          <Button variant="contained" color="primary" onClick={onSaveJournalistSearch}>
            Save
          </Button>
        </>
      }
    >
      {selected.length > 0 ? <ListJournalistSearch {...{ journalistSearch, setJournalistSearch }} /> : null}
      {/* TODO: remove
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
      */}
    </DialogForm>
  );
}
