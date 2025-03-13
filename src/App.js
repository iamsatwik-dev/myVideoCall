
import { Route, BrowserRouter, Routes } from "react-router-dom";
import LandingPage from './pages/LandingPage';
import Authentication from './pages/Authentication';
import { AuthProvider } from './contexts/AuthContext'; 
import VideoMeetComponent from './pages/VideoMeet';
import History from './pages/history';

import HomeComponent from './pages/home'; 
function App() {
  return ( 
    <BrowserRouter>  {/* ✅ Move BrowserRouter to the top */}
      <AuthProvider> {/* ✅ Wrap AuthProvider inside BrowserRouter */}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Authentication />} />
          <Route path="/:url" element={<VideoMeetComponent />} />
          <Route path='/home's element={<HomeComponent />} />
          <Route path='/history' element={<History />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
