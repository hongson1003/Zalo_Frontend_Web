import React, { useEffect } from 'react';
import './trackSound.utils.component.scss';

const TrackSound = ({ soundTrack, fetchInfoUser }) => {
  const audioRef = React.useRef(null);
  const [isPlaying, setIsPlaying] = React.useState(false);

  const handlePlay = () => {
    setIsPlaying((prev) => !prev);
    if (audioRef.current.paused) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  };

  return (
    <div className="track-ultils">
      <audio
        onEnded={() => setIsPlaying(false)}
        ref={audioRef}
        hidden
        controls
        src="https://res.cloudinary.com/hongsonit10/raw/upload/v1714408702/zalo/nangchentieusa_chungtacuasaunay-1714408698225.mp3"
      ></audio>
      <div className="track-content">
        {isPlaying ? (
          <i className="fa-solid fa-pause" onClick={handlePlay}></i>
        ) : (
          <i className="fa-solid fa-play" onClick={handlePlay}></i>
        )}
        <p className="name">Nâng chén tiêu sầu - Sơn Tùng MTP</p>
      </div>
    </div>
  );
};

export default TrackSound;
