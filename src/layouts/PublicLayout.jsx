import { Outlet } from 'react-router-dom';
import PublicHeader from '../components/layout/PublicHeader';
import Footer from '../components/layout/Footer';

export default function PublicLayout() {
  return (
    <div className="public">
      <PublicHeader />
      <main id="main"><Outlet /></main>
      <Footer />
    </div>
  );
}
