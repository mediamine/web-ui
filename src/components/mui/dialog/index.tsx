import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Fade } from '@mui/material';
import { FC, ReactElement, useEffect, useState } from 'react';

interface DialogFormProps {
  open: boolean;
  title: string;
  children?: ReactElement;
  onCancel: () => void;
  moreActions: ReactElement;
}

export const DialogForm: FC<DialogFormProps> = ({ open = false, title, children, onCancel, moreActions }): ReactElement => {
  const [openDialog, setOpenDialog] = useState(open);

  useEffect(() => {
    setOpenDialog(open);
  }, [open]);

  return (
    <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="md" TransitionComponent={Fade} keepMounted>
      <DialogTitle className="p-4">{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions className="p-4">
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        {moreActions}
      </DialogActions>
    </Dialog>
  );
};
