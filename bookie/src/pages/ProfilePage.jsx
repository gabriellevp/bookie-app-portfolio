import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconBell, IconBook, IconPlus, IconChevronRight } from '@tabler/icons-react'
import { useBookie } from '../contexts/BookieContext'
import { mockAchievements, mockNextAchievement } from '../data/mockData'
import { coverStyle } from '../utils/coverStyle'
import { achievementIcons, defaultAchievementIcon } from '../utils/achievementIcons'
import { InfoModal } from '../components/InfoModal'

const shelfTabs = [
  { label: 'Lendo', status: 'Lendo agora' },
  { label: 'Lidos', status: 'Já li' },
  { label: 'Quero ler', status: 'Quero ler' },
]

const achievementsPreview = mockAchievements.slice(0, 8)

function ProfilePage() {
  const { books, currentUser, communityUsers } = useBookie()

  const [activeShelf, setActiveShelf] = useState(shelfTabs[0].status)
  const [modalType, setModalType] = useState(null)

  const readCount = books.filter((book) => book.status === 'Já li').length
  const followingCount = communityUsers.filter((user) => user.following).length

  const pagesInMotion = books
    .filter((book) => book.status === 'Já li' || book.status === 'Lendo agora')
    .reduce((sum, book) => sum + (book.pagesRead || 0), 0)
  const hoursEstimate = Math.max(1, Math.round(pagesInMotion / 40))

  const allNotes = useMemo(
    () =>
      books
        .flatMap((book) =>
          (book.userNotes || []).map((note) => ({
            ...note,
            bookId: book.id,
            bookTitle: book.title,
          })),
        )
        .sort((a, b) => b.id - a.id),
    [books],
  )

  const recentNotes = allNotes.slice(0, 3)

  const shelfBooks = books.filter((book) => book.status === activeShelf)

  const closeModal = () => setModalType(null)

  return (
    <section className="profile-page">
      {/* TOPO: faixa colorida única com cabeçalho, avatar, nome, identidade e stats */}
      <section className="profile-hero">
        <header className="profile-header">
          <h2>Meu perfil</h2>
          <button
            type="button"
            className="notification-button"
            aria-label="Notificações"
            onClick={() => setModalType('notifications')}
          >
            <IconBell size={22} />
            <span className="notification-dot" />
          </button>
        </header>

        <div className="profile-hero__row">
          <div className="profile-avatar profile-avatar--square">{currentUser.name.charAt(0)}</div>
          <div className="profile-hero__info">
            <h3>{currentUser.name}</h3>
            <span className="identity-text">🔥 {currentUser.identity}</span>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-block">
            <strong>{readCount}</strong>
            <span>lidos</span>
          </div>
          <div className="stat-block">
            <strong>{followingCount}</strong>
            <span>seguindo</span>
          </div>
          <div className="stat-block">
            <strong>{currentUser.followers}</strong>
            <span>seguidoras</span>
          </div>
        </div>

        <button
          type="button"
          className="primary-action profile-edit-button"
          onClick={() => setModalType('editProfile')}
        >
          Editar perfil
        </button>
      </section>

      {/* ESTE ANO */}
      <section className="stats-card">
        <div className="stats-card__header">
          <div className="stats-card__icon">
            <IconBook size={18} />
          </div>
          <div>
            <p className="eyebrow">Este ano</p>
            <h3>Sua leitura em números</h3>
          </div>
        </div>
        <div className="stats-grid stats-grid--triple">
          <div className="stat-item">
            <strong>{readCount}</strong>
            <span>livros</span>
          </div>
          <div className="stat-item">
            <strong>{hoursEstimate}</strong>
            <span>horas</span>
          </div>
          <div className="stat-item">
            <strong>{allNotes.length}</strong>
            <span>notas</span>
          </div>
        </div>
      </section>

      {/* RETROSPECTIVA */}
      <button type="button" className="retrospective-banner" onClick={() => setModalType('retrospective')}>
        <div>
          <strong>Sua retrospectiva 2025</strong>
          <span>reviva seu ano de leituras ✨</span>
        </div>
        <IconChevronRight size={20} />
      </button>

      {/* CONQUISTAS */}
      <section className="home-section">
        <div className="section-title section-title--compact">
          <h3>Conquistas</h3>
          <Link to="/conquistas">ver todas</Link>
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

        <div className="next-achievement-card">
          <p className="rating-label">Próxima conquista</p>
          <h4>{mockNextAchievement.label}</h4>
          <p className="next-achievement-card__desc">{mockNextAchievement.description}</p>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${(mockNextAchievement.progress / mockNextAchievement.goal) * 100}%` }}
            />
          </div>
          <span className="progress-text">
            {mockNextAchievement.progress} de {mockNextAchievement.goal} — sem pressa, no seu ritmo
          </span>
        </div>
      </section>

      {/* ESTANTE */}
      <section className="home-section">
        <div className="section-title section-title--compact">
          <h3>Estante</h3>
          <Link to={`/estante?filtro=${encodeURIComponent(activeShelf)}`}>ver todos</Link>
        </div>
        <div className="tabs">
          {shelfTabs.map((tab) => (
            <button
              key={tab.status}
              type="button"
              className={`tab-button ${activeShelf === tab.status ? 'is-active' : ''}`}
              onClick={() => setActiveShelf(tab.status)}
            >
              {tab.label}
            </button>
          ))}
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
          <p className="empty-state">Nenhum livro por aqui ainda.</p>
        )}
      </section>

      {/* MINHAS NOTAS: preview das 3 últimas */}
      <section className="home-section">
        <div className="section-title section-title--compact">
          <h3>Notas e destaques</h3>
          <Link to="/notas">ver todas</Link>
        </div>

        <Link to="/notas" className="secondary-action">
          <IconPlus size={16} />
          Nova nota
        </Link>

        {recentNotes.length > 0 ? (
          <div className="notes-list">
            {recentNotes.map((note) => (
              <Link key={`${note.bookId}-${note.id}`} to="/notas" className="note-highlight-card">
                <div className="note-highlight-card__body">
                  <p className="note-highlight-card__text">{note.text}</p>
                  <div className="note-highlight-card__footer">
                    <span className="note-highlight-card__book">{note.bookTitle}</span>
                    {note.title && (
                      <span className="chip chip--genre note-highlight-card__tag">#{note.title}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="empty-state">Nenhuma nota guardada ainda. Que tal começar?</p>
        )}
      </section>

      {/* MODAL: EDITAR PERFIL */}
      {modalType === 'editProfile' && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-card__header">
              <h3>Editar perfil</h3>
              <button type="button" className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            <p>Em breve você poderá atualizar seu nome, avatar e identidade por aqui.</p>
            <button type="button" className="primary-action" onClick={closeModal}>
              Entendi
            </button>
          </div>
        </div>
      )}

      {modalType === 'retrospective' && (
        <InfoModal
          title="Sua retrospectiva 2025"
          message="Ainda estamos preparando esse resumo especial do seu ano de leituras. Volte em breve!"
          onClose={closeModal}
        />
      )}

      {modalType === 'notifications' && (
        <InfoModal
          title="Notificações"
          message="Ainda não tem nada por aqui — quando tiver, sem pressa, você vê."
          onClose={closeModal}
        />
      )}
    </section>
  )
}

export default ProfilePage
