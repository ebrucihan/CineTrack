
import {
  Heart,
  Star,
  Play,
  CalendarDays,
  Clapperboard,
  Tv
} from 'lucide-react'

function MovieCard({
  film,
  favoriMi,
  favoriDegistir,
  izlemeDurumuGetir,
  detayAc
}) {
  const favori = favoriMi(film)
  const durum = izlemeDurumuGetir(film)

  const durumEtiketleri = {
    izleyecek: 'İzleyeceklerim',
    izliyorum: 'İzliyorum',
    izledim: 'İzledim'
  }

  const detayGoster = () => detayAc(film)

  return (
    <article
      className="movie-card"
      onClick={detayGoster}
      tabIndex={0}
      role="button"
      aria-label={`${film.ad} detaylarını aç`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          detayGoster()
        }
      }}
    >
      <div className="movie-poster">
        {film.afis ? (
          <img
            src={film.afis}
            alt={`${film.ad} afişi`}
            loading="lazy"
          />
        ) : (
          <div className="poster-placeholder">
            <Clapperboard size={48} />
            <span>Afiş bulunamadı</span>
          </div>
        )}

        <div className="poster-shade" />

        <span className="poster-rating">
          <Star size={13} fill="currentColor" />
          {film.puan}
        </span>

        <button
          type="button"
          className={`favorite-btn ${favori ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            favoriDegistir(film)
          }}
          aria-label={
            favori ? 'Favorilerden çıkar' : 'Favorilere ekle'
          }
          title={
            favori ? 'Favorilerden çıkar' : 'Favorilere ekle'
          }
        >
          <Heart
            size={20}
            fill={favori ? 'currentColor' : 'none'}
          />
        </button>

        <div className="poster-hover-content">
          <span className="poster-play">
            <Play size={22} fill="currentColor" />
          </span>
          <span>Detayları İncele</span>
        </div>

        {durum && (
          <span className="poster-watch-badge">
            {durumEtiketleri[durum] || durum}
          </span>
        )}
      </div>

      <div className="movie-info">
        <div className="movie-info-top">
          <span className="movie-type">
            {film.mediaType === 'tv' ? (
              <Tv size={13} />
            ) : (
              <Clapperboard size={13} />
            )}
            {film.tip}
          </span>

          <span className="movie-year">
            <CalendarDays size={13} />
            {film.yil}
          </span>
        </div>

        <h3 title={film.ad}>{film.ad}</h3>

        <p className="movie-description">
          {film.aciklama}
        </p>

        <div className="movie-card-footer">
          <span>Detayları Gör</span>
          <span className="card-arrow">↗</span>
        </div>
      </div>
    </article>
  )
}

export default MovieCard
