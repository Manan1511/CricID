
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SignupPlayer from './pages/SignupPlayer';
import PlayerProfile from './pages/PlayerProfile';
import Stats from './pages/Stats';
import RecentMatches from './pages/RecentMatches';
import MatchScorecard from './pages/MatchScorecard';
import Watchlist from './pages/Watchlist';
import About from './pages/About';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="signup-player" element={<SignupPlayer />} />
          <Route path="player/:id" element={<PlayerProfile />} />
          <Route path="stats" element={<Stats />} />
          <Route path="matches" element={<RecentMatches />} />
          <Route path="match/:id" element={<MatchScorecard />} />
          <Route path="watchlist" element={<Watchlist />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
