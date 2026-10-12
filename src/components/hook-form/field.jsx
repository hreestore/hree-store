import { useFormContext, Controller } from 'react-hook-form';
import { TextField, Select, FormControl, InputLabel, FormHelperText } from '@mui/material';

function RHFTextField({ name, helperText, type, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          fullWidth
          type={type}
          value={field.value ?? ''}
          onChange={(event) => {
            field.onChange(event.target.value);
          }}
          error={!!error}
          helperText={error ? error.message : helperText}
          {...other}
        />
      )}
    />
  );
}

function RHFSelect({ name, label, helperText, children, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl fullWidth error={!!error} {...other}>
          {label && <InputLabel>{label}</InputLabel>}
          <Select {...field} value={field.value ?? ''} label={label}>
            {children}
          </Select>
          {(error || helperText) && (
            <FormHelperText>{error ? error.message : helperText}</FormHelperText>
          )}
        </FormControl>
      )}
    />
  );
}

export const Field = {
  Text: RHFTextField,
  Select: RHFSelect,
};
