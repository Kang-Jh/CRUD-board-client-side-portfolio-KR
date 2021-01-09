import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);

    return initialProps;
  }

  render() {
    return (
      <Html lang="ko">
        {/* Head contains meta data about character set(utf-8) and viewport, but viewport should be overriden by app's head */}
        <Head>
          {/* quill snow css */}
          <link
            href="https://cdn.quilljs.com/1.3.7/quill.snow.css"
            rel="stylesheet"
            key="quillCss"
          />

          {/* <link rel="icon" sizes="192x192" href="/public/touch-icon.png" />
              <link rel="apple-touch-icon" href="/public/touch-icon.png" />
              <link rel="mask-icon" href="/public/favicon-mask.svg" color="#49B882" />
              <link rel="icon" href="/public/favicon.ico" />
          */}

          {/* --- facebook login scripts start --- */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
              window.fbAsyncInit = function () {
                window.FB.init({
                  appId: 'facebook_app_id',
                  autoLogAppEvents: true,
                  xfbml: true,
                  version: 'v9.0',
                });
              }
            `,
            }}
          />

          <script
            async
            defer
            crossOrigin="anonymous"
            src="https://connect.facebook.net/ko_KR/sdk.js"
          />
          {/* --- facebook login scripts end --- */}

          {/* --- google login tags start --- */}
          <meta name="google-signin-scope" content="email" />
          <meta name="google-signin-client_id" content="google_client_id" />
          <script src="https://apis.google.com/js/api:client.js" />

          {/* --- google login tags end --- */}
        </Head>

        <body>
          <Main />
          <div id="modal-root"></div>
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
