import React, { useState } from 'react';
import styles from './ScorePopupA.module.css';

interface ScorePopupAProps {
  correctCount: number;
  totalCount: number;
  elapsedTime: number;
  onClose: () => void;
}

const ScorePopupA: React.FC<ScorePopupAProps> = ({ correctCount, totalCount, elapsedTime, onClose }) => {
  const [visible, setVisible] = useState(true);
  const [timeSnapshot] = useState(() => ({
    minutes: String(Math.floor(elapsedTime / 60)).padStart(2, '0'),
    seconds: String(elapsedTime % 60).padStart(2, '0'),
  }));
  const scorePercent = (correctCount / totalCount) * 100;
  let resultImage = "/seeq_doll_good.png";
  if (scorePercent >= 80) {
    resultImage = "/seeq_doll_win.png";
  } else if (scorePercent >= 50) {
    resultImage = "/seeq_doll_good.png";
  } else {
    resultImage = "/seeq_doll_try.png";
  }
  if (!visible) return null;

  return (
    <div className={styles["score-popup"]}>
      <div className={styles["image-placeholder"]}>
        <img
          src={resultImage}
          alt="결과 이미지"
          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
        />
      </div>
      <div className={styles["text-content"]}>
        <h1>
          퀴즈 완료! {correctCount === totalCount && '🎉'}
        </h1>
        <p>
          총 {totalCount}문제 중 {correctCount}문제를 맞히셨습니다
        </p>
        <p
          className={correctCount === totalCount && styles["highlight"] ? styles["highlight"] : undefined}
        >
          정답률: {((correctCount / totalCount) * 100).toFixed(1)}%
        </p>
      </div>
      <div className={styles["actions"]}>
        <div className={styles["primary-button"]}>
          <span>총 소요시간</span>
          <div className={styles["divider"]}></div>
          <span>{timeSnapshot.minutes}:{timeSnapshot.seconds}</span>
        </div>
        <div
          className={`${styles["secondary-button"]} ${styles["hover-purple"]}`}
          onClick={() => { onClose(); setVisible(false); }}
        >
          <span>닫기</span>
        </div>
      </div>
    </div>
  );
};

export default ScorePopupA;