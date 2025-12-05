import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang='en'>
        <Head>
          {/* Keep Fonts and Static Assets here */}
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
