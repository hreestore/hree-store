import { useCallback, useState } from 'react';

export function useSetState(initialState) {
  const [state, set] = useState(initialState);

  const setState = useCallback((updateValue) => {
    if (typeof updateValue === 'function') {
      set((prevValue) => ({ ...prevValue, ...updateValue(prevValue) }));
    } else {
      set((prevValue) => ({ ...prevValue, ...updateValue }));
    }
  }, []);

  const setField = useCallback((name, updateValue) => {
    if (typeof updateValue === 'function') {
      set((prevValue) => ({ ...prevValue, [name]: updateValue(prevValue[name]) }));
    } else {
      set((prevValue) => ({ ...prevValue, [name]: updateValue }));
    }
  }, []);

  const reset = useCallback(() => {
    set(initialState);
  }, [initialState]);

  return {
    state,
    setState,
    setField,
    reset,
  };
}
