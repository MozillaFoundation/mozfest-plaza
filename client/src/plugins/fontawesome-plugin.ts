import _Vue from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

//
// Import brands ~ https://fontawesome.com/icons?d=gallery&s=brands
//
import {
  faTwitter,
  faSlack,
  faGoogle,
  faLinkedin,
} from '@fortawesome/free-brands-svg-icons'

//
// Import solids ~ https://fontawesome.com/icons?d=gallery&s=solid
//
import {
  faArrowLeft,
  faArrowRight,
  faVideo,
  faUser,
  faUsers,
  faCodeBranch,
  faTags,
  faGlobe,
  faSave,
  faIdBadge,
  faCalendarPlus,
  faSearch,
  faChevronLeft,
  faChevronRight,
  faHeadset,
  faPuzzlePiece,
  faBook,
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
  faTicketAlt,
  faComments,
  faObjectGroup,
  faPeopleArrows,
  faShareAlt,
  faPalette,
  faPodcast,
  faSync,
  faSeedling,
  faLightbulb,
} from '@fortawesome/free-solid-svg-icons'

//
// Import regulars ~ https://fontawesome.com/icons?d=gallery&s=regular
//
import { faCircle as farCircle } from '@fortawesome/free-regular-svg-icons'

//
// Apply icons
// prettier-ignore
//
library.add(
  farCircle, faTwitter, faSlack, faArrowLeft, faArrowRight, faVideo, faUser, faUsers, faCodeBranch, faTags, faGlobe, faSave, faIdBadge, faCalendarPlus, faSearch, faChevronLeft, faChevronRight, faHeadset, faPuzzlePiece, faBook, faTimes, faUserPlus, faCircle, faExclamationTriangle, faFire, faLongArrowAltRight, faLongArrowAltLeft, faTerminal, faClock, faForward, faFastForward, faBackward, faFastBackward, faPlay, faStop, faEnvelope, faTicketAlt, faComments, faObjectGroup, faPeopleArrows, faShareAlt, faPalette, faPodcast, faSync, faGoogle, faSeedling, faLightbulb, faLinkedin
)

//
// A plugin to register the fontawesome icon component
//
export class FontawesomePlugin {
  static install(Vue: typeof _Vue): void {
    Vue.component('fa-icon', FontAwesomeIcon)
  }
}
