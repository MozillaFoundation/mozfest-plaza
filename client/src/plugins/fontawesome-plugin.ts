import type { App } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

//
// Import brands ~ https://fontawesome.com/icons?d=gallery&s=brands
//
import {
  faGoogle,
  faLinkedin,
  faDiscord,
  faMastodon,
  faTwitter,
} from '@fortawesome/free-brands-svg-icons'

//
// Import solids ~ https://fontawesome.com/icons?d=gallery&s=solid
//
import {
  // deconf icons
  faArrowLeft,
  faArrowRight,
  faVideo,
  faUser,
  faUsers,
  faGlobe,
  faSave,
  faIdBadge,
  faCalendarPlus,
  faSearch,
  faChevronLeft,
  faChevronRight,
  faTimes,
  faUserPlus,
  faCircle,
  faExclamationTriangle,
  faFire,
  faLongArrowAltRight,
  faLongArrowAltLeft,
  faTerminal,
  faClock,
  faForward,
  faFastForward,
  faBackward,
  faFastBackward,
  faPlay,
  faStop,
  faEnvelope,
  faShareAlt,
  faSync,
  faLightbulb,

  // session types enhancements
  faFlask,
  faComment,
  faBullhorn,
  faPersonChalkboard,
  faPalette,
  faPeopleGroup,
  faMicrophone,

  // Atrium
  faBook,

  // remaps
  faLocationDot, // was faCodeBranch
  faShapes, // was faTags
} from '@fortawesome/sharp-solid-svg-icons'

//
// Import regulars ~ https://fontawesome.com/icons?d=gallery&s=regular
//
import { faCircle as farCircle } from '@fortawesome/free-regular-svg-icons'

//
// Apply icons
// prettier-ignore
//
library.add(
  farCircle, faArrowLeft, faArrowRight, faVideo, faUser, faUsers, faLocationDot, faShapes, faGlobe, faSave, faIdBadge, faCalendarPlus, faSearch, faChevronLeft, faChevronRight, faBook, faTimes, faUserPlus, faCircle, faExclamationTriangle, faFire, faLongArrowAltRight, faLongArrowAltLeft, faTerminal, faClock, faForward, faFastForward, faBackward, faFastBackward, faPlay, faStop, faEnvelope, faShareAlt, faSync, faGoogle, faLightbulb, faLinkedin, faPalette, faDiscord, faMastodon, faFlask, faComment, faBullhorn, faPersonChalkboard, faPeopleGroup, faMicrophone, faTwitter
)

//
// A plugin to register the fontawesome icon component
//
export class FontawesomePlugin {
  static install(app: App): void {
    app.component('fa-icon', FontAwesomeIcon)
  }
}
