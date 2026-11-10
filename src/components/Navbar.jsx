
import CineTrackLogo from './CineTrackLogo'

import {
  Compass,
  Bookmark,
  Heart,
  UserRound
} from 'lucide-react'

function Navbar({
  aktifSayfa,
  setAktifSayfa,
  favoriSayisi,
  listeSayisi
}) {
  const sayfayaGit = (sayfa) => {
    setAktifSayfa(sayfa)

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const menuItems = [
    {
      id: 'kesfet',
      label: 'Keşfet',
      icon: Compass
    },
    {
      id: 'listem',
      label: 'Listem',
      icon: Bookmark,
      count: listeSayisi
    },
    {
      id: 'favoriler',
      label: 'Favorilerim',
      icon: Heart,
      count: favoriSayisi
    },
    {
      id: 'profil',
      label: 'Profilim',
      icon: UserRound
    }
  ]

  const menuOlustur = (mobil = false) =>
    menuItems.map((item) => {
      const Icon = item.icon
      const active = aktifSayfa === item.id

      return (
        <button
          key={item.id}
          type="button"
          className={`modern-nav-link ${
            active ? 'active' : ''
          }`}
          onClick={() => sayfayaGit(item.id)}
          aria-current={active ? 'page' : undefined}
          title={item.label}
        >
          <span className="nav-icon-wrap">
            <Icon
              size={mobil ? 21 : 18}
              strokeWidth={active ? 2.4 : 2}
            />

            {mobil &&
              item.count !== undefined &&
              item.count > 0 && (
                <span className="mobile-nav-badge">
                  {item.count > 99 ? '99+' : item.count}
                </span>
              )}
          </span>

          <span className="nav-label">
            {item.label}
          </span>

          {!mobil &&
            item.count !== undefined && (
              <span className="nav-count">
                {item.count}
              </span>
            )}
        </button>
      )
    })

  return (
    <>
      {/* MASAUSTU VE TABLET NAVBAR */}

      <header className="navbar">
        <button
          type="button"
          className="brand-logo"
          onClick={() => sayfayaGit('kesfet')}
          aria-label="CineTrack ana sayfa"
          title="CineTrack ana sayfa"
        >
          <CineTrackLogo />
        </button>

        <nav
          className="modern-nav desktop-nav"
          aria-label="Ana menü"
        >
          {menuOlustur(false)}
        </nav>
      </header>

      {/* MOBIL ALT NAVIGASYON */}

      <nav
        className="mobile-bottom-nav"
        aria-label="Mobil ana menü"
      >
        {menuOlustur(true)}
      </nav>
    </>
  )
}

export default Navbar
