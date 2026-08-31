import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Explore from './pages/Explore';
import AnimeDetails from './pages/AnimeDetails';
import Watchlist from './pages/Watchlist';
import { WatchlistProvider } from './context/WatchlistContext';
import Footer from './components/Footer';

export default function App() {
  return (
    <WatchlistProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-brand-dark text-slate-100">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/anime/:id" element={<AnimeDetails />} />
              <Route path="/watchlist" element={<Watchlist />} />
            </Routes>
          </main>
          <Footer/>
        </div>
      </Router>
    </WatchlistProvider>
  );
}