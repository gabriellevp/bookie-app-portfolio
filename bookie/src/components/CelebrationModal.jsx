import { useState } from 'react'
import { IconStar, IconStarFilled } from '@tabler/icons-react'
import { coverStyle } from '../utils/coverStyle'

const confettiColors = ['var(--coral)', 'var(--sol)', 'var(--roxo)', 'var(--menta)']

const confettiPieces = Array.from({ length: 24 }).map((_, index) => ({
  left: `${4 + ((index * 71) % 92)}%`,
  color: confettiColors[index % confettiColors.length],
  size: index % 3 === 0 ? 10 : index % 3 === 1 ? 7 : 5,
  round: index % 4 === 0,
  delay: (index % 8) * 0.07,
  duration: 0.9 + (index % 5) * 0.12,
}))

function ConfettiBurst() {
  return (
    <div className="confetti-burst" aria-hidden="true">
      {confettiPieces.map((piece, index) => (
        <span
          key={index}
          className="confetti-piece"
          style={{
            left: piece.left,
            width: piece.size,
            height: piece.round ? piece.size : piece.size * 1.6,
            background: piece.color,
            borderRadius: piece.round ? '999px' : '2px',
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        />
      ))}
    </div>
  )
}

export function CelebrationModal({ variant = 'standard', book, percent, pagesGained, onClose, onFinishReview }) {
  const [stars, setStars] = useState(0)
  const [review, setReview] = useState('')

  return (
    <div className="modal-backdrop" onClick={variant === 'standard' ? onClose : undefined}>
      <div className="modal-card celebration-card" onClick={(event) => event.stopPropagation()}>
        <ConfettiBurst />

        {variant === 'finished' ? (
          <>
            <span className="celebration-emoji" role="img" aria-label="Comemorando">
              🎉
            </span>
            <h3 className="celebration-title">Você terminou!</h3>
            <p className="celebration-text">Como foi essa leitura?</p>

            <div className="stars stars--interactive stars--celebration">
              {Array.from({ length: 5 }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className="star-button"
                  onClick={() => setStars(index + 1)}
                  aria-label={`Avaliação ${index + 1} estrelas`}
                >
                  {index < stars ? (
                    <IconStarFilled size={26} color="var(--sol)" />
                  ) : (
                    <IconStar size={26} color="var(--texto-2)" />
                  )}
                </button>
              ))}
            </div>

            <textarea
              className="text-area"
              placeholder="Escreva uma resenha curta (opcional)..."
              value={review}
              onChange={(event) => setReview(event.target.value)}
            />

            <button
              type="button"
              className="primary-action sheet-save-button"
              onClick={() => onFinishReview({ stars, review })}
            >
              Salvar avaliação
            </button>
            <button type="button" className="ghost-button" onClick={() => onFinishReview(null)}>
              Pular, sem pressa
            </button>
          </>
        ) : (
          <>
            <span className="celebration-emoji" role="img" aria-label="Comemorando">
              🥳
            </span>
            <h3 className="celebration-title">Boa demais!</h3>
            <p className="celebration-text">
              {pagesGained > 0
                ? `+${pagesGained} página${pagesGained === 1 ? '' : 's'} hoje. Tá voando! ✨`
                : 'Progresso salvo. Tá voando! ✨'}
            </p>

            {book && (
              <div className="celebration-book-card">
                <div className="celebration-book-card__cover" style={coverStyle(book)} />
                <div className="celebration-book-card__body">
                  <p className="celebration-book-card__title">{book.title}</p>
                  <div className="celebration-book-card__progress-row">
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${percent}%` }} />
                    </div>
                    <span className="celebration-book-card__percent">{percent}%</span>
                  </div>
                </div>
              </div>
            )}

            <button type="button" className="primary-action celebration-continue" onClick={onClose}>
              Continuar
            </button>
            <button type="button" className="celebration-close-link" onClick={onClose}>
              Fechar
            </button>
          </>
        )}
      </div>
    </div>
  )
}
