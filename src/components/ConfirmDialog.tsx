import { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, description, onConfirm, onCancel }: ConfirmDialogProps) {
  // Kapanma animasyonu sırasında prop'lar (ör. archiving state'i) null'a dönebilir;
  // son gösterilen içeriği dialog tamamen kapanana kadar koruyoruz.
  const [displayed, setDisplayed] = useState({ title, description });

  useEffect(() => {
    if (open) setDisplayed({ title, description });
  }, [open, title, description]);

  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{displayed.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{displayed.description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Vazgeç</Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Onayla
        </Button>
      </DialogActions>
    </Dialog>
  );
}
