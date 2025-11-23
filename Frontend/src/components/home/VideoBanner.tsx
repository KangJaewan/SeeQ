/**
 * 비디오 배너 컴포넌트
 */
export function VideoBanner() {
  return (
    <div className="video-banner-section mb-8 rounded-2xl overflow-hidden">
      <div className="video-banner-container relative h-48 md:h-64 lg:h-96">
        <video
          className="banner-video w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/banner_video.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  )
}
