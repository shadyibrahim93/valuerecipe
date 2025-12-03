import '../styles/main.scss';
import Head from 'next/head';
import Layout from '../components/Layout';
import { MealPlannerProvider } from '../components/MealPlannerContext';
import { UserProvider } from '../components/UserContext';
import CookieBanner from '../components/CookieBanner.js';
import { ModalProvider } from '../components/ModalContext';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta
          name='viewport'
          content='width=device-width,initial-scale=1'
        />
      </Head>

      <MealPlannerProvider>
        <UserProvider>
          <ModalProvider>
            <Layout>
              <Component {...pageProps} />
              <CookieBanner />
            </Layout>
          </ModalProvider>
        </UserProvider>
      </MealPlannerProvider>
    </>
  );
}
