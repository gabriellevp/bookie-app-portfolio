import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  IconArrowLeft,
  IconBook,
  IconCheck,
  IconDotsVertical,
  IconEyeOff,
  IconStarFilled,
  IconUserPlus,
} from '@tabler/icons-react'
import { useBookie } from '../contexts/BookieContext'
import { mockAchievements, mockFeedPosts } from '../data/mockData'
import { coverStyle } from '../utils/coverStyle'
import { achievementIcons, defaultAchievementIcon } from '../utils/achievementIcons'
import { InfoModal } from '../components/InfoModal'

const shelfTabs = [
  { label: 'Lidos', status: 'Já li' },
  { label: 'Lendo', status: 'Lendo agora' },
  { label: 'Quero ler', status: 'Quero ler' },
]

const achievementsPreview = mockAchievements.slice(0, 8)

function ReaderProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { communityUsers, toggleFollow, books } = useBookie()
  const [activeShelf, setActiveShelf] = useState(shelfTabs[0].status)
  const [revealedSpoilers, setRevealedSpoilers] = useState({})
  const [modalType, setModalType] = useState(null)

  const person = useMemo(
    () => communityUsers.find((user) => user.id === Number(id)),
    [communityUsers, id],
  )

  if (!person) {
    return (
      <section className="placeholder-page">
        <h2>Leitora não encontrada</h2>
        <p>Volte e escolha outro perfil.</p>
      </section>
    )
  }

  const shelf = person.shelf || []
  const readCount = shelf.filter((item) => item.status === 'Já li').length

  const shelfBooksForTab = shelf
    .filter((item) => item.status === activeShelf)
    .map((item) => books.find((book) => book.id === item.bookId))
    .filter(Boolean)
  const visibleShelfBooks = shelfBooksForTab.slice(0, 4)
  const overflowCount = shelfBooksForTab.length - visibleShelfBooks.length

  const reactions = mockFeedPosts.filter((post) => post.authorName === person.name)

  const getBook = (bookId) => books.find((book) => book.id === bookId)

  const toggleSpoiler = (postId) => {
    setRevealedSpoilers((prev) => ({ ...prev, [postId]: !prev[postId] }))
  }

  const closeModal = () => setModalType(null)

  return (
    <section className="profile-page">
      <div className="detail-header">
        <button type="button" className="back-link" onClick={() => navigate(-1)}>
          <IconArrowLeft size={18} />
          Voltar
        </button>
        <button
          type="button"
          className="icon-button"
          aria-label="Mais opções"
          onClick={() => setModalType('moreOptions')}
        >
          <IconDotsVertical size={20} />
        </button>
      </div>

      {/* TOPO: avatar, nome, identidade, stats, seguir */}
      <section className="profile-top">
        <div className="profile-avatar">{person.avatar}</div>
        <h3>{person.name}</h3>
        {person.identity && <span className="identity-text">🏆 {person.identity}</span>}

        <div className="profile-stats">
          <div className="stat-block">
            <strong>{readCount}</strong>
            <span>lidos</span>
          </div>
          <div className="stat-block">
            <strong>{person.followingCount ?? 0}</strong>
            <span>seguindo</span>
          </div>
          <div className="stat-block">
            <strong>{person.followers ?? 0}</strong>
            <span>seguidoras</span>
          </div>
        </div>

        <button
          type="button"
          className={`reader-follow-button ${person.following ? 'secondary-action' : 'primary-action'}`}
          onClick={() => toggleFollow(person.id)}
        >
          {person.following ? <IconCheck size={18} /> : <IconUserPlus size={18} />}
          {person.following ? 'Seguindo' : 'Seguir'}
        </button>
      </section>

      {/* ESTANTE PÚBLICA */}
      <section className="home-section">
        <div className="section-title section-title--compact">
          <h3>Estante</h3>
        </div>
        <div className="shelf-filter-row">
          {shelfTabs.map((tab) => {
            const count = shelf.filter((item) => item.status === tab.status).length
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

        {shelfBooksForTab.length > 0 ? (
          <div className="series-grid">
            {visibleShelfBooks.map((book) => (
              <Link key={book.id} to={`/livro/${book.id}`} className="series-card">
                <div className="series-cover" style={coverStyle(book)} />
                <p className="series-title">{book.title}</p>
              </Link>
            ))}
            {overflowCount > 0 && (
              <div className="series-card series-card--overflow">
                <div className="series-cover series-cover--overflow">
                  <span>+{overflowCount}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="empty-state">Nada por aqui nesta prateleira.</p>
        )}
      </section>

      {/* CONQUISTAS */}
      <section className="home-section">
        <div className="section-title section-title--compact">
          <h3>Conquistas</h3>
        </div>
        <div className="badge-grid">
          {achievementsPreview.map((achievement) => {
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
      </section>

      {/* REAÇÕES PÚBLICAS */}
      <section className="home-section">
        <div className="section-title section-title--compact">
          <h3>Reações públicas</h3>
        </div>
        <div className="community-list community-list--flat">
          {reactions.length > 0 ? (
            reactions.map((post) => {
              const book = getBook(post.bookId)
              const isSpoilerRevealed = !!revealedSpoilers[post.id]
              return (
                <div key={post.id} className="community-item community-item--flat">
                  {book && (
                    <Link to={`/livro/${book.id}`} className="feed-post__book">
                      <div className="feed-post__cover" style={coverStyle(book)}>
                        {!book.coverImage && <IconBook size={16} color="white" />}
                      </div>
                      <div className="feed-post__book-info">
                        <h4>{book.title}</h4>
                        <div className="stars">
                          {Array.from({ length: post.stars }).map((_, index) => (
                            <IconStarFilled key={index} size={12} color="var(--sol)" />
                          ))}
                        </div>
                      </div>
                    </Link>
                  )}
                  {post.spoiler && !isSpoilerRevealed ? (
                    <button
                      type="button"
                      className="spoiler-box spoiler-box--button"
                      onClick={() => toggleSpoiler(post.id)}
                    >
                      <IconEyeOff size={16} />
                      <span>Contém spoiler — toque pra ver</span>
                    </button>
                  ) : (
                    <p className="community-text">{post.text}</p>
                  )}
                </div>
              )
            })
          ) : (
            <p className="empty-state">Nenhuma reação pública ainda.</p>
          )}
        </div>
      </section>

      <p className="reader-footer">Você vê só o que {person.name} torna público.</p>

      {modalType === 'moreOptions' && (
        <InfoModal
          title="Mais opções"
          message="Em breve você poderá denunciar, bloquear ou silenciar por aqui."
          onClose={closeModal}
        />
      )}
    </section>
  )
}

export default ReaderProfilePage
