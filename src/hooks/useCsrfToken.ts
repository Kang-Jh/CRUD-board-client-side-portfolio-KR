import { useState, useEffect } from 'react';
import ms from 'ms';

const useCsrfToken = (url: string) => {
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;
    async function getCsrf() {
      try {
        const response = await fetch(url, {
          headers: {
            Accept: 'application/json',
          },
          mode: 'cors',
          credentials: 'include',
          signal,
        });

        if (response.ok) {
          const json = await response.json();
          const { csrfToken } = json;
          setCsrfToken(csrfToken);
        } else {
          throw new Error('Getting csrf token failed');
        }
      } catch (e) {
        console.error(e);
      }
    }

    getCsrf();
    const timeoutId = setInterval(getCsrf, ms('1h'));

    return () => {
      abortController.abort();
      clearInterval(timeoutId);
    };
  }, [url]);

  return csrfToken;
};

export default useCsrfToken;
