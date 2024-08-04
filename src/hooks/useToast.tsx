import { Fade, Snackbar } from '@mui/material';
import { ReactElement, useState } from 'react';

export const useToast = (message: string): ReactElement => {
  const [showNotificationMessage, setShowNotificationMessage] = useState<string | null>(message);

  return (
    <Snackbar
      open={!!showNotificationMessage}
      message={showNotificationMessage}
      onClose={() => setShowNotificationMessage(null)}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      autoHideDuration={2000}
      TransitionComponent={Fade}
    />
  );
};
