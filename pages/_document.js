import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang='en'>
        <Head>
          <link
            rel='preconnect'
            href='https://fonts.googleapis.com'
          />
          <link
            href='https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap'
            rel='stylesheet'
          />
          <meta
            name='theme-color'
            content='#FF6B6B'
          />

          {/* 👇 GOOGLE ADSENSE VERIFICATION SCRIPT */}
          <script
            async
            src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4846660348676156'
            crossOrigin='anonymous'
          ></script>

          {/* 1. Privacy & Consent Scripts (Must load first) */}
          <script
            src='https://cmp.gatekeeperconsent.com/min.js'
            data-cfasync='false'
          ></script>
          <script
            src='https://the.gatekeeperconsent.com/cmp.min.js'
            data-cfasync='false'
          ></script>

          {/* 2. Ezoic Standalone Script */}
          <script
            async
            src='//www.ezojs.com/ezoic/sa.min.js'
          ></script>

          {/* 3. Initialize Ezoic Command Queue */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.ezstandalone = window.ezstandalone || {};
                ezstandalone.cmd = ezstandalone.cmd || [];
              `
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
