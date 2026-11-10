
import { useState, useEffect, useRef } from 'react'

import Recommendations from './components/Recommendations'
import WatchlistPage from './components/WatchlistPage'
import FavoritesPage from './components/FavoritesPage'

import {
  Search,
  Clapperboard,
  Tv,
  Flame,
  Sparkles,
  Star,
  Play,
  ArrowRight,
  ArrowLeft,
  SlidersHorizontal,
  CalendarDays,
  ChevronDown,
  X
} from 'lucide-react'

import {
  kesfetGetir,
  filmDiziAra,
  turleriGetir,
  trendFilmleriGetir,
  populerDizileriGetir
} from './services/tmdb'

import Navbar from './components/Navbar'
import MovieCard from './components/MovieCard'
import MovieDetails from './components/MovieDetails'
import Profile from './components/Profile'

import './App.css'
import './styles/Profile.css'

function kayitlariOku(anahtar) {
  try {
    const veri = JSON.parse(
      localStorage.getItem(anahtar) || '[]'
    )

    return Array.isArray(veri) ? veri : []
  } catch {
    return []
  }
}

function filmAnahtari(film) {
  return `${film.mediaType}-${film.id}`
}

function filmFormatla(film) {
  const mediaType =
    film.media_type || film.mediaType || 'movie'

  return {
    id: film.id,
    mediaType,
    ad: film.title || film.name || film.ad || 'İsimsiz',
    aciklama:
      film.overview ||
      film.aciklama ||
      'Açıklama bulunmuyor.',
    yil:
      (film.release_date || film.first_air_date)
        ?.slice(0, 4) ||
      film.yil ||
      'Bilinmiyor',
    puan: Number(
      film.vote_average ?? film.puan ?? 0
    ).toFixed(1),
    tip: mediaType === 'tv' ? 'Dizi' : 'Film',
    afis: film.poster_path
      ? `https://image.tmdb.org/t/p/w500${film.poster_path}`
      : film.afis || null,
    arkaPlan: film.backdrop_path
      ? `https://image.tmdb.org/t/p/original${film.backdrop_path}`
      : film.arkaPlan || null
  }
}

function benzersizFilmler(filmler) {
  const gorulen = new Set()

  return filmler.filter((film) => {
    const anahtar = `${
      film.media_type || film.mediaType || 'movie'
    }-${film.id}`

    if (gorulen.has(anahtar)) return false

    gorulen.add(anahtar)
    return true
  })
}

function FeaturedCarousel({
  baslik,
  ustBaslik,
  Icon,
  filmler,
  kartOzellikleri,
  detayAc
}) {
  const scrollRef = useRef(null)

  const kaydir = (yon) => {
    scrollRef.current?.scrollBy({
      left: yon * 530,
      behavior: 'smooth'
    })
  }

  if (!filmler.length) return null

  return (
    <section className="featured-section">
      <div className="featured-heading">
        <div>
          <span className="section-eyebrow">
            {ustBaslik}
          </span>

          <h2>
            <Icon size={24} />
            {baslik}
          </h2>
        </div>

        <div className="carousel-controls">
          <button
            type="button"
            onClick={() => kaydir(-1)}
            aria-label={`${baslik} sola kaydır`}
          >
            <ArrowLeft size={19} />
          </button>

          <button
            type="button"
            onClick={() => kaydir(1)}
            aria-label={`${baslik} sağa kaydır`}
          >
            <ArrowRight size={19} />
          </button>
        </div>
      </div>

      <div className="featured-scroll" ref={scrollRef}>
        {filmler.slice(0, 12).map((film) => (
          <div
            className="featured-item"
            key={filmAnahtari(film)}
          >
            <MovieCard
              film={film}
              {...kartOzellikleri}
              detayAc={detayAc}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

function App() {
  const [aktifSayfa, setAktifSayfa] = useState('kesfet')
  const [seciliFilm, setSeciliFilm] = useState(null)

  const [arama, setArama] = useState('')
  const [gecikmeliArama, setGecikmeliArama] = useState('')

  const [filmler, setFilmler] = useState([])
  const [turler, setTurler] = useState([])
  const [trendFilmler, setTrendFilmler] = useState([])
  const [populerDiziler, setPopulerDiziler] = useState([])

  const [yukleniyor, setYukleniyor] = useState(true)

  const [dahaFazlaYukleniyor, setDahaFazlaYukleniyor] =
    useState(false)

  const [hata, setHata] = useState('')

  const [mediaType, setMediaType] = useState('movie')
  const [seciliTur, setSeciliTur] = useState('')
  const [siralama, setSiralama] = useState('popularity.desc')

  const [sayfa, setSayfa] = useState(1)
  const [toplamSayfa, setToplamSayfa] = useState(1)

  const istekNumarasi = useRef(0)

  const [favoriler, setFavoriler] = useState(() =>
    kayitlariOku('cinetrack-favoriler')
  )

  const [izlemeListesi, setIzlemeListesi] = useState(() =>
    kayitlariOku('cinetrack-izleme-listesi')
  )

  const [kisiselPuanlar, setKisiselPuanlar] = useState(() =>
    kayitlariOku('cinetrack-puanlar')
  )

  // KAYITLARI SAKLA

  useEffect(() => {
    localStorage.setItem(
      'cinetrack-favoriler',
      JSON.stringify(favoriler)
    )
  }, [favoriler])

  useEffect(() => {
    localStorage.setItem(
      'cinetrack-izleme-listesi',
      JSON.stringify(izlemeListesi)
    )
  }, [izlemeListesi])

  useEffect(() => {
    localStorage.setItem(
      'cinetrack-puanlar',
      JSON.stringify(kisiselPuanlar)
    )
  }, [kisiselPuanlar])

  // ARAMA GECIKMESI

  useEffect(() => {
    const zamanlayici = setTimeout(() => {
      setGecikmeliArama(arama.trim())
    }, 400)

    return () => clearTimeout(zamanlayici)
  }, [arama])

  // TREND FILMLER VE POPULER DIZILER

  useEffect(() => {
    let aktif = true

    async function anaSayfaVerileriniGetir() {
      const [trend, diziler] = await Promise.allSettled([
        trendFilmleriGetir(),
        populerDizileriGetir()
      ])

      if (!aktif) return

      if (trend.status === 'fulfilled') {
        setTrendFilmler(trend.value.map(filmFormatla))
      } else {
        console.error('Trend filmler:', trend.reason)
      }

      if (diziler.status === 'fulfilled') {
        setPopulerDiziler(diziler.value.map(filmFormatla))
      } else {
        console.error('Popüler diziler:', diziler.reason)
      }
    }

    anaSayfaVerileriniGetir()

    return () => {
      aktif = false
    }
  }, [])

  // TURLERI YUKLE

  useEffect(() => {
    let aktif = true

    async function turleriYukle() {
      try {
        const sonuc = await turleriGetir(mediaType)

        if (aktif) setTurler(sonuc)
      } catch (error) {
        console.error(error)

        if (aktif) setTurler([])
      }
    }

    turleriYukle()

    return () => {
      aktif = false
    }
  }, [mediaType])

  // KESFET VERILERINI YUKLE

  useEffect(() => {
    if (aktifSayfa !== 'kesfet') return

    let aktif = true
    const mevcutIstek = ++istekNumarasi.current

    async function verileriGetir() {
      setYukleniyor(true)
      setDahaFazlaYukleniyor(false)
      setHata('')
      setFilmler([])
      setSayfa(1)
      setToplamSayfa(1)

      try {
        let sonuc

        if (gecikmeliArama) {
          sonuc = await filmDiziAra(gecikmeliArama, 1)

          sonuc.results = sonuc.results.filter(
            (film) => film.media_type === mediaType
          )

          if (seciliTur) {
            sonuc.results = sonuc.results.filter(
              (film) =>
                film.genre_ids?.includes(Number(seciliTur))
            )
          }
        } else {
          sonuc = await kesfetGetir({
            mediaType,
            genre: seciliTur,
            sortBy: siralama,
            page: 1
          })
        }

        if (
          aktif &&
          mevcutIstek === istekNumarasi.current
        ) {
          setFilmler(
            benzersizFilmler(sonuc.results)
          )

          setToplamSayfa(
            Math.min(sonuc.totalPages || 1, 500)
          )
        }
      } catch (error) {
        if (
          aktif &&
          mevcutIstek === istekNumarasi.current
        ) {
          console.error(error)
          setHata('Film ve diziler yüklenemedi.')
        }
      } finally {
        if (
          aktif &&
          mevcutIstek === istekNumarasi.current
        ) {
          setYukleniyor(false)
        }
      }
    }

    verileriGetir()

    return () => {
      aktif = false
      istekNumarasi.current += 1
    }
  }, [
    aktifSayfa,
    gecikmeliArama,
    mediaType,
    seciliTur,
    siralama
  ])

  // DAHA FAZLA YUKLE

  const dahaFazlaYukle = async () => {
    if (
      yukleniyor ||
      dahaFazlaYukleniyor ||
      sayfa >= toplamSayfa
    ) return

    const mevcutIstek = istekNumarasi.current
    const sonrakiSayfa = sayfa + 1

    setDahaFazlaYukleniyor(true)
    setHata('')

    try {
      let sonuc

      if (gecikmeliArama) {
        sonuc = await filmDiziAra(
          gecikmeliArama,
          sonrakiSayfa
        )

        sonuc.results = sonuc.results.filter(
          (film) => film.media_type === mediaType
        )

        if (seciliTur) {
          sonuc.results = sonuc.results.filter(
            (film) =>
              film.genre_ids?.includes(Number(seciliTur))
          )
        }
      } else {
        sonuc = await kesfetGetir({
          mediaType,
          genre: seciliTur,
          sortBy: siralama,
          page: sonrakiSayfa
        })
      }

      if (mevcutIstek !== istekNumarasi.current) return

      setFilmler((onceki) =>
        benzersizFilmler([
          ...onceki,
          ...sonuc.results
        ])
      )

      setSayfa(sonrakiSayfa)

      setToplamSayfa(
        Math.min(sonuc.totalPages || 1, 500)
      )
    } catch (error) {
      if (mevcutIstek === istekNumarasi.current) {
        console.error(error)
        setHata('Yeni sonuçlar yüklenemedi.')
      }
    } finally {
      if (mevcutIstek === istekNumarasi.current) {
        setDahaFazlaYukleniyor(false)
      }
    }
  }

  // FILM / DIZI SECIMI

  const mediaTypeDegistir = (yeniTip) => {
    if (yeniTip === mediaType) return

    setMediaType(yeniTip)
    setSeciliTur('')
    setSiralama('popularity.desc')
  }

  // FAVORILER

  const favoriMi = (film) =>
    favoriler.some(
      (item) =>
        filmAnahtari(item) === filmAnahtari(film)
    )

  const favoriDegistir = (film) => {
    setFavoriler((onceki) => {
      const mevcut = onceki.some(
        (item) =>
          filmAnahtari(item) === filmAnahtari(film)
      )

      if (mevcut) {
        return onceki.filter(
          (item) =>
            filmAnahtari(item) !== filmAnahtari(film)
        )
      }

      return [...onceki, film]
    })
  }

  // IZLEME LISTESI

  const izlemeDurumuGetir = (film) => {
    const kayit = izlemeListesi.find(
      (item) =>
        filmAnahtari(item) === filmAnahtari(film)
    )

    return kayit?.durum || ''
  }

  const izlemeDurumuDegistir = (film, yeniDurum) => {
    setIzlemeListesi((onceki) => {
      const digerleri = onceki.filter(
        (item) =>
          filmAnahtari(item) !== filmAnahtari(film)
      )

      if (!yeniDurum) return digerleri

      return [
        ...digerleri,
        { ...film, durum: yeniDurum }
      ]
    })
  }

  // KISISEL PUANLAR

  const kisiselPuanGetir = (film) => {
    const kayit = kisiselPuanlar.find(
      (item) =>
        item.anahtar === filmAnahtari(film)
    )

    return kayit?.puan || ''
  }

  const kisiselPuanDegistir = (film, yeniPuan) => {
    const anahtar = filmAnahtari(film)

    setKisiselPuanlar((onceki) => {
      const digerleri = onceki.filter(
        (item) => item.anahtar !== anahtar
      )

      if (!yeniPuan) return digerleri

      return [
        ...digerleri,
        { anahtar, puan: Number(yeniPuan) }
      ]
    })

    if (yeniPuan) {
      izlemeDurumuDegistir(film, 'izledim')
    }
  }

  // ORTAK KART OZELLIKLERI

  const gosterilecekFilmler = filmler.map(filmFormatla)

  const kartOzellikleri = {
    favoriMi,
    favoriDegistir,
    izlemeDurumuGetir,
    izlemeDurumuDegistir,
    kisiselPuanGetir,
    kisiselPuanDegistir
  }

  // SINEMATIK BANNER

  const heroFilm = trendFilmler.find(
    (film) => film.arkaPlan
  )

  const heroGoster =
    aktifSayfa === 'kesfet' &&
    !gecikmeliArama &&
    Boolean(heroFilm)

  return (
    <div className="app">
      <Navbar
        aktifSayfa={aktifSayfa}
        setAktifSayfa={setAktifSayfa}
        favoriSayisi={favoriler.length}
        listeSayisi={izlemeListesi.length}
      />

      <main className="main-content">
        {aktifSayfa === 'profil' ? (
          <Profile
            favoriler={favoriler}
            izlemeListesi={izlemeListesi}
            kisiselPuanlar={kisiselPuanlar}
            detayAc={setSeciliFilm}
          />
        ) : aktifSayfa === 'listem' ? (
          <WatchlistPage
            izlemeListesi={izlemeListesi}
            kartOzellikleri={kartOzellikleri}
            detayAc={setSeciliFilm}
            kesfeteGit={() => setAktifSayfa('kesfet')}
          />
        ) : aktifSayfa === 'favoriler' ? (
          <FavoritesPage
            favoriler={favoriler}
            kartOzellikleri={kartOzellikleri}
            detayAc={setSeciliFilm}
            kesfeteGit={() => setAktifSayfa('kesfet')}
          />
        ) : (
          <>
            {/* SINEMATIK HERO */}

            {heroGoster && (
              <section
                className="cinematic-hero"
                style={{
                  backgroundImage: `
                    linear-gradient(
                      90deg,
                      #0b0a10 5%,
                      rgba(11,10,16,.83) 40%,
                      rgba(11,10,16,.15) 100%
                    ),
                    url("${heroFilm.arkaPlan}")
                  `
                }}
              >
                <div className="hero-content">
                  <span className="hero-eyebrow">
                    <Flame size={16} />
                    HAFTANIN ÖNE ÇIKANI
                  </span>

                  <h1>{heroFilm.ad}</h1>

                  <div className="hero-meta">
                    <span>
                      <Star size={16} />
                      {heroFilm.puan} TMDB
                    </span>

                    <span>
                      <CalendarDays size={16} />
                      {heroFilm.yil}
                    </span>

                    <span>{heroFilm.tip}</span>
                  </div>

                  <p>{heroFilm.aciklama}</p>

                  <button
                    type="button"
                    className="hero-button"
                    onClick={() => setSeciliFilm(heroFilm)}
                  >
                    <Play size={18} fill="currentColor" />
                    Detayları Gör
                    <ArrowRight size={17} />
                  </button>
                </div>
              </section>
            )}

            {/* KESFET SAYFASI */}

            {aktifSayfa === 'kesfet' && (
              <>
                {!heroGoster && (
                  <div className="discover-intro">
                    <h1>Film ve Dizilerini Keşfet</h1>

                    <p>
                      Yeni favorilerini bul, izleyeceklerini
                      kaydet ve kendi sinema dünyanı oluştur.
                    </p>
                  </div>
                )}

                {/* ONE CIKAN KOLEKSIYONLAR */}

                {!gecikmeliArama && (
                  <>
                    <FeaturedCarousel
                      baslik="Trend Filmler"
                      ustBaslik="BU HAFTA"
                      Icon={Flame}
                      filmler={trendFilmler}
                      kartOzellikleri={kartOzellikleri}
                      detayAc={setSeciliFilm}
                    />

                    <FeaturedCarousel
                      baslik="Popüler Diziler"
                      ustBaslik="EN ÇOK İLGİ GÖRENLER"
                      Icon={Tv}
                      filmler={populerDiziler}
                      kartOzellikleri={kartOzellikleri}
                      detayAc={setSeciliFilm}
                    />

                    <Recommendations
                      favoriler={favoriler}
                      izlemeListesi={izlemeListesi}
                      kisiselPuanlar={kisiselPuanlar}
                      kartOzellikleri={kartOzellikleri}
                      detayAc={setSeciliFilm}
                    />
                  </>
                )}

                {/* ARAMA VE FILTRELER */}

                <section className="discover-workspace">
                  <div className="workspace-heading">
                    <span className="section-eyebrow">
                      SANA ÖZEL KEŞİF
                    </span>

                    <h2>
                      <Sparkles size={24} />
                      Keşfet
                    </h2>
                  </div>

                  <div className="modern-search">
                    <Search size={20} />

                    <input
                      type="text"
                      placeholder="Film veya dizi ara..."
                      value={arama}
                      onChange={(e) =>
                        setArama(e.target.value)
                      }
                    />

                    {arama && (
                      <button
                        type="button"
                        onClick={() => setArama('')}
                        aria-label="Aramayı temizle"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>

                  <div className="discover-tabs">
                    <button
                      type="button"
                      className={
                        mediaType === 'movie' ? 'active' : ''
                      }
                      onClick={() =>
                        mediaTypeDegistir('movie')
                      }
                    >
                      <Clapperboard size={17} />
                      Filmler
                    </button>

                    <button
                      type="button"
                      className={
                        mediaType === 'tv' ? 'active' : ''
                      }
                      onClick={() =>
                        mediaTypeDegistir('tv')
                      }
                    >
                      <Tv size={17} />
                      Diziler
                    </button>
                  </div>

                  <div className="discover-filters">
                    <div className="filter-group">
                      <label htmlFor="genre-filter">
                        <SlidersHorizontal size={16} />
                        Tür
                      </label>

                      <select
                        id="genre-filter"
                        value={seciliTur}
                        onChange={(e) =>
                          setSeciliTur(e.target.value)
                        }
                      >
                        <option value="">
                          Tüm Türler
                        </option>

                        {turler.map((tur) => (
                          <option
                            key={tur.id}
                            value={tur.id}
                          >
                            {tur.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="filter-group">
                      <label htmlFor="sort-filter">
                        <Star size={16} />
                        Sıralama
                      </label>

                      <select
                        id="sort-filter"
                        value={siralama}
                        disabled={Boolean(gecikmeliArama)}
                        onChange={(e) =>
                          setSiralama(e.target.value)
                        }
                      >
                        <option value="popularity.desc">
                          En Popüler
                        </option>

                        <option value="vote_average.desc">
                          En Yüksek Puanlı
                        </option>

                        <option
                          value={
                            mediaType === 'movie'
                              ? 'primary_release_date.desc'
                              : 'first_air_date.desc'
                          }
                        >
                          En Yeni
                        </option>
                      </select>
                    </div>
                  </div>

                  {gecikmeliArama && (
                    <p className="search-filter-note">
                      Arama sonuçlarında film/dizi ve tür
                      filtreleri uygulanır.
                    </p>
                  )}

                  <h2 className="section-title">
                    {gecikmeliArama
                      ? `"${gecikmeliArama}" için sonuçlar`
                      : mediaType === 'movie'
                        ? 'Filmleri Keşfet'
                        : 'Dizileri Keşfet'}
                  </h2>

                  {/* YUKLENME VE HATA */}

                  {yukleniyor && (
                    <p className="empty-message">
                      Film ve diziler yükleniyor...
                    </p>
                  )}

                  {hata && (
                    <p className="empty-message">
                      {hata}
                    </p>
                  )}

                  {/* FILM KARTLARI */}

                  {!yukleniyor && (
                    <div className="movie-grid">
                      {gosterilecekFilmler.map((film) => (
                        <MovieCard
                          key={filmAnahtari(film)}
                          film={film}
                          {...kartOzellikleri}
                          detayAc={setSeciliFilm}
                        />
                      ))}
                    </div>
                  )}

                  {!yukleniyor &&
                    !hata &&
                    gosterilecekFilmler.length === 0 && (
                      <p className="empty-message">
                        Bu filtrelerde sonuç bulunamadı.
                      </p>
                    )}

                  {/* DAHA FAZLA YUKLE */}

                  {!yukleniyor &&
                    sayfa < toplamSayfa && (
                      <div className="load-more-container">
                        <button
                          type="button"
                          className="load-more-btn"
                          disabled={dahaFazlaYukleniyor}
                          onClick={dahaFazlaYukle}
                        >
                          {dahaFazlaYukleniyor
                            ? 'Yükleniyor...'
                            : 'Daha Fazla Yükle'}

                          <ChevronDown size={18} />
                        </button>
                      </div>
                    )}
                </section>
              </>
            )}
          </>
        )}

        {/* TMDB KREDISI */}

        <p className="tmdb-credit">
          This product uses the TMDB API but is not
          endorsed or certified by TMDB.
        </p>
      </main>

      {/* FILM DETAY MODALI */}

      {seciliFilm && (
        <MovieDetails
          film={seciliFilm}
          kapat={() => setSeciliFilm(null)}
          {...kartOzellikleri}
        />
      )}
    </div>
  )
}

export default App
