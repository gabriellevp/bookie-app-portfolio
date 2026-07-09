import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  IconPlus,
  IconStar,
  IconStarFilled,
  IconEyeOff,
  IconBook,
  IconHash,
  IconUsers,
  IconUserPlus,
  IconPencil,
  IconBell,
  IconThumbUp,
  IconThumbUpFilled,
  IconMessageCircle2,
  IconRepeat,
  IconBookmark,
  IconBookmarkFilled,
} from '@tabler/icons-react'
import { useBookie } from '../contexts/BookieContext'
import { mockFeedPosts } from '../data/mockData'
import { coverStyle } from '../utils/coverStyle'
import { InfoModal } from '../components/InfoModal'

const feedTabs = ['Seguindo', 'Comunidade']
const MAX_CHARS = 280
const FOLLOW_SUGGESTION_INTERVAL = 10

function CommunityPage() {
  const { books, communityUsers, toggleFollow, currentUser, updateBook } = useBookie()
  const location = useLocation()

  const [activeTab, setActiveTab] = useState('Comunidade')
  const [posts, setPosts] = useState(mockFeedPosts)
  const [likedPosts, setLikedPosts] = useState({})
  const [savedPosts, setSavedPosts] = useState({})
  const [revealedSpoilers, setRevealedSpoilers] = useState({})
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)

  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const [selectedBookId, setSelectedBookId] = useState(null)
  const [composerText, setComposerText] = useState('')
  const [composerStars, setComposerStars] = useState(0)
  const [composerPage, setComposerPage] = useState('')
  const [composerPrivacy, setComposerPrivacy] = useState('Amigos')
  const [showBookPicker, setShowBookPicker] = useState(false)
  const [showStarPicker, setShowStarPicker] = useState(false)
  const [showPageInput, setShowPageInput] = useState(false)

  const readingBooks = books.filter((book) => book.status === 'Lendo agora')

  const followedNames = useMemo(
    () => new Set(communityUsers.filter((user) => user.following).map((user) => user.name)),
    [communityUsers],
  )

  const visiblePosts = useMemo(() => {
    if (activeTab === 'Seguindo') {
      return posts.filter((post) => post.isOwn || followedNames.has(post.authorName))
    }
    return posts
  }, [posts, activeTab, followedNames])

  const peopleToFollow = communityUsers.filter((user) => !user.following)

  // intercala 1 sugestão de "seguir" a cada N posts do feed
  const feedItems = useMemo(() => {
    const items = []
    visiblePosts.forEach((post, index) => {
      items.push({ type: 'post', post })
      const reachedInterval = (index + 1) % FOLLOW_SUGGESTION_INTERVAL === 0
      if (reachedInterval && peopleToFollow.length > 0) {
        const person =
          peopleToFollow[Math.floor(index / FOLLOW_SUGGESTION_INTERVAL) % peopleToFollow.length]
        items.push({ type: 'suggestion', person, key: `suggestion-${index}` })
      }
    })
    return items
  }, [visiblePosts, peopleToFollow])

  const getBook = (bookId) => books.find((book) => book.id === bookId)
  const getAuthorId = (name) => communityUsers.find((user) => user.name === name)?.id
  const selectedBook = selectedBookId ? getBook(selectedBookId) : null
  const remainingChars = MAX_CHARS - composerText.length

  const toggleLike = (postId) => {
    setLikedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }))
  }

  const toggleSave = (postId) => {
    setSavedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }))
  }

  const toggleSpoiler = (postId) => {
    setRevealedSpoilers((prev) => ({ ...prev, [postId]: !prev[postId] }))
  }

  const openComposer = () => {
    setSelectedBookId(null)
    setComposerText('')
    setComposerStars(0)
    setComposerPage('')
    setComposerPrivacy('Amigos')
    setShowBookPicker(false)
    setShowStarPicker(false)
    setShowPageInput(false)
    setIsComposerOpen(true)
  }

  const closeComposer = () => setIsComposerOpen(false)

  useEffect(() => {
    if (location.state?.openComposer) {
      openComposer()
    }
    // abrir só quando chega com esse estado de navegação (ex.: vindo da Home)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state])

  const removeLinkedBook = () => {
    setSelectedBookId(null)
    setComposerPage('')
    setShowPageInput(false)
  }

  const handlePageChange = (event) => {
    const value = event.target.value
    setComposerPage(value)
    if (selectedBook && value) {
      const pageNumber = Math.min(Math.max(Number(value) || 0, 0), selectedBook.totalPages)
      const percent =
        selectedBook.totalPages > 0 ? Math.round((pageNumber / selectedBook.totalPages) * 100) : 0
      updateBook(selectedBook.id, { pagesRead: pageNumber, progress: percent })
    }
  }

  const handlePublish = () => {
    if (!composerText.trim()) return

    const newPost = {
      id: Date.now(),
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      timeAgo: 'agora',
      bookId: selectedBookId,
      page: composerPage ? Number(composerPage) : null,
      stars: composerStars,
      text: composerText.trim(),
      spoiler: false,
      likes: 0,
      privacy: composerPrivacy,
      isOwn: true,
    }

    setPosts((prev) => [newPost, ...prev])
    closeComposer()
  }

  const renderPost = (post) => {
    const book = getBook(post.bookId)
    const isLiked = !!likedPosts[post.id]
    const likeCount = post.likes + (isLiked ? 1 : 0)
    const isSaved = !!savedPosts[post.id]
    const isSpoilerRevealed = !!revealedSpoilers[post.id]

    const authorId = post.isOwn ? null : getAuthorId(post.authorName)
    const authorHref = post.isOwn ? '/perfil' : authorId ? `/leitora/${authorId}` : null

    return (
      <article key={post.id} className="feed-post">
        {authorHref ? (
          <Link to={authorHref} className="feed-post__header">
            <div className="avatar">{post.authorAvatar}</div>
            <div className="feed-post__meta">
              <strong>{post.authorName}</strong>
              <span className="post-time">
                {post.timeAgo} · {post.privacy}
              </span>
            </div>
          </Link>
        ) : (
          <div className="feed-post__header">
            <div className="avatar">{post.authorAvatar}</div>
            <div className="feed-post__meta">
              <strong>{post.authorName}</strong>
              <span className="post-time">
                {post.timeAgo} · {post.privacy}
              </span>
            </div>
          </div>
        )}

        {book && (
          <Link to={`/livro/${book.id}`} className="feed-post__book">
            <div className="feed-post__cover" style={coverStyle(book)}>
              {!book.coverImage && <IconBook size={18} color="white" />}
            </div>
            <div className="feed-post__book-info">
              <h4>{book.title}</h4>
              <p>
                {book.author}
                {post.page ? ` · pág. ${post.page}` : ''}
              </p>
              {post.stars > 0 && (
                <div className="stars">
                  {Array.from({ length: post.stars }).map((_, index) => (
                    <IconStarFilled key={index} size={13} color="var(--sol)" />
                  ))}
                </div>
              )}
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

        <div className="community-item__actions">
          <button
            type="button"
            className={`action-button ${isLiked ? 'is-active' : ''}`}
            onClick={() => toggleLike(post.id)}
            aria-label="Curtir"
          >
            {isLiked ? <IconThumbUpFilled size={14} /> : <IconThumbUp size={14} />}
            <span>{likeCount}</span>
          </button>
          <button
            type="button"
            className="action-button"
            aria-label="Responder"
            onClick={() => setIsInfoModalOpen(true)}
          >
            <IconMessageCircle2 size={14} />
          </button>
          <button
            type="button"
            className="action-button"
            aria-label="Repostar"
            onClick={() => setIsInfoModalOpen(true)}
          >
            <IconRepeat size={14} />
          </button>
          <button
            type="button"
            className={`action-button ${isSaved ? 'is-active' : ''}`}
            onClick={() => toggleSave(post.id)}
            aria-label="Salvar"
          >
            {isSaved ? <IconBookmarkFilled size={14} /> : <IconBookmark size={14} />}
          </button>
        </div>
      </article>
    )
  }

  const renderSuggestion = (person, key) => (
    <div key={key} className="feed-suggestion">
      <p className="section-kicker">Pra você seguir</p>
      <div className="search-result-item search-person-item feed-suggestion__row">
        <Link to={`/leitora/${person.id}`} className="person-card-link">
          <div className="person-avatar">{person.avatar}</div>
          <div className="person-info">
            <h4>{person.name}</h4>
            <div className="person-genres">
              {person.favoriteGenres?.slice(0, 2).map((genre) => (
                <span key={genre} className="genre-badge">
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </Link>
        <button type="button" className="follow-button" onClick={() => toggleFollow(person.id)}>
          Seguir
        </button>
      </div>
    </div>
  )

  return (
    <section className="community-page">
      <header className="community-header">
        <h2>Comunidade</h2>
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

      <div className="tabs community-tabs">
        {feedTabs.map((tab) => (
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

      {/* FEED DE POSTS (com sugestão de seguir a cada 10 posts) */}
      <div className="feed-list">
        {feedItems.length > 0 ? (
          feedItems.map((item) =>
            item.type === 'post' ? renderPost(item.post) : renderSuggestion(item.person, item.key),
          )
        ) : (
          <p className="empty-state">
            Ninguém por aqui ainda — siga leitoras pra ver as reações delas.
          </p>
        )}
      </div>

      {/* FAB: nova reação ou seguir alguém */}
      <div className="fab-wrapper">
        {isFabMenuOpen && (
          <div className="fab-menu">
            <Link
              to="/buscar?aba=Pessoas"
              className="fab-menu__item"
              onClick={() => setIsFabMenuOpen(false)}
            >
              <IconUserPlus size={16} />
              Seguir alguém
            </Link>
            <button
              type="button"
              className="fab-menu__item"
              onClick={() => {
                setIsFabMenuOpen(false)
                openComposer()
              }}
            >
              <IconPencil size={16} />
              Nova reação
            </button>
          </div>
        )}
        <button
          type="button"
          className="fab-button"
          onClick={() => setIsFabMenuOpen((value) => !value)}
          aria-label="Opções"
        >
          <IconPlus size={24} className={isFabMenuOpen ? 'fab-icon--rotated' : ''} />
        </button>
      </div>

      {/* COMPOSITOR DE REAÇÃO */}
      {isComposerOpen && (
        <div className="modal-backdrop" onClick={closeComposer}>
          <div className="modal-card composer-card" onClick={(event) => event.stopPropagation()}>
            <div className="composer-header">
              <button type="button" className="ghost-button ghost-button--auto" onClick={closeComposer}>
                Cancelar
              </button>
              <button
                type="button"
                className="primary-action composer-publish"
                onClick={handlePublish}
                disabled={!composerText.trim()}
              >
                Publicar
              </button>
            </div>

            <div className="composer-user-row">
              <div className="avatar">{currentUser.avatar}</div>
              <strong className="composer-handle">@{currentUser.name.toLowerCase()}</strong>
            </div>

            <textarea
              className="composer-textarea"
              placeholder="Quais são as novidades?"
              value={composerText}
              maxLength={MAX_CHARS}
              onChange={(event) => setComposerText(event.target.value)}
              autoFocus
            />

            {selectedBook && (
              <div className="composer-book-chip">
                <div className="composer-book-chip__cover" style={coverStyle(selectedBook)} />
                <div className="composer-book-chip__info">
                  <strong>{selectedBook.title}</strong>
                  <span>{selectedBook.author}</span>
                </div>
                {showPageInput && (
                  <input
                    type="number"
                    inputMode="numeric"
                    className="composer-page-input"
                    placeholder="Pág."
                    value={composerPage}
                    onChange={handlePageChange}
                  />
                )}
                <button
                  type="button"
                  className="composer-book-chip__remove"
                  onClick={removeLinkedBook}
                  aria-label="Remover livro vinculado"
                >
                  ×
                </button>
              </div>
            )}

            {showBookPicker && (
              <div className="status-options composer-book-picker">
                {readingBooks.length > 0 ? (
                  readingBooks.map((book) => (
                    <button
                      key={book.id}
                      type="button"
                      className={`status-option ${selectedBookId === book.id ? 'is-selected' : ''}`}
                      onClick={() => {
                        setSelectedBookId(book.id)
                        setShowBookPicker(false)
                      }}
                    >
                      {book.title}
                    </button>
                  ))
                ) : (
                  <p className="empty-state">Nenhum livro em "Lendo agora" pra vincular ainda.</p>
                )}
              </div>
            )}

            {showStarPicker && (
              <div className="stars stars--interactive composer-star-row">
                {Array.from({ length: 5 }).map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className="star-button"
                    onClick={() => setComposerStars(index + 1)}
                    aria-label={`Avaliação ${index + 1} estrelas`}
                  >
                    {index < composerStars ? (
                      <IconStarFilled size={20} color="var(--sol)" />
                    ) : (
                      <IconStar size={20} color="var(--texto-2)" />
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="composer-toolbar">
              <div className="composer-toolbar__icons">
                <button
                  type="button"
                  className={`composer-icon-button ${selectedBookId ? 'is-active' : ''}`}
                  onClick={() => setShowBookPicker((value) => !value)}
                  aria-label="Vincular livro"
                >
                  <IconBook size={19} />
                </button>
                <button
                  type="button"
                  className={`composer-icon-button ${composerPage ? 'is-active' : ''}`}
                  onClick={() => setShowPageInput((value) => !value)}
                  disabled={!selectedBookId}
                  aria-label="Adicionar página"
                >
                  <IconHash size={19} />
                </button>
                <button
                  type="button"
                  className={`composer-icon-button ${composerStars > 0 ? 'is-active' : ''}`}
                  onClick={() => setShowStarPicker((value) => !value)}
                  aria-label="Avaliar com estrelas"
                >
                  <IconStar size={19} />
                  {composerStars > 0 && <span className="composer-icon-badge">{composerStars}</span>}
                </button>
              </div>

              <button
                type="button"
                className="composer-privacy-pill"
                onClick={() =>
                  setComposerPrivacy((prev) => (prev === 'Amigos' ? 'Comunidade' : 'Amigos'))
                }
              >
                <IconUsers size={13} />
                {composerPrivacy}
              </button>

              <span className="composer-char-count">{remainingChars}</span>
            </div>
          </div>
        </div>
      )}

      {isNotificationsOpen && (
        <InfoModal
          title="Notificações"
          message="Ainda não tem nada por aqui — quando tiver, sem pressa, você vê."
          onClose={() => setIsNotificationsOpen(false)}
        />
      )}

      {isInfoModalOpen && (
        <InfoModal
          title="Em breve"
          message="Essa função ainda está a caminho — sem pressa, ela chega."
          onClose={() => setIsInfoModalOpen(false)}
        />
      )}
    </section>
  )
}

export default CommunityPage
