
import { useEffect, useState } from 'react'

import {
  X,
  Heart,
  Star,
  Clock3,
  CalendarDays,
  Play,
  Clapperboard,
  Tv,
  Bookmark,
  Check,
  ExternalLink
} from 'lucide-react'

import {
  detayGetir,
  fragmanGetir
} from '../services/tmdb'

import '../styles/MovieDetails.css'

function MovieDetails({
  film,
  kapat,
  favoriMi,
  favoriDegistir,
  izlemeDurumuGetir,
  izlemeDurumuDegistir,
  kisiselPuanGetir,
  kisiselPuanDegistir
}) {
  const [detay, setDetay] = useState(null)
  const [fragman, setFragman] = useState(null)
  const [fragmanAcik, setFragmanAcik] = useState(false)
  const [yukleniyor, setYukleniyor] = useState(true)
  const [hata, setHata] = useState('')
  const [hoverPuan, setHoverPuan] = useState(0)

  const mediaType = film.mediaType || 'movie'

  useEffect(() => {
    let aktif = true

    async function bilgileriGetir() {
      setYukleniyor(true)
      setHata('')
      setDetay(null)
      setFragman(null)
      setFragmanAcik(false)
      setHoverPuan(0)

      const [detaySonucu, fragmanSonucu] =
        await Promise.allSettled([
          detayGetir(film.id, mediaType),
          fragmanGetir(film.id, mediaType)
        ])

      if (!aktif) return

      if (detaySonucu.status === 'fulfilled') {
        setDetay(detaySonucu.value)
      } else {
        setHata('Ek detaylar yüklenemedi.')
      }

      if (fragmanSonucu.status === 'fulfilled') {
        setFragman(fragmanSonucu.value)
      }

      setYukleniyor(false)
    }

    bilgileriGetir()

    return () => {
      aktif = false
    }
  }, [film.id, mediaType])

  useEffect(() => {
    const eskiOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const tusKontrol = (e) => {
      if (e.key === 'Escape') {
        kapat()
      }
    }

    window.addEventListener('keydown', tusKontrol)

    return () => {
      document.body.style.overflow = eskiOverflow
      window.removeEventListener('keydown', tusKontrol)
    }
  }, [kapat])

  const favori = favoriMi(film)
  const izlemeDurumu = izlemeDurumuGetir(film)
  const benimPuanim = Number(kisiselPuanGetir(film)) || 0

  const aktifPuan = hoverPuan || benimPuanim

  const oyuncular = detay?.credits?.cast?.slice(0, 12) || []

  const yonetmenler =
    detay?.credits?.crew
      ?.filter((kisi) => kisi.job === 'Director')
      .map((kisi) => kisi.name) || []

  const olusturucular =
    detay?.created_by?.map((kisi) => kisi.name) || []

  const yoneticiListesi =
    mediaType === 'movie'
      ? yonetmenler
      : olusturucular

  const sure =
    mediaType === 'movie'
      ? detay?.runtime
      : detay?.episode_run_time?.[0]

  const arkaPlan = detay?.backdrop_path
    ? `https://image.tmdb.org/t/p/original${detay.backdrop_path}`
    : film.arkaPlan

  const afis = detay?.poster_path
    ? `https://image.tmdb.org/t/p/w500${detay.poster_path}`
    : film.afis

  const baslik =
    detay?.title || detay?.name || film.ad

  const aciklama =
    detay?.overview || film.aciklama

  const tarih =
    detay?.release_date ||
    detay?.first_air_date ||
    film.yil

  const turler = detay?.genres || []

  const izlemeSecenekleri = [
    { value: '', label: 'Listeme Ekle' },
    { value: 'izleyecek', label: 'İzleyeceklerim' },
    { value: 'izliyorum', label: 'İzliyorum' },
    { value: 'izledim', label: 'İzledim' }
  ]

  const puanVer = (puan) => {
    kisiselPuanDegistir(film, puan)
    setHoverPuan(0)
  }

  return (
    <div
      className="details-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) kapat()
      }}
    >
      <section
        className="details-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`${baslik} detayları`}
      >
        <button
          type="button"
          className="details-close"
          onClick={kapat}
          aria-label="Detayları kapat"
        >
          <X size={24} />
        </button>

        <div
          className="details-backdrop"
          style={{
            backgroundImage: arkaPlan
              ? `linear-gradient(0deg, #15111d 0%, rgba(21,17,29,.55) 55%, rgba(21,17,29,.12) 100%), url("${arkaPlan}")`
              : 'linear-gradient(135deg, #372149, #15111d)'
          }}
        />

        <div className="details-body">
          <div className="details-hero-layout">
            <div className="details-poster">
              {afis ? (
                <img src={afis} alt={`${baslik} afişi`} />
              ) : (
                <Clapperboard size={50} />
              )}
            </div>

            <div className="details-primary">
              <span className="details-category">
                {mediaType === 'tv' ? (
                  <Tv size={15} />
                ) : (
                  <Clapperboard size={15} />
                )}
                {mediaType === 'tv' ? 'Dizi' : 'Film'}
              </span>

              <h2>{baslik}</h2>

              {detay?.tagline && (
                <p className="details-tagline">
                  {detay.tagline}
                </p>
              )}

              <div className="details-meta">
                <span>
                  <CalendarDays size={16} />
                  {tarih?.slice(0, 4)}
                </span>

                <span>
                  <Star size={16} fill="currentColor" />
                  TMDB: {film.puan}/10
                </span>

                {sure > 0 && (
                  <span>
                    <Clock3 size={16} />
                    {sure} dakika
                  </span>
                )}

                {mediaType === 'tv' &&
                  detay?.number_of_seasons && (
                    <span>
                      {detay.number_of_seasons} sezon
                    </span>
                  )}
              </div>

              {turler.length > 0 && (
                <div className="details-genres">
                  {turler.map((tur) => (
                    <span key={tur.id}>{tur.name}</span>
                  ))}
                </div>
              )}

              <div className="details-actions">
                <button
                  type="button"
                  className={`details-action-btn ${
                    favori ? 'is-favorite' : ''
                  }`}
                  onClick={() => favoriDegistir(film)}
                >
                  <Heart
                    size={18}
                    fill={favori ? 'currentColor' : 'none'}
                  />
                  {favori
                    ? 'Favorilerden Çıkar'
                    : 'Favorilere Ekle'}
                </button>

                <div className="details-select-wrap">
                  <Bookmark size={17} />

                  <select
                    aria-label="İzleme durumunu değiştir"
                    value={izlemeDurumu}
                    onChange={(e) =>
                      izlemeDurumuDegistir(
                        film,
                        e.target.value
                      )
                    }
                  >
                    {izlemeSecenekleri.map((secenek) => (
                      <option
                        key={secenek.value}
                        value={secenek.value}
                      >
                        {secenek.label}
                      </option>
                    ))}
                  </select>
                </div>

                {izlemeDurumu && (
                  <button
                    type="button"
                    className="details-remove-btn"
                    onClick={() =>
                      izlemeDurumuDegistir(film, '')
                    }
                  >
                    <X size={15} />
                    Listeden Çıkar
                  </button>
                )}
              </div>

              {/* YENİ 10 YILDIZLI PUANLAMA */}
              <div className="details-rating-card">
                <div className="rating-card-header">
                  <div className="rating-card-title">
                    <Star size={19} />
                    <span>Benim Puanım</span>
                  </div>

                  <span className="rating-card-score">
                    {benimPuanim
                      ? `${benimPuanim}/10`
                      : '—/10'}
                  </span>
                </div>

                <div
                  className="rating-stars"
                  role="group"
                  aria-label="10 üzerinden kişisel puan"
                  onMouseLeave={() => setHoverPuan(0)}
                >
                  {Array.from(
                    { length: 10 },
                    (_, index) => index + 1
                  ).map((puan) => (
                    <button
                      key={puan}
                      type="button"
                      className={`rating-star ${
                        puan <= aktifPuan ? 'filled' : ''
                      }`}
                      onMouseEnter={() =>
                        setHoverPuan(puan)
                      }
                      onFocus={() =>
                        setHoverPuan(puan)
                      }
                      onBlur={() => setHoverPuan(0)}
                      onClick={() => puanVer(puan)}
                      aria-label={`${puan} üzerinden 10 puan ver`}
                      aria-pressed={benimPuanim === puan}
                      title={`${puan}/10`}
                    >
                      <Star
                        size={27}
                        strokeWidth={1.8}
                        fill={
                          puan <= aktifPuan
                            ? 'currentColor'
                            : 'none'
                        }
                      />
                    </button>
                  ))}
                </div>

                <div className="rating-card-bottom">
                  <span>
                    {hoverPuan
                      ? `${hoverPuan}/10 puan vermek için tıkla`
                      : benimPuanim
                        ? 'Puanın kaydedildi ✨'
                        : 'Yıldızlara tıklayarak puan ver'}
                  </span>

                  {benimPuanim > 0 && (
                    <button
                      type="button"
                      className="rating-clear"
                      onClick={() =>
                        kisiselPuanDegistir(film, '')
                      }
                    >
                      <X size={14} />
                      Puanı Kaldır
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h3>Konusu</h3>
            <p className="details-overview">
              {aciklama || 'Açıklama bulunmuyor.'}
            </p>
          </div>

          {yoneticiListesi.length > 0 && (
            <div className="details-section">
              <h3>
                {mediaType === 'movie'
                  ? 'Yönetmen'
                  : 'Yapımcı / Oluşturucu'}
              </h3>

              <p>{yoneticiListesi.join(', ')}</p>
            </div>
          )}

          {oyuncular.length > 0 && (
            <div className="details-section">
              <h3>Oyuncu Kadrosu</h3>

              <div className="cast-grid">
                {oyuncular.map((oyuncu) => (
                  <div
                    className="cast-card"
                    key={oyuncu.id}
                  >
                    <div className="cast-photo">
                      {oyuncu.profile_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w185${oyuncu.profile_path}`}
                          alt={oyuncu.name}
                          loading="lazy"
                        />
                      ) : (
                        <span>👤</span>
                      )}
                    </div>

                    <strong>{oyuncu.name}</strong>
                    <span>{oyuncu.character}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {fragman && (
            <div className="details-section">
              <h3>Resmî Fragman / Video</h3>

              {!fragmanAcik ? (
                <button
                  type="button"
                  className="trailer-preview"
                  onClick={() => setFragmanAcik(true)}
                  style={{
                    backgroundImage: arkaPlan
                      ? `linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.65)), url("${arkaPlan}")`
                      : undefined
                  }}
                >
                  <span className="trailer-play">
                    <Play size={28} fill="currentColor" />
                  </span>

                  <span>Fragmanı İzle</span>
                </button>
              ) : (
                <div className="trailer-frame">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${fragman}?autoplay=1`}
                    title={`${baslik} fragmanı`}
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              <a
                className="trailer-external"
                href={`https://www.youtube.com/watch?v=${fragman}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                YouTube'da Aç
                <ExternalLink size={15} />
              </a>
            </div>
          )}

          {yukleniyor && (
            <p className="details-loading">
              Ek bilgiler yükleniyor...
            </p>
          )}

          {hata && (
            <p className="details-loading">{hata}</p>
          )}

          <div className="details-bottom">
            <Check size={16} />
            Film ve dizi bilgileri TMDB tarafından sağlanır.
          </div>
        </div>
      </section>
    </div>
  )
}

export default MovieDetails
