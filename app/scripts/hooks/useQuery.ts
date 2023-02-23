import { useEffect, useRef, useState } from 'react';

interface QueryArgs<Data, DefaultData, LoadVariables extends unknown> {
  // The value of data when no data is loading or the query is skipped
  defaultData: DefaultData;

  // Function that will load the data
  load: (variables: LoadVariables) => Promise<Data>;

  // Stop loading and reset data to default
  enabled?: boolean;

  // Variables to pass to the load function
  variables: LoadVariables;
}

// Lightweight hook for asynchronous data loading, inspired by TanStack Query
export const useQuery = <Data, DefaultData, LoadVariables>({
  defaultData,
  enabled = true,
  load,
  variables,
}: QueryArgs<Data, DefaultData, LoadVariables>): {
  // The loaded data, which will be `defaultData` while it is being loaded
  data: Data | DefaultData;

  // Indicates whether the query is currently executing
  loading: boolean;

  // Reload the query
  refresh: () => void;
} => {
  const [data, setData] = useState<Data | DefaultData>(defaultData);
  const [loading, setLoading] = useState(false);
  const activeRequest = useRef<Promise<Data> | null>(null);

  const refresh = () => {
    if (enabled) {
      // To avoid getting confused if there are multiple requests in progress, track the most recent
      // request and ignore the response if a request comes back that isn't the most recent request.
      const currentRequest = load(variables);
      setLoading(true);
      activeRequest.current = currentRequest;
      currentRequest.then((data) => {
        if (activeRequest.current === currentRequest) {
          setData(data);
          setLoading(false);
        }
      });
    } else {
      // If skipping, don't load and keep the data default
      setData(defaultData);
      setLoading(false);
      activeRequest.current = null;
    }
  };

  // Execute the query initially, whenever enabled is turned on or off, and whenever the variables change
  useEffect(() => {
    refresh();
  }, [enabled, variables]);

  return {
    data,
    loading,
    refresh,
  };
};
