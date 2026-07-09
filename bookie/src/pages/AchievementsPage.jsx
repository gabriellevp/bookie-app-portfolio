import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconArrowLeft, IconSearch, IconCheck } from '@tabler/icons-react'
import { mockAchievements } from '../data/mockData'
import { achievementIcons, defaultAchievementIcon } from '../utils/achievementIcons'

function AchievementsPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [activeAchievement, setActiveAchievement] = useState(null)

  const earnedCount = mockAchievements.filter((achievement) => achievement.earned).length

  const filteredAchievements = useMemo(() => {
    if (!query.trim()) return mockAchievements
    const search = query.toLowerCase()
    return mockAchievements.filter(
      (achievement) =>
        achievement.label.toLowerCase().includes(search) ||
        achievement.description?.toLowerCase().includes(search),
    )
  }, [query])

  return (
    <section className="profile-page">
      <div className="detail-header">
        <button type="button" className="back-link" onClick={() => navigate(-1)}>
          <IconArrowLeft size={18} />
          Voltar
        </button>
      </div>

      <header className="profile-header">
        <h2>Conquistas</h2>
        <span className="section-kicker">
          {earnedCount} de {mockAchievements.length}
        </span>
      </header>

      <div className="search-box">
        <IconSearch size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Buscar conquistas…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {filteredAchievements.length > 0 ? (
        <div className="badge-grid badge-grid--page">
          {filteredAchievements.map((achievement) => {
            const AchievementIcon = achievementIcons[achievement.icon] ?? defaultAchievementIcon
            return (
              <button
                key={achievement.id}
                type="button"
                className={`badge-item ${achievement.earned ? '' : 'is-locked'}`}
                onClick={() => setActiveAchievement(achievement)}
              >
                <div className="badge-item__icon">
                  <AchievementIcon size={20} />
                </div>
                <span>{achievement.label}</span>
              </button>
            )
          })}
        </div>
      ) : (
        <p className="empty-state">Nenhuma conquista encontrada.</p>
      )}

      {activeAchievement && (
        <div className="modal-backdrop" onClick={() => setActiveAchievement(null)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="achievement-modal__icon-row">
              <div
                className={`badge-item__icon badge-item__icon--large ${
                  activeAchievement.earned ? '' : 'is-locked'
                }`}
              >
                {(() => {
                  const AchievementIcon = achievementIcons[activeAchievement.icon] ?? defaultAchievementIcon
                  return <AchievementIcon size={28} />
                })()}
              </div>
              {activeAchievement.earned && (
                <span className="achievement-modal__earned">
                  <IconCheck size={14} />
                  Conquistada
                </span>
              )}
            </div>
            <h3>{activeAchievement.label}</h3>
            <p className="achievement-modal__desc">
              {activeAchievement.earned
                ? 'Você já conquistou essa. '
                : 'Ainda não conquistada. Pra chegar lá: '}
              {activeAchievement.description}
            </p>
            <button type="button" className="primary-action" onClick={() => setActiveAchievement(null)}>
              Entendi
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

export default AchievementsPage
