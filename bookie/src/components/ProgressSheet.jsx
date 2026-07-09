import { useState } from 'react'
import { IconSparkles, IconUser, IconUsers, IconWorld } from '@tabler/icons-react'
import { useBookie } from '../contexts/BookieContext'
import { coverStyle } from '../utils/coverStyle'

const privacyOptions = [
  { value: 'privado', label: 'Notas pessoais', icon: IconUser },
  { value: 'amigos', label: 'Amigos', icon: IconUsers },
  { value: 'comunidade', label: 'Comunidade', icon: IconWorld },
]

export function ProgressSheet({ book, onClose }) {
  const { updateBook, addNote } = useBookie()
  const [page, setPage] = useState(String(book.pagesRead ?? 0))
  const [reaction, setReaction] = useState('')
  const [privacy, setPrivacy] = useState('amigos')

  const pageNumber = Math.min(Math.max(Number(page) || 0, 0), book.totalPages)
  const percent = book.totalPages > 0 ? Math.round((pageNumber / book.totalPages) * 100) : 0

  const handleSave = () => {
    updateBook(book.id, { pagesRead: pageNumber, progress: percent })
    if (reaction.trim() && privacy === 'privado') {
      addNote(book.id, { title: 'Reação', text: reaction.trim() })
    }
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <h3 className="sheet-title">Até onde você foi?</h3>

        <div className="sheet-book-row">
          <div className="sheet-book-cover" style={coverStyle(book)} />
          <div>
            <p className="sheet-book-title">{book.title}</p>
            <p className="sheet-book-author">{book.author}</p>
          </div>
        </div>

        <p className="rating-label">Página atual</p>
        <div className="page-input-box">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={book.totalPages}
            value={page}
            onChange={(event) => setPage(event.target.value)}
            className="page-input"
          />
          <span className="page-input__suffix">de {book.totalPages}</span>
        </div>

        <div className="percent-hint">
          <span>
            <IconSparkles size={14} />O Bookie calcula a % pra você
          </span>
          <strong>{percent}%</strong>
        </div>

        <p className="rating-label">Uma reação? (opcional)</p>
        <textarea
          className="reaction-input"
          placeholder="Um pensamento sobre o que leu hoje..."
          value={reaction}
          onChange={(event) => setReaction(event.target.value)}
        />

        <div className="privacy-options privacy-options--inline">
          {privacyOptions.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              className={`privacy-option ${privacy === value ? 'is-selected' : ''}`}
              onClick={() => setPrivacy(value)}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        <button type="button" className="primary-action sheet-save-button" onClick={handleSave}>
          Salvar progresso
        </button>
        <button type="button" className="ghost-button sheet-cancel-button" onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  )
}
