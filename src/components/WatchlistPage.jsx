
import { useMemo, useState } from 'react'

import {
  Bookmark,
  CheckCircle2,
  Play,
  Clock3,
  Search,
  ArrowUpDown,
  Sparkles,
  Clapperboard,
  ArrowRight,
  X
} from 'lucide-react'

import MovieCard from './MovieCard'
import '../styles/CollectionPages.css'

const SEKMELER = [
  { id: 'hepsi', label: 'Tümü' },
  { id: 'izleyecek', label: 'İzleyeceklerim' },
  { id: 'izliyorum', label: 'İzliyorum' },
  { id: 'izledim', label: 'İzledim' }
]

function WatchlistPage({
  izlemeListesi = [],
  kartOzellikleri,
  detayAc,
  kesfeteGit
}) {
  const [aktifFiltre, setAktifFiltre] = useState('hepsi')
  const [arama, setArama] = useState('')
  const [siralama, setSiralama] = useState('yeni')

  const sayilar = useMemo(() => {
    return {
      hepsi: izlemeListesi.length,
      izleyecek: izlemeListesi.filter(
        (film) => film.durum === 'izleyecek'
      ).length,
      izliyorum: izlemeListesi.filter(
        (film) => film.durum === 'izliyorum'
      ).length,
      izledim: izlemeListesi.filter(
        (film) => film.durum === 'izledim'
      ).length
    }
  }, [izlemeListesi])

  const filtrelenmisFilmler = useMemo(() => {
    const aranan = arama.trim().toLocaleLowerCase('tr-TR')

    const sonuc = izlemeListesi.filter((film) => {
      const durumUyuyor =
        aktifFiltre === 'hepsi' ||
        film.durum === aktifFiltre

      const adUyuyor =
        !aranan ||
        (film.ad || '')
          .toLocaleLowerCase('tr-TR')
          .includes(aranan)

      return durumUyuyor && adUyuyor
    })

    return [...sonuc].sort((a, b) => {
      if (siralama === 'eski') {
        return (
          izlemeListesi.indexOf(a) -
          izlemeListesi.indexOf(b)
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

      return (
        izlemeListesi.indexOf(b) -
        izlemeListesi.indexOf(a)
      )
    })
  }, [izlemeListesi, aktifFiltre, arama, siralama])

  const tamamenBos = izlemeListesi.length === 0

  return (
    <div className="collection-page">
      {/* SAYFA BASLIGI */}

      <header className="collection-hero watchlist-hero">
        <div className="collection-hero-icon">
          <Bookmark size={32} strokeWidth={1.8} />
        </div>

        <div className="collection-hero-content">
          <span className="collection-eyebrow">
            <Sparkles size={14} />
            KİŞİSEL KOLEKSİYONUN
          </span>

          <h1>İzleme Listem</h1>

          <p>
            İzlemek istediklerin, izlediklerin ve
            yarım kalan hikâyelerin tek yerde.
          </p>
        </div>

        <Clapperboard
          className="collection-hero-decoration"
          size={120}
          strokeWidth={1}
        />
      </header>

      {/* ISTATISTIK KARTLARI */}

      <div className="collection-stats">
        <div className="collection-stat-card">
          <span className="collection-stat-icon purple">
            <Clock3 size={22} />
          </span>

          <strong>{sayilar.izleyecek}</strong>
          <span>İzleyeceklerim</span>
        </div>

        <div className="collection-stat-card">
          <span className="collection-stat-icon orange">
            <Play size={22} />
          </span>

          <strong>{sayilar.izliyorum}</strong>
          <span>İzliyorum</span>
        </div>

        <div className="collection-stat-card">
          <span className="collection-stat-icon green">
            <CheckCircle2 size={22} />
          </span>

          <strong>{sayilar.izledim}</strong>
          <span>İzledim</span>
        </div>
      </div>

      {/* FILTRE VE ARAMA */}

      <section className="collection-content">
        <div className="collection-section-heading">
          <div>
            <span className="collection-section-eyebrow">
              BENİM LİSTEM
            </span>

            <h2>
              <Bookmark size={23} />
              Koleksiyonum
            </h2>
          </div>

          <span className="collection-result-count">
            {filtrelenmisFilmler.length} yapım
          </span>
        </div>

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

        <div className="collection-toolbar">
          <div className="collection-search">
            <Search size={19} />

            <input
              type="search"
              placeholder="Listemde ara..."
              aria-label="İzleme listemde ara"
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
              aria-label="İzleme listesi sıralaması"
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

              <option value="ad">
                İsme Göre (A-Z)
              </option>
            </select>
          </div>
        </div>

        {/* BOS LISTE */}

        {tamamenBos ? (
          <div className="collection-empty">
            <div className="collection-empty-icon">
              <Bookmark size={36} />
            </div>

            <h3>İzleme listen henüz boş!</h3>

            <p>
              Keşfet bölümünden film ve dizileri
              listene ekleyerek kendi koleksiyonunu
              oluşturmaya başlayabilirsin.
            </p>

            <button
              type="button"
              className="collection-discover-btn"
              onClick={kesfeteGit}
            >
              Keşfetmeye Başla
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
              Bu filtrelere uygun bir film veya
              dizi bulunmuyor.
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

export default WatchlistPage
