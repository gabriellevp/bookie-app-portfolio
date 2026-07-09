import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { IconArrowLeft, IconSearch } from '@tabler/icons-react'
import { useBookie } from '../contexts/BookieContext'
import { coverStyle } from '../utils/coverStyle'

const shelfTabs = [
  { label: 'Lidos', status: 'Já li' },
  { label: 'Lendo', status: 'Lendo agora' },
  { label: 'Quero ler', status: 'Quero ler' },
]

function ShelfPage() {
  const { books } = useBookie()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialStatus = searchParams.get('filtro') || shelfTabs[0].status
  const [activeShelf, setActiveShelf] = useState(initialStatus)
  const [query, setQuery] = useState('')

  const shelfBooks = useMemo(() => {
    const inShelf = books.filter((book) => book.status === activeShelf)
    if (!query.trim()) return inShelf
    const search = query.toLowerCase()
    return inShelf.filter(
      (book) =>
        book.title.toLowerCase().includes(search) || book.author.toLowerCase().includes(search),
    )
  }, [books, activeShelf, query])

  return (
    <section className="profile-page">
      <div className="detail-header">
        <button type="button" className="back-link" onClick={() => navigate(-1)}>
          <IconArrowLeft size={18} />
          Voltar
        </button>
      </div>

      <header className="profile-header">
        <h2>Estante</h2>
      </header>

      <div className="search-box">
        <IconSearch size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Buscar na sua estante…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="shelf-filter-row">
        {shelfTabs.map((tab) => {
          const count = books.filter((book) => book.status === tab.status).length
          return (
            <button
              key={tab.status}
              type="button"
              className={`shelf-filter-pill ${activeShelf === tab.status ? 'is-selected' : ''}`}
              onClick={() => setActiveShelf(tab.status)}
            >
              {tab.label} · {count}
            </button>
          )
        })}
      </div>

      {shelfBooks.length > 0 ? (
        <div className="series-grid">
          {shelfBooks.map((book) => (
            <Link key={book.id} to={`/livro/${book.id}`} className="series-card">
              <div className="series-cover" style={coverStyle(book)} />
              <p className="series-title">{book.title}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="empty-state">Nenhum livro encontrado por aqui.</p>
      )}
    </section>
  )
}

export default ShelfPage
