import { useCallback, useState } from 'react';

export function useBoolean(defaultValue = false) {
  const [value, setValue] = useState(defaultValue);

  const onTrue = useCallback(() => {
    setValue(true);
  }, []);

  const onFalse = useCallback(() => {
    setValue(false);
  }, []);

  const onToggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  const setTrue = onTrue;
  const setFalse = onFalse;

  return {
    value,
    onTrue,
    onFalse,
    onToggle,
    setTrue,
    setFalse,
    setValue,
  };
}
