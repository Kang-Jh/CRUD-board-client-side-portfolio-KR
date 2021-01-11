import 'tailwindcss/tailwind.css';
import { useEffect, useState, Fragment } from 'react';
import { AppProps } from 'next/dist/next-server/lib/router/router';
import NextHead from 'next/head';
import ms from 'ms';
import Header from '../components/header';
import Container from '../components/container';
import { AccessTokenContext, CsrfContext, UserContext } from '../contexts';
import useCsrfToken from '../hooks/useCsrfToken';
import { AccessToken, User } from '../types/Data';
import { AccessTokenResponseBody } from '../types/ResponseBody';

const App = ({ Component, pageProps }: AppProps) => {
  const [accessToken, setAccessToken] = useState<AccessToken>('');
  const csrfToken = useCsrfToken(
    'https://api.simplecrudboard.click/browser/csrfToken'
  );
  const [user, setUser] = useState<Partial<User>>({
    _id: '',
    username: '',
  });

  // getAccessToken and getSignedInUser effect
  useEffect(() => {
    const getAccessToken = async () => {
      const response = await fetch(
        'https://api.simplecrudboard.click/browser/accessToken',
        {
          headers: {
            Accept: 'application/json',
          },
          mode: 'cors',
          credentials: 'include',
        }
      );

      if (response.status === 401) {
        const error = new Error('Refresh token is expired');
        (error as any).status = 401;
        throw error;
      }

      if (!response.ok) {
        const error = new Error('Internal Server Error');
        (error as any).status = 500;
        throw error;
      }

      if (response.ok) {
        const json: AccessTokenResponseBody = await response.json();
        const { accessToken } = json;

        setAccessToken(accessToken);
      }
    };

    const getSignedInUser = async () => {
      const response = await fetch(
        'https://api.simplecrudboard.click/browser/users/signedInUser',
        {
          headers: {
            Accept: 'application/json',
          },
          mode: 'cors',
          credentials: 'include',
        }
      );

      if (response.status === 401) {
        const error = new Error('Refresh token is expired');
        (error as any).status = 401;
        throw error;
      }

      if (!response.ok) {
        const error = new Error('Internal Server Error');
        (error as any).status = 500;
        throw error;
      }

      if (response.ok) {
        const json: User = await response.json();
        setUser(json);
      }
    };

    const getAccessTokenAndSignedInUser = async () => {
      try {
        await getAccessToken();
        await getSignedInUser();
      } catch (e) {
        console.error('Not Signed in');
      }
    };

    // if user signs in restart cycle
    if (user._id) {
      getAccessTokenAndSignedInUser();

      // 2.9h is intended to successfully renew the token
      const timeoutId = setInterval(getAccessTokenAndSignedInUser, ms('2.9h'));

      return () => {
        clearInterval(timeoutId);
      };
    }

    getAccessTokenAndSignedInUser();

    // 2.9h is intended to successfully renew the token
    const timeoutId = setInterval(getAccessTokenAndSignedInUser, ms('2.9h'));

    return () => {
      clearInterval(timeoutId);
    };
  }, [user._id]);

  return (
    <Fragment>
      <NextHead>
        {/* Only contains what must be common to all pages */}
        {/* it overrides _document's head */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>게시판 포트폴리오</title>
      </NextHead>

      <AccessTokenContext.Provider value={{ accessToken, setAccessToken }}>
        <CsrfContext.Provider value={csrfToken}>
          <UserContext.Provider value={{ user, setUser }}>
            <Header />

            <Container>
              <Component {...pageProps} />
            </Container>
          </UserContext.Provider>
        </CsrfContext.Provider>
      </AccessTokenContext.Provider>
    </Fragment>
  );
};

export default App;
