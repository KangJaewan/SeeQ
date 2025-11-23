/**
 * Quiz Mate & Second Brain 배너 버튼
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraphModal } from './GraphModal'

export function BannerButtons() {
  const navigate = useNavigate()
  const [isGraphModalOpen, setIsGraphModalOpen] = useState(false)

  const handleQuizMateClick = () => {
    console.log('Quiz Mate 클릭')
    navigate('/quiz')
  }

  const handleSecondBrainClick = () => {
    console.log('Second Brain 클릭 - 그래프 모달 열기')
    setIsGraphModalOpen(true)
  }

  return (
    <>
      <GraphModal
        isOpen={isGraphModalOpen}
        onClose={() => setIsGraphModalOpen(false)}
      />

      <div className="banner-buttons-section flex flex-col gap-4">
        {/* Quiz Mate Banner Button */}
        <button
          onClick={handleQuizMateClick}
          className="quiz-mate-banner-button w-full rounded-2xl overflow-hidden hover:opacity-90 transition-opacity focus:outline-none focus:ring-4 focus:ring-indigo-300"
        >
          <img
            src="/quiz mate btn.png"
            alt="Quiz Mate"
            className="banner-button-image w-full h-auto object-cover"
          />
        </button>

        {/* Second Brain Banner Button */}
        <button
          onClick={handleSecondBrainClick}
          className="second-brain-banner-button w-full rounded-2xl overflow-hidden hover:opacity-90 transition-opacity focus:outline-none focus:ring-4 focus:ring-purple-300"
        >
          <img
            src="/second brain btn.png"
            alt="Second Brain"
            className="banner-button-image w-full h-auto object-cover"
          />
        </button>
      </div>
    </>
  )
}
