import RSVPEvents from "../../components/rsvp-events";
import state from "./rsvp-events.state";

import { injectState, provideState } from "../../utils/freactal";

import { compose } from "recompose";

export default compose(
    provideState( state ),
    injectState
)( RSVPEvents );
