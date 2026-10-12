import { FormProvider } from 'react-hook-form';

export function Form({ children, methods, onSubmit, ...other }) {
  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} {...other}>
        {children}
      </form>
    </FormProvider>
  );
}
