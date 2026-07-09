import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  IconBook,
  IconPlus,
  IconTrendingUp,
  IconBell,
  IconUsers,
} from '@tabler/icons-react'
import { useBookie } from '../contexts/BookieContext'
import { mockAchievements, mockNextAchievement } from '../data/mockData'
import { coverStyle } from '../utils/coverStyle'
import { achievementIcons, defaultAchievementIcon } from '../utils/achievementIcons'
import { ProgressSheet } from '../components/ProgressSheet'
import { InfoModal } from '../components/InfoModal'

const homeAchievementsPreview = mockAchievements.slice(0, 6)

function coverShadow(color) {
  return `0 6px 12px color-mix(in srgb, ${color} 22%, transparent)`
}

function HomePage() {
  const { books, currentUser } = useBookie()
  const readingBooks = books.filter((book) => book.status === 'Lendo agora')
  const wantToReadBooks = books.filter((book) => book.status === 'Quero ler').slice(0, 4)

  const totalPages = readingBooks.reduce((sum, book) => sum + (book.pagesRead || 0), 0)
  const totalBooks = books.filter((book) => book.status === 'Lendo agora' || book.status === 'Já li').length
  const notesCount = books.reduce((sum, book) => sum + (book.userNotes?.length || 0), 0)

  const trackRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const handleCarouselScroll = () => {
    const track = trackRef.current
    const firstCard = track?.firstElementChild
    if (!track || !firstCard) return
    const cardWidth = firstCard.getBoundingClientRect().width
    const gap = 14
    const index = Math.round(track.scrollLeft / (cardWidth + gap))
    setActiveIndex(index)
  }

  // permite arrastar com o mouse (desktop) além do toque nativo (celular/trackpad) —
  // só passa a "arrastar" depois de um movimento mínimo, pra não atrapalhar o clique nos cards
  const dragState = useRef({ active: false, moved: false, startX: 0, startScrollLeft: 0 })

  const handlePointerDown = (event) => {
    if (event.pointerType !== 'mouse' || !trackRef.current) return
    dragState.current = {
      active: true,
      moved: false,
      startX: event.clientX,
      startScrollLeft: trackRef.current.scrollLeft,
    }
  }

  const handlePointerMove = (event) => {
    if (!dragState.current.active || !trackRef.current) return
    const delta = event.clientX - dragState.current.startX
    if (Math.abs(delta) > 5) dragState.current.moved = true
    trackRef.current.scrollLeft = dragState.current.startScrollLeft - delta
  }

  const stopDragging = () => {
    dragState.current.active = false
  }

  // se o gesto foi um arraste de verdade, evita que ele também dispare o clique/navegação do card
  const handleCarouselClickCapture = (event) => {
    if (dragState.current.moved) {
      event.preventDefault()
      event.stopPropagation()
      dragState.current.moved = false
    }
  }

  const stepsToNextAchievement = Math.max(
    mockNextAchievement.goal - mockNextAchievement.progress,
    0,
  )

  // Bottom sheet: atualizar progresso
  const [progressBookId, setProgressBookId] = useState(null)
  const progressBook = books.find((book) => book.id === progressBookId) ?? null
  const openProgressSheet = (bookId) => setProgressBookId(bookId)
  const closeProgressSheet = () => setProgressBookId(null)

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  return (
    <section className="home-page">
      <header className="home-header">
        <h2>Oii, {currentUser.name} 👋</h2>
        <button
          type="button"
          className="notification-button"
          aria-label="Notificações"
          onClick={() => setIsNotificationsOpen(true)}
        >
          <IconBell size={22} />
          <span className="notification-dot" />
        </button>
      </header>

      {/* Seu ritmo está lindo — conteúdo original preservado, agora com o atalho de adicionar livro */}
      <section className="stats-card">
        <div className="stats-card__header">
          <div className="stats-card__icon">
            <IconTrendingUp size={18} />
          </div>
          <div>
            <p className="eyebrow">Este mês</p>
            <h3>Seu ritmo está lindo</h3>
          </div>
        </div>
        <div className="stats-grid stats-grid--triple">
          <div className="stat-item">
            <strong>{totalBooks}</strong>
            <span>livros</span>
          </div>
          <div className="stat-item">
            <strong>{totalPages}</strong>
            <span>páginas</span>
          </div>
          <div className="stat-item">
            <strong>{notesCount}</strong>
            <span>notas</span>
          </div>
        </div>
        <Link to="/buscar" className="primary-action add-book-button">
          <IconPlus size={18} />
          Adicionar livro
        </Link>
      </section>

      <section className="home-section">
        <div className="section-title">
          <h3>Lendo agora</h3>
        </div>

        {readingBooks.length > 0 ? (
          <>
            <div
              className="reading-carousel"
              ref={trackRef}
              onScroll={handleCarouselScroll}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={stopDragging}
              onPointerCancel={stopDragging}
              onPointerLeave={stopDragging}
              onClickCapture={handleCarouselClickCapture}
            >
              {readingBooks.map((book) => (
                <div
                  key={book.id}
                  className={`reading-card ${readingBooks.length === 1 ? 'reading-card--full' : ''}`}
                >
                  <div className="reading-card__link">
                    <Link
                      to={`/livro/${book.id}`}
                      className="reading-card__cover"
                      style={{ ...coverStyle(book), boxShadow: coverShadow(book.coverColor) }}
                    >
                      {!book.coverImage && <IconBook size={22} color="white" />}
                    </Link>
                    <div className="reading-card__content">
                      <h4>{book.title}</h4>
                      <p className="reading-card__author">{book.author}</p>
                      <div className="reading-card__progress-row">
                        <span className="reading-card__pages">
                          Pág. {book.pagesRead} de {book.totalPages}
                        </span>
                        <span className="reading-card__percent">{book.progress}%</span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${book.progress}%` }} />
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="reading-card__update-button"
                    onClick={() => openProgressSheet(book.id)}
                  >
                    <IconPlus size={12} />
                    Atualizar progresso
                  </button>
                </div>
              ))}
            </div>

            {readingBooks.length > 1 && (
              <div className="carousel-dots">
                {readingBooks.map((book, index) => (
                  <span
                    key={book.id}
                    className={`carousel-dot ${index === activeIndex ? 'is-active' : ''}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="empty-state">Nenhum livro em andamento agora.</p>
        )}

        <Link to="/comunidade" state={{ openComposer: true }} className="share-prompt">
          <span className="share-prompt__avatar">{currentUser.name.charAt(0)}</span>
          <span className="share-prompt__text">Quer compartilhar algo?</span>
          <span className="share-prompt__icon">
            <IconUsers size={18} />
          </span>
        </Link>
      </section>

      <section className="home-section">
        <div className="section-title">
          <h3>Quero ler</h3>
          <Link to="/estante?filtro=Quero ler">ver tudo</Link>
        </div>
        <div className="cover-row">
          {wantToReadBooks.map((book) => (
            <Link
              key={book.id}
              to={`/livro/${book.id}`}
              className="cover-tile"
              style={coverStyle(book)}
              aria-label={book.title}
            />
          ))}
          <Link to="/buscar" className="cover-tile cover-tile--add">
            <IconPlus size={18} />
            <span>livro</span>
          </Link>
        </div>
      </section>

      <section className="home-section">
        <div className="section-title">
          <h3>Suas conquistas</h3>
          <Link to="/conquistas">ver todas</Link>
        </div>
        <div className="badge-grid badge-row-scroll">
          {homeAchievementsPreview.map((achievement) => {
            const AchievementIcon = achievementIcons[achievement.icon] ?? defaultAchievementIcon
            return (
              <div
                key={achievement.id}
                className={`badge-item ${achievement.earned ? '' : 'is-locked'}`}
              >
                <div className="badge-item__icon">
                  <AchievementIcon size={20} />
                </div>
                <span>{achievement.label}</span>
              </div>
            )
          })}
        </div>

        <p className="achievement-banner">
          🔥 Quase lá! Faltam <strong>{stepsToNextAchievement}</strong> pra desbloquear "
          {mockNextAchievement.label}".
        </p>
      </section>

      {/* SHEET: atualizar progresso */}
      {progressBook && <ProgressSheet book={progressBook} onClose={closeProgressSheet} />}

      {isNotificationsOpen && (
        <InfoModal
          title="Notificações"
          message="Ainda não tem nada por aqui — quando tiver, sem pressa, você vê."
          onClose={() => setIsNotificationsOpen(false)}
        />
      )}
    </section>
  )
}

export default HomePage
