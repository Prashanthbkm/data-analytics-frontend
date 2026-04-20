import { useState, useCallback } from 'react';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // ✅ Generic API caller
  const fetchData = useCallback(async (apiCall, params = []) => {
    if (!apiCall) {
      console.error('API function not provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await apiCall(...params);
      setData(result);
      return result;
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Something went wrong';

      setError(errorMsg);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Reset state (VERY USEFUL)
  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  return {
    loading,
    error,
    data,
    fetchData,
    setData,
    reset,
  };
};