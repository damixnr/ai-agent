export async function readState<T>(key: string, fallback: T): Promise<T> {
  try {
    const value = await window.openai?.app?.storage?.getItem?.(key);
    if (value !== undefined) {
      return value as T;
    }
  } catch (error) {
    console.warn("StyleWeaver failed to read state from host storage", error);
  }

  const local = localStorage.getItem(key);
  if (local) {
    try {
      return JSON.parse(local) as T;
    } catch (error) {
      console.warn("StyleWeaver failed to parse local storage value", error);
    }
  }

  return fallback;
}

export async function writeState<T>(key: string, value: T) {
  try {
    await window.openai?.app?.storage?.setItem?.(key, value);
  } catch (error) {
    console.warn("StyleWeaver failed to persist state to host storage", error);
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("StyleWeaver failed to write local storage value", error);
  }
}
