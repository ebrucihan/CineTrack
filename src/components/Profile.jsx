
import { useState } from 'react'

import {
  UserRound,
  Film,
  Tv,
  Heart,
  Bookmark,
  Play,
  CheckCircle2,
  Star,
  Trophy,
  Target,
  Pencil,
  Check,
  X,
  TrendingUp,
  Sparkles,
  Clapperboard
} from 'lucide-react'

import '../styles/Profile.css'

const HEDEF_STORAGE_KEY = 'cinetrack-izleme-hedefi'

function hedefiOku() {
  try {
    const kayit = localStorage.getItem(HEDEF_STORAGE_KEY)

    if (kayit === null) return 50

    const hedef = Number(kayit)

    return Number.isInteger(hedef) &&
      hedef >= 1 &&
      hedef <= 10000
      ? hedef
      : 50
  } catch {
    return 50
  }
}

function Profile({
  favoriler = [],
  izlemeListesi = [],
  kisiselPuanlar = [],
  detayAc
}) {
  const [izlemeHedefi, setIzlemeHedefi] = useState(hedefiOku)
  const [hedefDuzenleniyor, setHedefDuzenleniyor] = useState(false)
  const [hedefGirisi, setHedefGirisi] = useState('')
  const [hedefHatasi, setHedefHatasi] = useState('')

  const izlediklerim = izlemeListesi.filter(
    (film) => film.durum === 'izledim'
  )

  const izliyorum = izlemeListesi.filter(
    (film) => film.durum === 'izliyorum'
  )

  const izleyeceklerim = izlemeListesi.filter(
    (film) => film.durum === 'izleyecek'
  )

  const izlenenFilmler = izlediklerim.filter(
    (film) => film.mediaType === 'movie'
  )

  const izlenenDiziler = izlediklerim.filter(
    (film) => film.mediaType === 'tv'
  )

  const puanlar = kisiselPuanlar
    .map((kayit) => Number(kayit.puan))
    .filter(
      (puan) =>
        Number.isFinite(puan) &&
        puan >= 1 &&
        puan <= 10
    )

  const ortalamaPuan = puanlar.length
    ? (
        puanlar.reduce((toplam, puan) => toplam + puan, 0) /
        puanlar.length
      ).toFixed(1)
    : '—'

  const filmHaritasi = new Map()

  ;[...izlemeListesi, ...favoriler].forEach((film) => {
    if (!film?.id || !film?.mediaType) return

    filmHaritasi.set(
      `${film.mediaType}-${film.id}`,
      film
    )
  })

  const enYuksekPuanlilar = kisiselPuanlar
    .map((kayit) => {
      const film = filmHaritasi.get(kayit.anahtar)
      const puan = Number(kayit.puan)

      if (
        !film ||
        !Number.isFinite(puan) ||
        puan < 1 ||
        puan > 10
      ) {
        return null
      }

      return {
        ...film,
        benimPuanim: puan
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.benimPuanim - a.benimPuanim)
    .slice(0, 5)

  const toplamIzlenen = izlediklerim.length

  const filmYuzdesi = toplamIzlenen
    ? (izlenenFilmler.length / toplamIzlenen) * 100
    : 0

  const diziYuzdesi = toplamIzlenen
    ? (izlenenDiziler.length / toplamIzlenen) * 100
    : 0

  const hedefYuzdesi = Math.min(
    (toplamIzlenen / izlemeHedefi) * 100,
    100
  )

  const kalanYapim = Math.max(
    izlemeHedefi - toplamIzlenen,
    0
  )

  const hedefTamamlandi = toplamIzlenen >= izlemeHedefi

  const durumlar = [
    {
      ad: 'İzledim',
      sayi: izlediklerim.length,
      icon: CheckCircle2,
      renk: '#ae7aff',
      className: 'watched'
    },
    {
      ad: 'İzliyorum',
      sayi: izliyorum.length,
      icon: Play,
      renk: '#f5ad71',
      className: 'watching'
    },
    {
      ad: 'İzleyeceklerim',
      sayi: izleyeceklerim.length,
      icon: Bookmark,
      renk: '#67c8e9',
      className: 'planned'
    }
  ]

  const toplamListem = izlemeListesi.length

  const istatistikler = [
    {
      baslik: 'İzlediklerim',
      deger: toplamIzlenen,
      icon: CheckCircle2,
      className: 'purple'
    },
    {
      baslik: 'Favorilerim',
      deger: favoriler.length,
      icon: Heart,
      className: 'pink'
    },
    {
      baslik: 'İzleyeceklerim',
      deger: izleyeceklerim.length,
      icon: Bookmark,
      className: 'blue'
    },
    {
      baslik: 'İzliyorum',
      deger: izliyorum.length,
      icon: Play,
      className: 'orange'
    },
    {
      baslik: 'Ortalama Puanım',
      deger: ortalamaPuan,
      icon: Star,
      className: 'yellow'
    },
    {
      baslik: 'Puanladıklarım',
      deger: puanlar.length,
      icon: Clapperboard,
      className: 'purple'
    }
  ]

  const hedefDuzenle = () => {
    setHedefGirisi(String(izlemeHedefi))
    setHedefHatasi('')
    setHedefDuzenleniyor(true)
  }

  const hedefKaydet = (event) => {
    event.preventDefault()

    const yeniHedef = Number(hedefGirisi)

    if (
      !Number.isInteger(yeniHedef) ||
      yeniHedef < 1 ||
      yeniHedef > 10000
    ) {
      setHedefHatasi(
        'Lütfen 1 ile 10000 arasında tam sayı gir.'
      )
      return
    }

    try {
      localStorage.setItem(
        HEDEF_STORAGE_KEY,
        String(yeniHedef)
      )

      setIzlemeHedefi(yeniHedef)
      setHedefDuzenleniyor(false)
      setHedefHatasi('')
    } catch {
      setHedefHatasi(
        'Hedef kaydedilemedi. Tarayıcı depolamasını kontrol et.'
      )
    }
  }

  return (
    <div className="profile-page">
      {/* PROFİL BAŞLIĞI */}
      <header className="profile-hero">
        <div className="profile-avatar">
          <UserRound size={38} strokeWidth={1.7} />
        </div>

        <div className="profile-hero-content">
          <span className="profile-eyebrow">
            <Sparkles size={14} />
            KİŞİSEL SİNEMA ALANIN
          </span>

          <h1>Benim Sinema Dünyam</h1>

          <p>
            İzlediğin hikâyeler, favorilerin ve
            sinema yolculuğun burada.
          </p>
        </div>

        <div className="profile-hero-decoration">
          <Film size={65} strokeWidth={1} />
        </div>
      </header>

      {/* İSTATİSTİK KARTLARI */}
      <section className="profile-section">
        <div className="profile-heading">
          <div>
            <span className="profile-heading-eyebrow">
              GENEL BAKIŞ
            </span>

            <h2>
              <TrendingUp size={23} />
              İzleme İstatistiklerim
            </h2>
          </div>
        </div>

        <div className="profile-stats">
          {istatistikler.map((item) => {
            const Icon = item.icon

            return (
              <div
                className={`stat-card stat-${item.className}`}
                key={item.baslik}
              >
                <div className="stat-icon">
                  <Icon size={23} strokeWidth={1.9} />
                </div>

                <strong className="stat-value">
                  {item.deger}
                </strong>

                <span className="stat-label">
                  {item.baslik}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* İZLEME HEDEFİ */}
      <section className="profile-goal-section">
        <div className="profile-goal-top">
          <div className="profile-goal-title">
            <div className="profile-goal-icon">
              <Target size={25} />
            </div>

            <div>
              <span className="profile-heading-eyebrow">
                KENDİ HEDEFİNİ BELİRLE
              </span>

              <h2>İzleme Hedefim</h2>
            </div>
          </div>

          <button
            type="button"
            className="profile-goal-edit"
            onClick={hedefDuzenle}
            aria-label="İzleme hedefini düzenle"
          >
            <Pencil size={16} />
            Hedefi Düzenle
          </button>
        </div>

        {hedefDuzenleniyor ? (
          <form
            className="profile-goal-form"
            onSubmit={hedefKaydet}
          >
            <label htmlFor="profile-goal-input">
              Kaç film veya dizi izlemek istiyorsun?
            </label>

            <div className="profile-goal-form-row">
              <input
                id="profile-goal-input"
                type="number"
                min="1"
                max="10000"
                step="1"
                value={hedefGirisi}
                onChange={(event) => {
                  setHedefGirisi(event.target.value)
                  setHedefHatasi('')
                }}
                autoFocus
              />

              <button
                type="submit"
                className="profile-goal-save"
              >
                <Check size={17} />
                Kaydet
              </button>

              <button
                type="button"
                className="profile-goal-cancel"
                onClick={() => {
                  setHedefDuzenleniyor(false)
                  setHedefHatasi('')
                }}
                aria-label="Düzenlemeyi iptal et"
              >
                <X size={18} />
              </button>
            </div>

            {hedefHatasi && (
              <p className="profile-goal-error">
                {hedefHatasi}
              </p>
            )}
          </form>
        ) : (
          <>
            <div className="profile-goal-numbers">
              <div>
                <strong>{toplamIzlenen}</strong>
                <span> / {izlemeHedefi} yapım</span>
              </div>

              <span className="profile-goal-percent">
                %{Math.round(hedefYuzdesi)}
              </span>
            </div>

            <div
              className="profile-goal-progress"
              role="progressbar"
              aria-label="İzleme hedefi ilerlemesi"
              aria-valuemin={0}
              aria-valuemax={izlemeHedefi}
              aria-valuenow={Math.min(
                toplamIzlenen,
                izlemeHedefi
              )}
            >
              <div
                className="profile-goal-progress-fill"
                style={{
                  width: `${hedefYuzdesi}%`
                }}
              />
            </div>

            <p className="profile-goal-message">
              {hedefTamamlandi ? (
                <>
                  <Trophy size={17} />
                  Harika! İzleme hedefine ulaştın!
                </>
              ) : (
                <>
                  <Sparkles size={17} />
                  Hedefine ulaşmak için {kalanYapim} yapım
                  daha izle!
                </>
              )}
            </p>
          </>
        )}

        <p className="profile-goal-note">
          Hedef, izleme listende “İzledim” olarak
          işaretlediğin toplam yapımları sayar.
        </p>
      </section>

      {/* GRAFİKLER */}
      <div className="profile-panels">
        <section className="profile-panel">
          <div className="profile-panel-heading">
            <Film size={21} />
            <h2>Film / Dizi Dağılımım</h2>
          </div>

          {toplamIzlenen > 0 ? (
            <div className="profile-distribution">
              <div
                className="profile-donut"
                style={{
                  background: `conic-gradient(
                    #b77af2 0% ${filmYuzdesi}%,
                    #67a0ee ${filmYuzdesi}% 100%
                  )`
                }}
                role="img"
                aria-label={
                  `${izlenenFilmler.length} film, ` +
                  `${izlenenDiziler.length} dizi`
                }
              >
                <div className="profile-donut-center">
                  <strong>{toplamIzlenen}</strong>
                  <span>İzlenen</span>
                </div>
              </div>

              <div className="profile-legend">
                <div className="profile-legend-item">
                  <span className="profile-legend-dot movie" />

                  <div>
                    <span>Filmler</span>
                    <strong>
                      {izlenenFilmler.length}
                      <small>
                        %{Math.round(filmYuzdesi)}
                      </small>
                    </strong>
                  </div>
                </div>

                <div className="profile-legend-item">
                  <span className="profile-legend-dot tv" />

                  <div>
                    <span>Diziler</span>
                    <strong>
                      {izlenenDiziler.length}
                      <small>
                        %{Math.round(diziYuzdesi)}
                      </small>
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="profile-empty-state">
              <Film size={32} />
              <p>
                Henüz izlediğin bir yapım yok.
                İzlediklerini işaretlediğinde
                dağılımın burada görünecek.
              </p>
            </div>
          )}
        </section>

        <section className="profile-panel">
          <div className="profile-panel-heading">
            <Bookmark size={21} />
            <h2>İzleme Durumlarım</h2>
          </div>

          <p className="profile-panel-description">
            Listendeki yapımların mevcut durumu
          </p>

          <div className="profile-watch-bars">
            {durumlar.map((durum) => {
              const Icon = durum.icon

              const yuzde = toplamListem
                ? (durum.sayi / toplamListem) * 100
                : 0

              return (
                <div
                  className="profile-watch-item"
                  key={durum.ad}
                >
                  <div className="profile-watch-label">
                    <span>
                      <Icon
                        size={16}
                        style={{ color: durum.renk }}
                      />
                      {durum.ad}
                    </span>

                    <strong>{durum.sayi}</strong>
                  </div>

                  <div className="profile-watch-track">
                    <div
                      className={`profile-watch-fill ${durum.className}`}
                      style={{
                        width: `${yuzde}%`
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="profile-watch-total">
            <span>Toplam listemde</span>
            <strong>{toplamListem} yapım</strong>
          </div>
        </section>
      </div>

      {/* EN YÜKSEK PUANLILAR */}
      <section className="profile-top-rated">
        <div className="profile-heading">
          <div>
            <span className="profile-heading-eyebrow">
              KİŞİSEL FAVORİLER
            </span>

            <h2>
              <Trophy size={24} />
              En Yüksek Puanladıklarım
            </h2>
          </div>
        </div>

        {enYuksekPuanlilar.length > 0 ? (
          <div className="top-rated-grid">
            {enYuksekPuanlilar.map((film, index) => (
              <button
                type="button"
                className="top-rated-card"
                key={`${film.mediaType}-${film.id}`}
                onClick={() => detayAc(film)}
                aria-label={
                  `${film.ad}, ${film.benimPuanim} puan, ` +
                  'detayları aç'
                }
              >
                <div className="top-rated-poster">
                  {film.afis ? (
                    <img
                      src={film.afis}
                      alt={`${film.ad} afişi`}
                      loading="lazy"
                    />
                  ) : (
                    <div className="top-rated-placeholder">
                      {film.mediaType === 'tv' ? (
                        <Tv size={36} />
                      ) : (
                        <Clapperboard size={36} />
                      )}
                    </div>
                  )}

                  <span className="top-rated-rank">
                    #{index + 1}
                  </span>

                  <span className="top-rated-score">
                    <Star size={14} fill="currentColor" />
                    {film.benimPuanim}/10
                  </span>
                </div>

                <div className="top-rated-info">
                  <strong>{film.ad}</strong>

                  <span>
                    {film.mediaType === 'tv'
                      ? 'Dizi'
                      : 'Film'}
                    {film.yil ? ` • ${film.yil}` : ''}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="profile-empty-state">
            <Star size={34} />

            <p>
              Henüz puanladığın bir film veya dizi yok.
              Keşfet bölümünden ilk puanını verebilirsin!
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

export default Profile
