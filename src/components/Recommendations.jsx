
import { useEffect, useMemo, useState } from 'react'
import {
  Sparkles,
  Heart,
  Star,
  RefreshCw,
  Lightbulb
} from 'lucide-react'

import { onerileriGetir } from '../services/tmdb'
import MovieCard from './MovieCard'
import '../styles/Recommendations.css'

function filmAnahtari(film) {
  return `${film.mediaType}-${film.id}`
}

function filmFormatla(film) {
  const mediaType = film.media_type || 'movie'

  return {
    id: film.id,
    mediaType,
    ad: film.title || film.name || 'İsimsiz',
    aciklama: film.overview || 'Açıklama bulunmuyor.',
    yil: (
      film.release_date ||
      film.first_air_date ||
      ''
    ).slice(0, 4) || 'Bilinmiyor',
    puan: Number(film.vote_average || 0).toFixed(1),
    tip: mediaType === 'tv' ? 'Dizi' : 'Film',
    afis: film.poster_path
      ? `https://image.tmdb.org/t/p/w500${film.poster_path}`
      : null,
    arkaPlan: film.backdrop_path
      ? `https://image.tmdb.org/t/p/original${film.backdrop_path}`
      : null
  }
}

function Recommendations({
  favoriler,
  izlemeListesi,
  kisiselPuanlar,
  kartOzellikleri,
  detayAc
}) {
  const [oneriler, setOneriler] = useState([])
  const [yukleniyor, setYukleniyor] = useState(false)
  const [hata, setHata] = useState('')
  const [yenileme, setYenileme] = useState(0)

  const kaynaklar = useMemo(() => {
    const kaynakMap = new Map()

    favoriler.forEach((film) => {
      if (!film?.id || !film?.mediaType) return

      kaynakMap.set(filmAnahtari(film), {
        ...film,
        oncelik: 2
      })
    })

    kisiselPuanlar.forEach((kayit) => {
      const puan = Number(kayit.puan)

      if (puan < 7 || !kayit.anahtar) return

      const film = [
        ...favoriler,
        ...izlemeListesi
      ].find(
        (item) =>
          filmAnahtari(item) === kayit.anahtar
      )

      if (!film) return

      const anahtar = filmAnahtari(film)
      const mevcut = kaynakMap.get(anahtar)

      kaynakMap.set(anahtar, {
        ...film,
        oncelik: Math.max(
          mevcut?.oncelik || 0,
          puan >= 9 ? 4 : 3
        )
      })
    })

    return [...kaynakMap.values()]
      .sort((a, b) => b.oncelik - a.oncelik)
      .slice(0, 8)
  }, [favoriler, izlemeListesi, kisiselPuanlar])

  const kaynakAnahtari = JSON.stringify(
    kaynaklar.map((film) => [
      filmAnahtari(film),
      film.oncelik
    ])
  )

  const gizlenecekler = useMemo(() => {
    const anahtarlar = new Set()

    favoriler.forEach((film) => {
      anahtarlar.add(filmAnahtari(film))
    })

    izlemeListesi.forEach((film) => {
      if (film.durum === 'izledim') {
        anahtarlar.add(filmAnahtari(film))
      }
    })

    kisiselPuanlar.forEach((kayit) => {
      if (kayit.anahtar) {
        anahtarlar.add(kayit.anahtar)
      }
    })

    return anahtarlar
  }, [favoriler, izlemeListesi, kisiselPuanlar])

  useEffect(() => {
    let aktif = true

    if (!kaynaklar.length) {
      setOneriler([])
      setHata('')
      setYukleniyor(false)
      return
    }

    async function onerileriYukle() {
      setYukleniyor(true)
      setHata('')

      const sonuclar = await Promise.allSettled(
        kaynaklar.map((film) =>
          onerileriGetir(film.id, film.mediaType)
        )
      )

      if (!aktif) return

      const puanMap = new Map()
      let basariliIstek = 0

      sonuclar.forEach((sonuc, index) => {
        if (sonuc.status !== 'fulfilled') return

        basariliIstek += 1
        const kaynak = kaynaklar[index]

        sonuc.value.forEach((film, sira) => {
          if (!film.poster_path) return

          const anahtar =
            `${film.media_type}-${film.id}`

          const onceki = puanMap.get(anahtar)

          const agirlik =
            kaynak.oncelik * (1 + (20 - sira) / 20)

          puanMap.set(anahtar, {
            film,
            skor: (onceki?.skor || 0) + agirlik,
            eslesme: (onceki?.eslesme || 0) + 1
          })
        })
      })

      if (basariliIstek === 0) {
        setHata('Öneriler şu anda yüklenemedi.')
        setOneriler([])
      } else {
        const sirali = [...puanMap.values()]
          .sort((a, b) =>
            b.skor - a.skor ||
            b.eslesme - a.eslesme ||
            b.film.vote_average - a.film.vote_average
          )
          .map((item) => filmFormatla(item.film))

        setOneriler(sirali)
      }

      setYukleniyor(false)
    }

    onerileriYukle()

    return () => {
      aktif = false
    }
  }, [kaynakAnahtari, yenileme])

  const gorunenOneriler = oneriler
    .filter(
      (film) => !gizlenecekler.has(filmAnahtari(film))
    )
    .slice(0, 12)

  return (
    <section className="recommendations-section">
      <div className="recommendations-heading">
        <div>
          <span className="recommendations-eyebrow">
            <Sparkles size={14} />
            SENİN SİNEMA DÜNYAN
          </span>

          <h2>
            <Sparkles size={25} />
            Sana Özel Öneriler
          </h2>

          <p>
            Beğendiğin yapımlardan yola çıkarak
            keşfedebileceğin film ve diziler.
          </p>
        </div>

        {kaynaklar.length > 0 && (
          <button
            type="button"
            className="recommendations-refresh"
            onClick={() => setYenileme((n) => n + 1)}
            disabled={yukleniyor}
          >
            <RefreshCw size={17} />
            Yenile
          </button>
        )}
      </div>

      {!kaynaklar.length ? (
        <div className="recommendations-empty">
          <div className="recommendations-empty-icon">
            <Heart size={29} />
          </div>

          <h3>Film zevkini tanıyalım!</h3>

          <p>
            Favorilerine birkaç film veya dizi ekle.
            İstersen izlediklerine 7/10 ve üzeri
            puan ver. Sana özel öneriler burada
            görünmeye başlayacak.
          </p>

          <span>
            <Lightbulb size={16} />
            Ne kadar çok beğeni, o kadar iyi öneri!
          </span>
        </div>
      ) : (
        <>
          <div className="recommendations-source-info">
            <Star size={16} />
            {kaynaklar.length} beğendiğin yapım
            üzerinden öneriler hazırlanıyor.
          </div>

          {yukleniyor && (
            <div className="recommendations-loading">
              <span className="recommendations-spinner" />
              Sana uygun yapımlar aranıyor...
            </div>
          )}

          {hata && (
            <div className="recommendations-empty">
              <p>{hata}</p>
              <button
                type="button"
                className="recommendations-refresh"
                onClick={() => setYenileme((n) => n + 1)}
              >
                Tekrar Dene
              </button>
            </div>
          )}

          {!yukleniyor && !hata && (
            <>
              {gorunenOneriler.length ? (
                <div className="recommendations-scroll">
                  {gorunenOneriler.map((film) => (
                    <div
                      className="recommendations-item"
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
              ) : (
                <div className="recommendations-empty">
                  <p>
                    Şimdilik yeni bir öneri bulunamadı.
                    Başka favoriler ekleyerek tekrar dene.
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </section>
  )
}

export default Recommendations
