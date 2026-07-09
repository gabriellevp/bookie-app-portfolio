import { Routes, Route } from 'react-router-dom'
import './App.css'
import { BottomNav } from './components/BottomNav'
import HomePage from './pages/HomePage'
import BookDetailPage from './pages/BookDetailPage'
import SearchPage from './pages/SearchPage'
import CommunityPage from './pages/CommunityPage'
import ProfilePage from './pages/ProfilePage'
import ReaderProfilePage from './pages/ReaderProfilePage'
import ShelfPage from './pages/ShelfPage'
import AchievementsPage from './pages/AchievementsPage'
import NotesPage from './pages/NotesPage'

function App() {
  return (
    <div className="phone-shell">
      <main className="app-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/livro/:id" element={<BookDetailPage />} />
          <Route path="/buscar" element={<SearchPage />} />
          <Route path="/leitora/:id" element={<ReaderProfilePage />} />
          <Route path="/comunidade" element={<CommunityPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/estante" element={<ShelfPage />} />
          <Route path="/conquistas" element={<AchievementsPage />} />
          <Route path="/notas" element={<NotesPage />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}

export default App
