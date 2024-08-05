import { DialogForm } from '@/components/mui/dialog';
import { useToast } from '@/providers/ToastProvider';
import { JournalistSearchProps } from '@/types/journalist';
import { Button, FormControl, TextField } from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

const HOSTNAME = process.env.NEXT_PUBLIC_MEDIAMINE_API_HOSTNAME;

interface SaveJournalistSelectProps {
  selected: Array<string>;
  selectedByJournalistSearch?: JournalistSearchProps;
  showConfirmSaveSearchDialog: boolean;
  setShowConfirmSaveSearchDialog: Dispatch<SetStateAction<boolean>>;
  resetSearch: () => void;
}

export default function ({
  selected,
  selectedByJournalistSearch,
  showConfirmSaveSearchDialog,
  setShowConfirmSaveSearchDialog,
  resetSearch
}: SaveJournalistSelectProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [searchName, setSearchName] = useState<string | null>();
  const [journalistSearches, setJournalistSearches] = useState<Array<JournalistSearchProps>>([]);

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
  }, [selectedByJournalistSearch?.uuid]);

  useEffect(() => {
    setSearchName(selectedByJournalistSearch?.name);
  }, [selectedByJournalistSearch?.name]);

  const onSaveJournalistSearch = (copy: boolean) => {
    const payload = {
      name: searchName,
      description: searchName,
      journalists: JSON.stringify(selected)
    };

    if (selectedByJournalistSearch?.uuid && !copy) {
      axios
        .put(`${HOSTNAME}/journalist-search/${selectedByJournalistSearch?.uuid}`, payload)
        .then(() => {
          toast('Journalist Search Details are saved successfully.');
          setSearchName(null);
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
          setSearchName(null);
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
      title={'Save List'}
      onCancel={() => setShowConfirmSaveSearchDialog(false)}
      moreActions={
        <>
          {selectedByJournalistSearch?.uuid && (
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
  );
}
