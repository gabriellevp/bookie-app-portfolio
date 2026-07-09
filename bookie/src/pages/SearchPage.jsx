import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { IconSearch, IconBook, IconPlus, IconStarFilled } from '@tabler/icons-react'
import { useBookie } from '../contexts/BookieContext'
import { coverStyle } from '../utils/coverStyle'
import { AddToShelfModal } from '../components/AddToShelfModal'

const tabs = ['Livros', 'Autor(a)', 'Pessoas']

function SearchPage() {
  const { books, communityUsers, authors, toggleFollow } = useBookie()
  const [searchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState(searchParams.get('aba') || 'Livros')
  const [selectedBook, setSelectedBook] = useState(null)

  // Buscar livros
  const filteredBooks = useMemo(() => {
    if (!searchQuery.trim()) return books
    const query = searchQuery.toLowerCase()
    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query)
    )
  }, [searchQuery, books])

  // Buscar autores
  const filteredAuthors = useMemo(() => {
    if (!searchQuery.trim()) return authors || []
    const query = searchQuery.toLowerCase()
    return (authors || []).filter((author) =>
      author.name.toLowerCase().includes(query)
    )
  }, [searchQuery, authors])

  // Buscar pessoas
  const filteredPeople = useMemo(() => {
    if (!searchQuery.trim()) return communityUsers
    const query = searchQuery.toLowerCase()
    return communityUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.bio.toLowerCase().includes(query)
    )
  }, [searchQuery, communityUsers])

  // Abrir modal para adicionar livro
  const openAddBookModal = (book) => setSelectedBook(book)
  const closeAddBookModal = () => setSelectedBook(null)

  // Ver os livros de uma autora (não temos página de autor — filtra a aba Livros por ela)
  const viewBooksByAuthor = (authorName) => {
    setSearchQuery(authorName)
    setActiveTab('Livros')
  }

  return (
    <section className="search-page">
      {/* CAMPO DE BUSCA */}
      <div className="search-box">
        <IconSearch size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Buscar por título, autor ou pessoa…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* ABAS */}
      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`tab-button ${activeTab === tab ? 'is-active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ABA LIVROS */}
      {activeTab === 'Livros' && (
        <div className="search-results">
          {filteredBooks.length > 0 ? (
            <div className="books-list">
              {filteredBooks.map((book) => (
                <div key={book.id} className="search-result-item search-book-item">
                  <Link
                    to={`/livro/${book.id}`}
                    className="book-cover-link"
                  >
                    <div className="search-cover" style={coverStyle(book)}>
                      {!book.coverImage && <IconBook size={24} color="white" />}
                    </div>
                  </Link>

                  <div className="book-info">
                    {book.series && (
                      <span className="series-tag">
                        {book.series.position} de {book.series.total} livros
                      </span>
                    )}
                    <Link to={`/livro/${book.id}`} className="book-title-link">
                      <h4>{book.title}</h4>
                    </Link>
                    <p className="book-author">{book.author}</p>
                    <p className="book-meta">
                      {book.year} · {book.reviews} leitores · {book.averageRating}{' '}
                      <IconStarFilled size={11} color="var(--sol)" className="book-meta__star" />
                    </p>
                  </div>

                  <button
                    type="button"
                    className="add-button"
                    onClick={() => openAddBookModal(book)}
                    aria-label="Adicionar à estante"
                  >
                    <IconPlus size={18} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">
              Nenhum livro encontrado. Tente outra busca.
            </p>
          )}
        </div>
      )}

      {/* ABA AUTOR(A) */}
      {activeTab === 'Autor(a)' && (
        <div className="search-results">
          {filteredAuthors.length > 0 ? (
            <div className="authors-list">
              {filteredAuthors.map((author) => (
                <button
                  key={author.id}
                  type="button"
                  className="search-result-item author-result-item"
                  onClick={() => viewBooksByAuthor(author.name)}
                >
                  <div className="author-avatar">
                    {author.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div className="author-info">
                    <h4>{author.name}</h4>
                    <p className="author-meta">
                      {author.booksCount} livros · {author.topGenre}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="empty-state">
              Nenhum autor encontrado. Tente outra busca.
            </p>
          )}
        </div>
      )}

      {/* ABA PESSOAS */}
      {activeTab === 'Pessoas' && (
        <div className="search-results">
          {filteredPeople.length > 0 ? (
            <div className="people-list">
              {filteredPeople.map((person) => (
                <div key={person.id} className="search-result-item search-person-item">
                  <Link
                    to={`/leitora/${person.id}`}
                    className="person-card-link"
                  >
                    <div className="person-avatar">{person.avatar}</div>
                    <div className="person-info">
                      <h4>{person.name}</h4>
                      <p className="person-bio">{person.bio}</p>
                      <div className="person-genres">
                        {person.favoriteGenres?.slice(0, 2).map((genre) => (
                          <span key={genre} className="genre-badge">
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>

                  <button
                    type="button"
                    className={`follow-button ${person.following ? 'is-following' : ''}`}
                    onClick={() => toggleFollow(person.id)}
                  >
                    {person.following ? 'Seguindo' : 'Seguir'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">
              Nenhuma pessoa encontrada. Tente outra busca.
            </p>
          )}
        </div>
      )}

      {/* MODAL: ADICIONAR LIVRO À ESTANTE */}
      {selectedBook && <AddToShelfModal book={selectedBook} onClose={closeAddBookModal} />}
    </section>
  )
}

export default SearchPage
