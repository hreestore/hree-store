export function localStorageAvailable() {
  try {
    const key = "__some_random_key_you_are_not_going_to_use__";

    window.localStorage.setItem(key, key);
    window.localStorage.removeItem(key);

    return true;
  } catch (error) {
    return false;
  }
}

export function localStorageGetItem(key, defaultValue = "") {
  const storageAvailable = localStorageAvailable();

  if (!storageAvailable) {
    return defaultValue;
  }

  try {
    const value = JSON.parse(localStorage.getItem(key));

    return value;
  } catch (error) {
    return defaultValue;
  }
}
