import Navbar from '../components/Navbar';
import './globals.css';

export const metadata = {
  title: 'Digital Footprint Tracker',
  description: 'AI-Powered Digital Footprint Tracker',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 min-h-screen text-white">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
