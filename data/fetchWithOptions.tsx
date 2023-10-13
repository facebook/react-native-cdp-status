// returns a fetch-compatible function with prepopulated parameter defaults that get shallowly merged into the caller-provided options
export function fetchWithOptions(defaultOptions: RequestInit) {
  return (url: string, options?: RequestInit) => {
    return fetch(url, {
      ...defaultOptions,
      ...options,
    });
  };
}
