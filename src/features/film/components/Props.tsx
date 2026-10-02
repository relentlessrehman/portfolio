import { Pic } from './primitives'

/**
 * Fixed background layer (z 0): light that the scenes sit in. Decorative.
 * Scene 03's stage light, scene 07's paper, scene 11's ridgeline, scene 14's horizon.
 */
export function FilmBackdrop() {
  return (
    <div className="f-bg film-only" aria-hidden data-film-fixed>
      <div className="f-bg__stage" data-b="stage" />
      <div className="f-bg__paper" data-b="paper" />
      <svg
        className="f-bg__ridge"
        data-b="ridge"
        viewBox="0 0 1600 500"
        preserveAspectRatio="none"
      >
        <path
          d="M0 330 L120 290 L210 312 L320 250 L430 286 L520 238 L640 270 L760 214 L880 262 L990 230 L1110 276 L1220 240 L1330 288 L1450 252 L1600 300 L1600 500 L0 500 Z"
          className="f-ridge f-ridge--far"
        />
        <path
          d="M0 380 L140 344 L260 372 L380 330 L520 366 L660 322 L800 360 L930 318 L1060 356 L1200 330 L1340 372 L1470 340 L1600 368 L1600 500 L0 500 Z"
          className="f-ridge f-ridge--near"
        />
      </svg>
      <div className="f-bg__horizon" data-b="horizon">
        <div className="f-planet" />
      </div>
    </div>
  )
}

/**
 * Fixed props layer (z 2): objects that live across scenes — the laptop
 * (04→06), the outline morph (06), the phone (06→07). Decorative duplicates of
 * content that also exists in the semantic DOM and the case studies.
 */
export function FilmProps() {
  return (
    <div className="f-props film-only" aria-hidden data-film-fixed>
      <div className="f-beam" data-p="beam" />

      <div className="f-laptop" data-p="laptop">
        <div className="f-laptop__lid">
          <span className="f-laptop__notch" />
          <div className="f-laptop__screen">
            <span className="f-glare" data-p="glare" />
            <Pic
              name="stayza-home"
              widths={[1440, 2400]}
              sizes="(max-width: 600px) 92vw, 46vw"
              ratio={1.6}
            />
          </div>
        </div>
        <div className="f-laptop__base" />
      </div>

      <svg className="f-morph" data-p="morph">
        <rect data-p="rect" className="f-morph__rect" />
        <rect data-p="trail" className="f-morph__trail" />
      </svg>

      <div className="f-phone" data-p="phone">
        <span className="f-phone__btn f-phone__btn--power" />
        <span className="f-phone__btn f-phone__btn--vol" />
        <div className="f-phone__screen">
          <span className="f-phone__cam" />
          <span className="f-glare f-glare--phone" />
          <div className="f-phone__shot" data-p="screen">
            <Pic
              name="campusflow-now"
              widths={[480, 900]}
              sizes="320px"
              ratio={1080 / 2290}
            />
          </div>
          <div className="f-phone__shot" data-p="screen">
            <Pic
              name="campusflow-day"
              widths={[480, 900]}
              sizes="320px"
              ratio={1080 / 2290}
            />
          </div>
          <div className="f-phone__shot" data-p="screen">
            <Pic
              name="campusflow-import"
              widths={[480, 900]}
              sizes="320px"
              ratio={1080 / 2290}
            />
          </div>
          <div className="f-phone__card" data-p="card">
            <Pic
              name="campusflow-card"
              widths={[480, 900]}
              sizes="320px"
              ratio={992 / 648}
            />
          </div>
        </div>
      </div>

      <span className="f-orb f-poster" data-p="poster" />
    </div>
  )
}
