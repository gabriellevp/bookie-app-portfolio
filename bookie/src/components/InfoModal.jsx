export function InfoModal({ title, message, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <h3 className="sheet-title">{title}</h3>
        <p>{message}</p>
        <button type="button" className="primary-action" onClick={onClose}>
          Entendi
        </button>
      </div>
    </div>
  )
}
