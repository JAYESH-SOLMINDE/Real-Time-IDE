import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SocketProvider } from './context/SocketContext';
import LandingPage from './pages/LandingPage';
import RoomPage from './pages/RoomPage';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#2a2a3c',
              color: '#fff',
              border: '1px solid #3a3a4c',
            },
          }}
        />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/room/:roomId" element={<RoomPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SocketProvider>
    </BrowserRouter>
  );
}

export default App;