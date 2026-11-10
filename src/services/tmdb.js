
const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE_URL = 'https://api.themoviedb.org/3'

async function tmdbIstek(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`)

  url.searchParams.set('api_key', API_KEY)
  url.searchParams.set('language', 'tr-TR')

  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      url.searchParams.set(key, String(value))
    }
  })

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('TMDB verileri yüklenemedi.')
  }

  return response.json()
}

// Popüler filmler
export async function populerFilmleriGetir() {
  const data = await tmdbIstek('/movie/popular', {
    page: 1
  })

  return data.results
}

// Film ve dizi arama
export async function filmDiziAra(aramaMetni, page = 1) {
  const data = await tmdbIstek('/search/multi', {
    query: aramaMetni,
    page,
    include_adult: false
  })

  return {
    results: data.results.filter(
      (item) =>
        item.media_type === 'movie' ||
        item.media_type === 'tv'
    ),
    totalPages: data.total_pages
  }
}

// Film ve dizi türleri
export async function turleriGetir(mediaType) {
  const data = await tmdbIstek(
    `/genre/${mediaType}/list`
  )

  return data.genres || []
}

// Filmleri ve dizileri keşfet
export async function kesfetGetir({
  mediaType = 'movie',
  genre = '',
  sortBy = 'popularity.desc',
  page = 1
}) {
  const data = await tmdbIstek(
    `/discover/${mediaType}`,
    {
      with_genres: genre,
      sort_by: sortBy,
      page,
      include_adult: false,
      'vote_count.gte':
        sortBy === 'vote_average.desc' ? 100 : undefined
    }
  )

  return {
    results: data.results.map((item) => ({
      ...item,
      media_type: mediaType
    })),
    totalPages: data.total_pages
  }
}

// Film / dizi detayları
export async function detayGetir(id, mediaType) {
  return tmdbIstek(`/${mediaType}/${id}`, {
    append_to_response: 'credits,videos'
  })
}

// Fragman bilgisi
export async function fragmanGetir(id, mediaType) {
  const turkce = await tmdbIstek(
    `/${mediaType}/${id}/videos`
  )

  let videolar = turkce.results || []

  if (!videolar.some((video) => video.site === 'YouTube')) {
    const ingilizce = await tmdbIstek(
      `/${mediaType}/${id}/videos`,
      { language: 'en-US' }
    )

    videolar = ingilizce.results || []
  }

  const fragman =
    videolar.find(
      (video) =>
        video.site === 'YouTube' &&
        video.type === 'Trailer' &&
        video.official
    ) ||
    videolar.find(
      (video) =>
        video.site === 'YouTube' &&
        video.type === 'Trailer'
    ) ||
    videolar.find(
      (video) => video.site === 'YouTube'
    )

  return fragman?.key || null
}

// Haftanın trend filmleri
export async function trendFilmleriGetir() {
  const data = await tmdbIstek(
    '/trending/movie/week'
  )

  return data.results.map((film) => ({
    ...film,
    media_type: 'movie'
  }))
}

// Popüler diziler
export async function populerDizileriGetir() {
  const data = await tmdbIstek('/tv/popular', {
    page: 1
  })

  return data.results.map((dizi) => ({
    ...dizi,
    media_type: 'tv'
  }))
}

export async function onerileriGetir(id, mediaType = 'movie') {
  const data = await tmdbIstek(
    `/${mediaType}/${id}/recommendations`,
    { page: 1 }
  )

  return (data.results || []).map((item) => ({
    ...item,
    media_type: mediaType
  }))
}
