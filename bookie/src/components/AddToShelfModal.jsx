import { useState } from 'react'
import { IconBook, IconBooks, IconBook2, IconCheck, IconTrash } from '@tabler/icons-react'
import { useBookie } from '../contexts/BookieContext'
import { coverStyle } from '../utils/coverStyle'

const statusOptions = [
  { value: 'Quero ler', label: 'Quero ler', subtitle: 'Adicionar à fila', icon: IconBooks, iconColor: 'var(--roxo)' },
  { value: 'Lendo agora', label: 'Lendo agora', subtitle: 'Estou lendo agora', icon: IconBook2, iconColor: 'var(--roxo)' },
  { value: 'Já li', label: 'Já li', subtitle: 'Marcar como lido', icon: IconCheck, iconColor: 'white', iconBg: 'var(--sucesso)' },
  { value: 'Abandonei', label: 'Abandonei', subtitle: 'Não terminei', emoji: '😴' },
]

export function AddToShelfModal({ book, onClose }) {
  const { updateBook } = useBookie()
  const isAlreadyOnShelf = book.status !== 'Não adicionado'
  const [selectedStatus, setSelectedStatus] = useState(
    isAlreadyOnShelf ? book.status : 'Quero ler',
  )
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)

  const handleSave = () => {
    updateBook(book.id, { status: selectedStatus })
    onClose()
  }

  const handleRemove = () => {
    updateBook(book.id, { status: 'Não adicionado' })
    onClose()
  }

  if (showRemoveConfirm) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-card" onClick={(event) => event.stopPropagation()}>
          <h3 className="sheet-title">Remover da estante?</h3>
          <p>
            "{book.title}" vai sair da sua estante. Suas notas e reações continuam guardadas.
          </p>
          <div className="modal-action-row">
            <button type="button" className="secondary-action" onClick={() => setShowRemoveConfirm(false)}>
              Cancelar
            </button>
            <button type="button" className="primary-action primary-action--danger" onClick={handleRemove}>
              Remover
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="sheet-book-row">
          <div className="sheet-book-cover" style={coverStyle(book)}>
            {!book.coverImage && <IconBook size={18} color="white" />}
          </div>
          <div>
            <p className="sheet-book-title">{book.title}</p>
            <p className="sheet-book-author">{book.author}</p>
          </div>
        </div>

        <p className="rating-label">
          {isAlreadyOnShelf ? 'Mudar status para:' : 'Adicionar à estante como:'}
        </p>
        <div className="shelf-status-list">
          {statusOptions.map((option) => {
            const Icon = option.icon
            const isSelected = selectedStatus === option.value
            return (
              <button
                key={option.value}
                type="button"
                className={`shelf-status-option ${isSelected ? 'is-selected' : ''}`}
                onClick={() => setSelectedStatus(option.value)}
              >
                <span
                  className="shelf-status-option__icon"
                  style={option.iconBg ? { background: option.iconBg } : undefined}
                >
                  {option.emoji ? option.emoji : <Icon size={20} color={option.iconColor} />}
                </span>
                <span className="shelf-status-option__text">
                  <strong>{option.label}</strong>
                  <span>{option.subtitle}</span>
                </span>
                {isSelected && (
                  <span className="shelf-status-option__check">
                    <IconCheck size={13} />
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <button type="button" className="primary-action sheet-save-button" onClick={handleSave}>
          Salvar na estante
        </button>
        <button type="button" className="ghost-button" onClick={onClose}>
          Cancelar
        </button>

        {isAlreadyOnShelf && (
          <button type="button" className="remove-from-shelf-button" onClick={() => setShowRemoveConfirm(true)}>
            <IconTrash size={14} />
            Remover da estante
          </button>
        )}
      </div>
    </div>
  )
}
