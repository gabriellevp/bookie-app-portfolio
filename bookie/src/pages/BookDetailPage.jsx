import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  IconArrowLeft,
  IconBook,
  IconBook2,
  IconNotes,
  IconStarFilled,
  IconStar,
  IconEyeOff,
  IconShare2,
  IconDots,
  IconAlertCircle,
  IconMessageCircle2,
  IconRepeat,
  IconBookmark,
  IconHeart,
  IconLock,
  IconWorld,
  IconPlus,
  IconChevronDown,
} from '@tabler/icons-react'
import { useBookie } from '../contexts/BookieContext'
import { coverStyle } from '../utils/coverStyle'
import { ProgressSheet } from '../components/ProgressSheet'
import { AddToShelfModal } from '../components/AddToShelfModal'
import { InfoModal } from '../components/InfoModal'

const contentTabs = ['Notas', 'Reações']
const avatarPalette = ['var(--roxo)', 'var(--coral)', 'var(--menta)', 'var(--sol)', 'var(--verde)']

function BookDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { books, communityUsers, addNote, updateBook } = useBookie()
  const [activeTab, setActiveTab] = useState('Notas')
  const [modalType, setModalType] = useState(null)
  const [expandedSynopsis, setExpandedSynopsis] = useState(false)
  const [warningsExpanded, setWarningsExpanded] = useState(false)
  const [revealedWarnings, setRevealedWarnings] = useState({})
  const [userStarRating, setUserStarRating] = useState(0)
  const [noteText, setNoteText] = useState('')
  const [noteBookId, setNoteBookId] = useState(null)
  const [noteTag, setNoteTag] = useState('')
  const [reviewText, setReviewText] = useState('')
  const [abandonReason, setAbandonReason] = useState('')
  const [likedReactions, setLikedReactions] = useState({})
  const [savedReactions, setSavedReactions] = useState({})

  const book = useMemo(() => books.find((item) => item.id === Number(id)), [books, id])

  const seriesBooks = useMemo(() => {
    if (!book?.series) return []
    return books
      .filter((item) => item.series?.name === book.series.name)
      .sort((a, b) => a.series.position - b.series.position)
  }, [books, book])

  const friendsReadCount = useMemo(() => {
    if (!book) return 0
    return communityUsers.filter((user) => user.shelf?.some((item) => item.bookId === book.id)).length
  }, [communityUsers, book])

  if (!book) {
    return (
      <section className="placeholder-page">
        <h2>Livro não encontrado</h2>
        <p>Volte para a home e escolha outro título.</p>
      </section>
    )
  }

  const isNotAdded = book.status === 'Não adicionado'
  const isWantToRead = book.status === 'Quero ler'
  const isReading = book.status === 'Lendo agora'
  const isFinished = book.status === 'Já li'
  const isAbandoned = book.status === 'Abandonei'

  const openModal = (type) => {
    if (type === 'note') {
      setNoteText('')
      setNoteTag('')
      setNoteBookId(book.id)
    }
    setModalType(type)
  }
  const closeModal = () => setModalType(null)

  const toggleWarningReveal = (index) => {
    setRevealedWarnings((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  const handleStartReading = () => updateBook(book.id, { status: 'Lendo agora' })

  const handleSaveNote = () => {
    if (!noteText.trim()) return
    addNote(noteBookId ?? book.id, { title: noteTag.trim() || 'Nota', text: noteText.trim() })
    setNoteText('')
    setNoteTag('')
    closeModal()
  }

  const handleSaveReview = () => {
    if (!reviewText.trim()) return
    addNote(book.id, { title: 'Resenha', text: reviewText.trim() })
    setReviewText('')
  }

  const handleSaveAbandonReason = () => {
    if (!abandonReason.trim()) return
    addNote(book.id, { title: 'Motivo do abandono', text: abandonReason.trim() })
    setAbandonReason('')
  }

  const toggleReactionLike = (idx) => setLikedReactions((prev) => ({ ...prev, [idx]: !prev[idx] }))
  const toggleReactionSave = (idx) => setSavedReactions((prev) => ({ ...prev, [idx]: !prev[idx] }))

  const getReactionAuthorId = (name) => communityUsers.find((user) => user.name === name)?.id

  return (
    <section className="detail-page">
      {/* 1. CABEÇALHO: botão voltar + status + ícones de compartilhar e menu */}
      <div className="detail-header">
        <button type="button" className="back-link" onClick={() => navigate(-1)}>
          <IconArrowLeft size={18} />
          Voltar
        </button>
        <div className="header-actions">
          {!isNotAdded && (
            <button type="button" className="status-pill status-pill--button" onClick={() => openModal('status')}>
              {book.status}
            </button>
          )}
          <button type="button" className="icon-button" aria-label="Compartilhar" onClick={() => openModal('share')}>
            <IconShare2 size={18} />
          </button>
          <button type="button" className="icon-button" aria-label="Mais ações" onClick={() => openModal('more')}>
            <IconDots size={18} />
          </button>
        </div>
      </div>

      {/* 2. TOPO DO LIVRO: série (se houver), capa, título, autor, ano · páginas, avaliação */}
      {book.series && <p className="series-badge">Série · {book.series.name}</p>}

      <div className="book-hero">
        <div className="book-hero__top">
          <div className="book-hero__cover book-hero__cover--shadow" style={coverStyle(book)}>
            {!book.coverImage && <p className="cover-title">{book.title}</p>}
          </div>
          <div className="book-hero__content">
            <h2>{book.title}</h2>
            <p className="author">por {book.author}</p>
            <p className="book-meta">
              {book.year} · {book.totalPages} páginas
            </p>
            <div className="rating-badge">
              <strong className="rating-number">{book.averageRating}</strong>
              <div className="stars" aria-label={`Avaliação ${book.averageRating}`}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <IconStarFilled key={index} size={14} color="var(--sol)" />
                ))}
              </div>
              <span className="rating-text">{book.reviews} leitoras</span>
            </div>
          </div>
        </div>

        {/* Gênero/Humor — dentro do mesmo card, separado por divisória */}
        {(book.genres?.length > 0 || book.moods?.length > 0) && (
          <>
            <div className="book-hero__divider" />
            <div className="book-hero__section">
              <p className="book-hero__section-title">Gênero/Humor</p>
              <div className="chips-row">
                {book.genres?.map((genre) => (
                  <span key={genre} className="chip chip--genre">
                    {genre}
                  </span>
                ))}
                {book.moods?.map((mood) => (
                  <span key={mood} className="chip chip--mood">
                    {mood}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Avisos de conteúdo — dentro do mesmo card, separado por divisória */}
        {book.contentWarnings && book.contentWarnings.length > 0 && (
          <>
            <div className="book-hero__divider" />
            <div className="book-hero__section">
              <div className="warnings-header">
                <IconAlertCircle size={16} />
                <p className="warnings-label">Aviso de conteúdo</p>
                <button
                  type="button"
                  className="warnings-toggle"
                  onClick={() => setWarningsExpanded((value) => !value)}
                >
                  {warningsExpanded ? 'ocultar' : 'revelar'}
                </button>
              </div>
              {!warningsExpanded ? (
                <p className="warnings-summary">
                  Este livro contém {book.contentWarnings.length} avisos de conteúdo sensível.
                </p>
              ) : (
                <div className="chips-row">
                  {book.contentWarnings.map((warning, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`chip chip--warning ${revealedWarnings[index] ? 'is-revealed' : ''}`}
                      onClick={() => toggleWarningReveal(index)}
                    >
                      {revealedWarnings[index] ? warning : 'Revelar'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* 3. AÇÃO CONTEXTUAL POR STATUS */}
      {isNotAdded ? (
        <button type="button" className="primary-action" onClick={() => openModal('status')}>
          <IconPlus size={18} />
          Adicionar à estante
        </button>
      ) : null}

      {isWantToRead ? (
        <div className="stack-card">
          <h3>Na sua lista</h3>
          <p className="want-to-read-hint">Quando começar a ler, atualize seu progresso por aqui.</p>
          <button type="button" className="primary-action" onClick={handleStartReading}>
            <IconBook2 size={16} />
            Comecei a ler
          </button>
        </div>
      ) : null}

      {isReading ? (
        <div className="stack-card stack-card--reading">
          <div className="progress-section">
            <div className="progress-header">
              <span className="status-pill">Lendo</span>
              <span className="progress-pages-text">
                pág. {book.pagesRead} de {book.totalPages}
              </span>
            </div>
            <div className="progress-label-row">
              <span>Progresso</span>
              <span className="progress-percent">{book.progress}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${book.progress}%` }} />
            </div>
          </div>

          <div className="reading-actions">
            <button type="button" className="primary-action" onClick={() => openModal('progress')}>
              Atualizar progresso
            </button>
            <button type="button" className="secondary-action" onClick={() => openModal('note')}>
              <IconNotes size={14} />
              Adicionar nota
            </button>
          </div>
        </div>
      ) : isFinished ? (
        <div className="stack-card">
          <div className="user-rating">
            <p className="rating-label">Sua avaliação</p>
            <div className="stars stars--interactive">
              {Array.from({ length: 5 }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className="star-button"
                  onClick={() => setUserStarRating(index + 1)}
                  aria-label={`Avaliação ${index + 1} estrelas`}
                >
                  {index < userStarRating ? (
                    <IconStarFilled size={18} color="var(--sol)" />
                  ) : (
                    <IconStar size={18} color="var(--texto-2)" />
                  )}
                </button>
              ))}
            </div>
          </div>
          <textarea
            className="text-area"
            placeholder="Escreva uma resenha curta (opcional)..."
            value={reviewText}
            onChange={(event) => setReviewText(event.target.value)}
          />
          <button type="button" className="secondary-action" onClick={handleSaveReview} disabled={!reviewText.trim()}>
            <IconNotes size={14} />
            Salvar resenha
          </button>
        </div>
      ) : null}

      {isAbandoned ? (
        <div className="stack-card">
          <h3>Por que abandonou?</h3>
          <textarea
            className="text-area"
            placeholder="Conte o motivo de forma leve..."
            value={abandonReason}
            onChange={(event) => setAbandonReason(event.target.value)}
          />
          <button type="button" className="secondary-action" onClick={handleSaveAbandonReason} disabled={!abandonReason.trim()}>
            Salvar motivo
          </button>
        </div>
      ) : null}

      {/* 4. SINOPSE com "ler mais" */}
      <section className="stack-card">
        <h3>Sinopse</h3>
        <p className={`synopsis ${expandedSynopsis ? 'is-expanded' : ''}`}>
          {book.synopsis}
        </p>
        <button
          type="button"
          className="read-more"
          onClick={() => setExpandedSynopsis((value) => !value)}
        >
          {expandedSynopsis ? 'Recolher' : 'Ler mais'}
        </button>
      </section>

      {/* 5. SÉRIE (se houver) */}
      {book.series && seriesBooks.length > 0 && (
        <section className="stack-card">
          <h3>
            Série · <span style={{ fontWeight: 400 }}>{book.series.name}</span>
          </h3>
          <div className="series-grid">
            {seriesBooks.map((seriesBook) => (
              <Link key={seriesBook.id} to={`/livro/${seriesBook.id}`} className="series-card">
                <div className="series-cover" style={coverStyle(seriesBook)}>
                  <span className="series-badge-num">#{seriesBook.series.position}</span>
                </div>
                <p className="series-title">{seriesBook.title}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 6. SEU CONTEÚDO: Notas e Reações (só enquanto "Lendo agora") */}
      {isReading && (
        <section className="stack-card">
          <div className="content-section-header">
            <div className="content-section-header__icon">
              <IconLock size={16} />
            </div>
            <div>
              <h3>Seu conteúdo</h3>
              <p className="content-section-header__subtitle">Visível só para você</p>
            </div>
          </div>
          <div className="tabs">
            {contentTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`tab-button ${activeTab === tab ? 'is-active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'Notas'
                  ? `Notas (${book.userNotes?.length || 0})`
                  : `Minhas reações (${book.userReactions?.length || 0})`}
              </button>
            ))}
          </div>

          {activeTab === 'Notas' ? (
            <>
              <button type="button" className="add-note-button" onClick={() => openModal('note')}>
                <IconPlus size={16} />
                Nova nota sobre este livro
              </button>
              {book.userNotes && book.userNotes.length > 0 ? (
                <div className="content-list">
                  {book.userNotes.map((note) => (
                    <div key={note.id} className="content-item">
                      <h4>{note.title}</h4>
                      <p>{note.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-illustration">
                  <div className="empty-illustration__icon">
                    <IconNotes size={26} />
                  </div>
                  <h4>Nenhuma nota ainda</h4>
                  <p>Suas anotações privadas ficarão aqui</p>
                </div>
              )}
            </>
          ) : book.userReactions && book.userReactions.length > 0 ? (
            <div className="content-list">
              {book.userReactions.map((reaction, idx) => (
                <div key={idx} className="content-item">
                  <div className="reaction-header">
                    <span className="reaction-name">Sua reação</span>
                    <div className="stars">
                      {Array.from({ length: reaction.stars }).map((_, index) => (
                        <IconStarFilled key={index} size={14} color="var(--sol)" />
                      ))}
                    </div>
                  </div>
                  {reaction.spoiler ? (
                    <div className="spoiler-box">
                      <IconEyeOff size={16} />
                      <span>Comentário escondido por spoiler</span>
                    </div>
                  ) : (
                    <p>{reaction.text}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-illustration">
              <div className="empty-illustration__icon">
                <IconMessageCircle2 size={26} />
              </div>
              <h4>Nenhuma reação ainda</h4>
              <p>Suas reações públicas aparecerão aqui</p>
            </div>
          )}
        </section>
      )}

      {/* 7. A COMUNIDADE ACHOU */}
      {book.communityReactions && book.communityReactions.length > 0 && (
        <section className="stack-card">
          <div className="content-section-header">
            <div className="content-section-header__icon">
              <IconWorld size={16} />
            </div>
            <div>
              <h3>A comunidade achou</h3>
              <p className="content-section-header__subtitle">
                <strong className="rating-number rating-number--small">{book.averageRating}</strong>{' '}
                {book.reviews} avaliações · {friendsReadCount} amigos
              </p>
            </div>
          </div>
          <div className="community-list community-list--flat">
            {book.communityReactions.map((reaction, idx) => {
              const authorId = getReactionAuthorId(reaction.name)
              const isLiked = !!likedReactions[idx]
              const isSaved = !!savedReactions[idx]
              return (
                <div key={idx} className="community-item community-item--flat">
                  <div className="community-item__header">
                    {authorId ? (
                      <Link to={`/leitora/${authorId}`} className="community-item__user">
                        <div className="avatar" style={{ background: avatarPalette[idx % avatarPalette.length] }}>
                          {reaction.avatar}
                        </div>
                        <strong>{reaction.name}</strong>
                      </Link>
                    ) : (
                      <div className="community-item__user">
                        <div className="avatar" style={{ background: avatarPalette[idx % avatarPalette.length] }}>
                          {reaction.avatar}
                        </div>
                        <strong>{reaction.name}</strong>
                      </div>
                    )}
                    <div className="stars">
                      {Array.from({ length: reaction.stars }).map((_, index) => (
                        <IconStarFilled key={index} size={14} color="var(--sol)" />
                      ))}
                    </div>
                  </div>
                  {reaction.spoiler ? (
                    <div className="spoiler-box">
                      <IconEyeOff size={16} />
                      <span>Comentário ocultado por spoiler</span>
                    </div>
                  ) : (
                    <p className="community-text">{reaction.text}</p>
                  )}
                  <div className="community-item__actions">
                    <button
                      type="button"
                      className={`action-button ${isLiked ? 'is-active' : ''}`}
                      aria-label="Curtir"
                      onClick={() => toggleReactionLike(idx)}
                    >
                      <IconHeart size={14} />
                      <span>{reaction.likes + (isLiked ? 1 : 0)}</span>
                    </button>
                    <button type="button" className="action-button" aria-label="Responder" onClick={() => openModal('more')}>
                      <IconMessageCircle2 size={14} />
                    </button>
                    <button type="button" className="action-button" aria-label="Repostar" onClick={() => openModal('more')}>
                      <IconRepeat size={14} />
                    </button>
                    <button
                      type="button"
                      className={`action-button ${isSaved ? 'is-active' : ''}`}
                      aria-label="Salvar"
                      onClick={() => toggleReactionSave(idx)}
                    >
                      <IconBookmark size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* MODAIS */}
      {modalType === 'progress' ? (
        <ProgressSheet book={book} onClose={closeModal} />
      ) : modalType === 'status' ? (
        <AddToShelfModal book={book} onClose={closeModal} />
      ) : modalType === 'share' || modalType === 'more' ? (
        <InfoModal
          title={modalType === 'share' ? 'Compartilhar' : 'Mais ações'}
          message="Essa função ainda está a caminho — sem pressa, ela chega."
          onClose={closeModal}
        />
      ) : modalType === 'note' ? (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <h3 className="sheet-title">Nova nota</h3>
            <p className="note-modal-subtitle">Suas frases favoritas moram aqui ✍️</p>

            <textarea
              className="note-modal-textarea"
              placeholder="Escreva seu trecho ou reflexão..."
              value={noteText}
              onChange={(event) => setNoteText(event.target.value)}
            />

            <p className="rating-label">Livro</p>
            <div className="note-modal-select-wrap">
              <select
                className="note-modal-select"
                value={noteBookId ?? book.id}
                onChange={(event) => setNoteBookId(Number(event.target.value))}
              >
                {books.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
              <IconChevronDown size={16} className="note-modal-select__chevron" />
            </div>

            <p className="rating-label">Tag (opcional)</p>
            <div className="tag-input-box">
              <span className="tag-input__hash">#</span>
              <input
                type="text"
                className="tag-input"
                placeholder="favoritas, citações, vocabulário..."
                value={noteTag}
                onChange={(event) => setNoteTag(event.target.value)}
              />
            </div>

            <button type="button" className="primary-action sheet-save-button" onClick={handleSaveNote} disabled={!noteText.trim()}>
              Salvar nota
            </button>
            <button type="button" className="ghost-button" onClick={closeModal}>
              Cancelar
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default BookDetailPage
