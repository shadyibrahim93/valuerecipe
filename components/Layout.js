import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className='vr-app'>
      <Header />
      <main
        className='container vr-main'
        role='main'
      >
        <div className='vr-content'>{children}</div>
      </main>
      <Footer />
    </div>
  );
}
