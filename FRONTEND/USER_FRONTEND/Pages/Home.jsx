import { Appbar } from '../components/Appbar';
import { Hero } from '../components/Hero';
import { Upload } from '../components/Upload';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Appbar />
      <Hero />
      <Upload />
    </div>
  );
};

export default Home;