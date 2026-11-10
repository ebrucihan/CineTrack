
import { useMemo, useState } from 'react'

import {
  Heart,
  Film,
  Tv,
  Search,
  ArrowUpDown,
  Sparkles,
  ArrowRight,
  X,
  Star
} from 'lucide-react'

import MovieCard from './MovieCard'
import '../styles/CollectionPages.css'

const SEKMELER = [
  { id: 'hepsi', label: 'Tümü' },
  { id: 'movie', label: 'Filmler' },
  { id: 'tv', label: 'Diziler' }
]

function FavoritesPage({
  favoriler = [],
  kartOzellikleri,
  detayAc,
  kesfeteGit
}) {
  const [aktifFiltre, setAktifFiltre] = useState('hepsi')
  const [arama, setArama] = useState('')
  const [siralama, setSiralama] = useState('yeni')

  // FAVORI SAYILARI

  const sayilar = useMemo(() => {
    return {
      hepsi: favoriler.length,
      movie: favoriler.filter(
        (film) => film.mediaType === 'movie'
      ).length,
      tv: favoriler.filter(
        (film) => film.mediaType === 'tv'
      ).length
    }
  }, [favoriler])

  // FILTRELEME VE SIRALAMA

  const filtrelenmisFilmler = useMemo(() => {
    const aranan = arama
      .trim()
      .toLocaleLowerCase('tr-TR')

    const sonuc = favoriler.filter((film) => {
      const turUyuyor =
        aktifFiltre === 'hepsi' ||
        film.mediaType === aktifFiltre

      const adUyuyor =
        !aranan ||
        (film.ad || '')
          .toLocaleLowerCase('tr-TR')
          .includes(aranan)

      return turUyuyor && adUyuyor
    })

    return [...sonuc].sort((a, b) => {
      if (siralama === 'eski') {
        return (
          favoriler.indexOf(a) -
          favoriler.indexOf(b)
        )
      }

      if (siralama === 'puan') {
        return (
          Number(b.puan || 0) -
          Number(a.puan || 0)
        )
      }

      if (siralama === 'ad') {
        return (a.ad || '').localeCompare(
          b.ad || '',
          'tr-TR'
        )
      }

      if (siralama === 'yil') {
        return (
          Number(b.yil || 0) -
          Number(a.yil || 0)
        )
      }

      // SON EKLENENLER
      return (
        favoriler.indexOf(b) -
        favoriler.indexOf(a)
      )
    })
  }, [favoriler, aktifFiltre, arama, siralama])

  const tamamenBos = favoriler.length === 0

  return (
    <div className="collection-page favorites-page">
      {/* FAVORILERIM HERO */}

      <header className="collection-hero favorites-hero">
        <div className="collection-hero-icon">
          <Heart
            size={32}
            strokeWidth={1.8}
            fill="rgba(255, 131, 178, 0.18)"
          />
        </div>

        <div className="collection-hero-content">
          <span className="collection-eyebrow">
            <Sparkles size={14} />
            EN SEVDİĞİN HİKÂYELER
          </span>

          <h1>Favorilerim</h1>

          <p>
            Kalbinde yer eden filmler ve diziler.
            En sevdiğin hikâyeleri burada biriktir.
          </p>
        </div>

        <Heart
          className="collection-hero-decoration"
          size={120}
          strokeWidth={1}
        />
      </header>

      {/* ISTATISTIK KARTLARI */}

      <div className="collection-stats">
        <div className="collection-stat-card">
          <span className="collection-stat-icon pink">
            <Heart size={22} />
          </span>

          <strong>{sayilar.hepsi}</strong>
          <span>Toplam Favorim</span>
        </div>

        <div className="collection-stat-card">
          <span className="collection-stat-icon purple">
            <Film size={22} />
          </span>

          <strong>{sayilar.movie}</strong>
          <span>Favori Filmlerim</span>
        </div>

        <div className="collection-stat-card">
          <span className="collection-stat-icon blue">
            <Tv size={22} />
          </span>

          <strong>{sayilar.tv}</strong>
          <span>Favori Dizilerim</span>
        </div>
      </div>

      {/* KOLEKSIYON */}

      <section className="collection-content">
        <div className="collection-section-heading">
          <div>
            <span className="collection-section-eyebrow">
              BENİM FAVORİLERİM
            </span>

            <h2>
              <Heart size={23} />
              Favori Koleksiyonum
            </h2>
          </div>

          <span className="collection-result-count">
            {filtrelenmisFilmler.length} yapım
          </span>
        </div>

        {/* FILM / DIZI SEKMELERI */}

        <div className="collection-tabs">
          {SEKMELER.map((sekme) => (
            <button
              key={sekme.id}
              type="button"
              className={
                aktifFiltre === sekme.id ? 'active' : ''
              }
              onClick={() => setAktifFiltre(sekme.id)}
            >
              {sekme.label}

              <span>{sayilar[sekme.id]}</span>
            </button>
          ))}
        </div>

        {/* ARAMA VE SIRALAMA */}

        <div className="collection-toolbar">
          <div className="collection-search">
            <Search size={19} />

            <input
              type="search"
              placeholder="Favorilerimde ara..."
              aria-label="Favorilerimde ara"
              value={arama}
              onChange={(e) => setArama(e.target.value)}
            />

            {arama && (
              <button
                type="button"
                onClick={() => setArama('')}
                aria-label="Aramayı temizle"
              >
                <X size={17} />
              </button>
            )}
          </div>

          <div className="collection-sort">
            <ArrowUpDown size={18} />

            <select
              aria-label="Favori sıralaması"
              value={siralama}
              onChange={(e) =>
                setSiralama(e.target.value)
              }
            >
              <option value="yeni">
                Son Eklenenler
              </option>

              <option value="eski">
                İlk Eklenenler
              </option>

              <option value="puan">
                TMDB Puanı
              </option>

              <option value="yil">
                En Yeni Yapımlar
              </option>

              <option value="ad">
                İsme Göre (A-Z)
              </option>
            </select>
          </div>
        </div>

        {/* FAVORI LISTESI BOSSA */}

        {tamamenBos ? (
          <div className="collection-empty">
            <div className="collection-empty-icon">
              <Heart size={36} />
            </div>

            <h3>Henüz favorin yok!</h3>

            <p>
              Seni etkileyen film ve dizileri
              favorilerine ekleyerek kendi özel
              koleksiyonunu oluşturmaya başla.
            </p>

            <button
              type="button"
              className="collection-discover-btn"
              onClick={kesfeteGit}
            >
              Favorilerini Keşfet
              <ArrowRight size={18} />
            </button>
          </div>
        ) : filtrelenmisFilmler.length === 0 ? (
          <div className="collection-empty">
            <div className="collection-empty-icon">
              <Search size={32} />
            </div>

            <h3>Sonuç bulunamadı</h3>

            <p>
              Aradığın film veya dizi bu
              filtrelerde bulunmuyor.
            </p>

            <button
              type="button"
              className="collection-discover-btn"
              onClick={() => {
                setAktifFiltre('hepsi')
                setArama('')
              }}
            >
              Filtreleri Temizle
            </button>
          </div>
        ) : (
          <div className="movie-grid collection-movie-grid">
            {filtrelenmisFilmler.map((film) => (
              <MovieCard
                key={`${film.mediaType}-${film.id}`}
                film={film}
                {...kartOzellikleri}
                detayAc={detayAc}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default FavoritesPage
