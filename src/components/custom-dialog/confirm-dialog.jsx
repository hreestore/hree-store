import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
} from "@mui/material";

export function ConfirmDialog({
  open,
  onClose,
  title,
  content,
  action,
  ...other
}) {
  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose} {...other}>
      <DialogTitle sx={{ pb: 2 }}>{title}</DialogTitle>

      {content && (
        <DialogContent sx={{ typography: "body2" }}>{content}</DialogContent>
      )}

      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Cancel
        </Button>
        {action}
      </DialogActions>
    </Dialog>
  );
}
