import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconArrowLeft, IconBell, IconPlus, IconSearch, IconPencil, IconTrash } from '@tabler/icons-react'
import { useBookie } from '../contexts/BookieContext'
import { InfoModal } from '../components/InfoModal'

const groupTabs = ['Todas', 'Por livro', 'Por tag']

function groupBy(notes, keyFn) {
  const groups = {}
  notes.forEach((note) => {
    const key = keyFn(note) || 'Sem tag'
    if (!groups[key]) groups[key] = []
    groups[key].push(note)
  })
  return groups
}

function NotesPage() {
  const navigate = useNavigate()
  const { books, addNote, updateNote, deleteNote } = useBookie()
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  const [noteQuery, setNoteQuery] = useState('')
  const [groupTab, setGroupTab] = useState('Todas')
  const [modalType, setModalType] = useState(null)
  const [activeNote, setActiveNote] = useState(null)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteText, setNoteText] = useState('')
  const [noteBookId, setNoteBookId] = useState(books[0]?.id ?? null)

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

  const filteredNotes = useMemo(() => {
    if (!noteQuery.trim()) return allNotes
    const query = noteQuery.toLowerCase()
    return allNotes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.text.toLowerCase().includes(query) ||
        note.bookTitle.toLowerCase().includes(query),
    )
  }, [allNotes, noteQuery])

  const groupedByBook = useMemo(() => groupBy(filteredNotes, (note) => note.bookTitle), [filteredNotes])
  const groupedByTag = useMemo(() => groupBy(filteredNotes, (note) => note.title), [filteredNotes])

  const closeModal = () => {
    setModalType(null)
    setActiveNote(null)
  }

  const openNewNote = () => {
    setNoteBookId(books[0]?.id ?? null)
    setNoteTitle('')
    setNoteText('')
    setModalType('newNote')
  }

  const openNoteDetail = (note) => {
    setActiveNote(note)
    setModalType('viewNote')
  }

  const openEditNote = (note) => {
    setActiveNote(note)
    setNoteBookId(note.bookId)
    setNoteTitle(note.title)
    setNoteText(note.text)
    setModalType('editNote')
  }

  const openDeleteNote = (note) => {
    setActiveNote(note)
    setModalType('deleteNote')
  }

  const handleCreateNote = () => {
    if (!noteBookId || !noteText.trim()) return
    addNote(noteBookId, { title: noteTitle.trim() || 'Nota', text: noteText.trim() })
    closeModal()
  }

  const handleSaveNote = () => {
    if (!activeNote || !noteText.trim()) return
    updateNote(activeNote.bookId, activeNote.id, {
      title: noteTitle.trim() || 'Nota',
      text: noteText.trim(),
    })
    closeModal()
  }

  const handleDeleteNote = () => {
    if (!activeNote) return
    deleteNote(activeNote.bookId, activeNote.id)
    closeModal()
  }

  const renderCard = (note) => (
    <div key={`${note.bookId}-${note.id}`} className="note-highlight-card">
      <button type="button" className="note-highlight-card__body" onClick={() => openNoteDetail(note)}>
        <p className="note-highlight-card__text">{note.text}</p>
        <div className="note-highlight-card__footer">
          <span className="note-highlight-card__book">{note.bookTitle}</span>
          {note.title && <span className="chip chip--genre note-highlight-card__tag">#{note.title}</span>}
        </div>
      </button>
    </div>
  )

  return (
    <section className="profile-page">
      <div className="detail-header">
        <button type="button" className="back-link" onClick={() => navigate(-1)}>
          <IconArrowLeft size={18} />
          Voltar
        </button>
      </div>

      <header className="profile-header">
        <h2>Notas e destaques</h2>
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

      <div className="search-box">
        <IconSearch size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Buscar nas suas notas…"
          value={noteQuery}
          onChange={(event) => setNoteQuery(event.target.value)}
        />
      </div>

      <div className="tabs">
        {groupTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`tab-button ${groupTab === tab ? 'is-active' : ''}`}
            onClick={() => setGroupTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {filteredNotes.length === 0 ? (
        <p className="empty-state">
          {noteQuery.trim() ? 'Nenhuma nota encontrada.' : 'Nenhuma nota guardada ainda. Que tal começar?'}
        </p>
      ) : groupTab === 'Todas' ? (
        <div className="notes-list">{filteredNotes.map(renderCard)}</div>
      ) : groupTab === 'Por livro' ? (
        <div className="notes-list">
          {Object.entries(groupedByBook).map(([bookTitle, notes]) => (
            <div key={bookTitle}>
              <p className="note-highlight-group-title">{bookTitle}</p>
              {notes.map(renderCard)}
            </div>
          ))}
        </div>
      ) : (
        <div className="notes-list">
          {Object.entries(groupedByTag).map(([tag, notes]) => (
            <div key={tag}>
              <p className="note-highlight-group-title">#{tag}</p>
              {notes.map(renderCard)}
            </div>
          ))}
        </div>
      )}

      <div className="fab-wrapper">
        <button type="button" className="fab-button" onClick={openNewNote} aria-label="Nova nota">
          <IconPlus size={24} />
        </button>
      </div>

      {/* MODAL: NOVA NOTA / EDITAR NOTA */}
      {(modalType === 'newNote' || modalType === 'editNote') && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <h3 className="sheet-title">{modalType === 'newNote' ? 'Nova nota' : 'Editar nota'}</h3>
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
                value={noteBookId ?? ''}
                disabled={modalType === 'editNote'}
                onChange={(event) => setNoteBookId(Number(event.target.value))}
              >
                {books.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title}
                  </option>
                ))}
              </select>
            </div>

            <p className="rating-label">Tag (opcional)</p>
            <div className="tag-input-box">
              <span className="tag-input__hash">#</span>
              <input
                type="text"
                className="tag-input"
                placeholder="favoritas, citações, vocabulário..."
                value={noteTitle}
                onChange={(event) => setNoteTitle(event.target.value)}
              />
            </div>

            <button
              type="button"
              className="primary-action sheet-save-button"
              onClick={modalType === 'newNote' ? handleCreateNote : handleSaveNote}
              disabled={!noteText.trim() || (modalType === 'newNote' && !noteBookId)}
            >
              Salvar nota
            </button>
            <button type="button" className="ghost-button" onClick={closeModal}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* MODAL: VER NOTA */}
      {modalType === 'viewNote' && activeNote && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-card__header">
              <h3>{activeNote.title}</h3>
              <button type="button" className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            <p className="note-card__book">{activeNote.bookTitle}</p>
            <p className="note-view-text">{activeNote.text}</p>
            <div className="modal-action-row">
              <button type="button" className="secondary-action" onClick={() => openEditNote(activeNote)}>
                <IconPencil size={14} />
                Editar
              </button>
              <button type="button" className="secondary-action" onClick={() => openDeleteNote(activeNote)}>
                <IconTrash size={14} />
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAR EXCLUSÃO */}
      {modalType === 'deleteNote' && activeNote && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <h3 className="sheet-title">Excluir nota?</h3>
            <p>
              Essa nota sobre "{activeNote.bookTitle}" vai ser apagada. Essa ação não pode ser desfeita.
            </p>
            <div className="modal-action-row">
              <button type="button" className="secondary-action" onClick={closeModal}>
                Cancelar
              </button>
              <button type="button" className="primary-action primary-action--danger" onClick={handleDeleteNote}>
                Excluir
              </button>
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
    </section>
  )
}

export default NotesPage
