
import '../styles/CineTrackLogo.css'

function CineTrackLogo({ className = '' }) {
  return (
    <span
      className={`ct-logo ${className}`}
      role="img"
      aria-label="CineTrack"
    >
      <svg
        className="ct-logo__art"
        viewBox="0 0 200 110"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="ct-retro-cream"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#FFF0D8"
            />
            <stop
              offset="100%"
              stopColor="#F6D3A8"
            />
          </linearGradient>
        </defs>

        {/* Mor, pembe ve turuncu retro şeritler */}
        <path
          d="M59 13 H83 L31 91 H7 Z"
          fill="#9B5DE5"
        />

        <path
          d="M76 13 H99 L47 91 H24 Z"
          fill="#F45A9A"
        />

        <path
          d="M93 13 H116 L64 91 H41 Z"
          fill="#FF8A3D"
        />

        {/* CT harflerinin koyu konturu */}
        <text
          x="76"
          y="80"
          fontFamily="Arial Black, Arial, sans-serif"
          fontSize="85"
          fontWeight="900"
          fontStyle="italic"
          letterSpacing="-11"
          fill="#0B0710"
          stroke="#0B0710"
          strokeWidth="6"
          paintOrder="stroke"
        >
          CT
        </text>

        {/* Krem CT monogramı */}
        <text
          x="76"
          y="78"
          fontFamily="Arial Black, Arial, sans-serif"
          fontSize="85"
          fontWeight="900"
          fontStyle="italic"
          letterSpacing="-11"
          fill="url(#ct-retro-cream)"
          stroke="#0B0710"
          strokeWidth="2"
          paintOrder="stroke"
        >
          CT
        </text>

        {/* İnce alt çizgi */}
        <path
          d="M8 95 H155 L151 101 H4 Z"
          fill="#A970FF"
        />
      </svg>
    </span>
  )
}

export default CineTrackLogo
