import { opaque } from "./navigator-styles";

import EventList from "/app/containers/event-list";

export default {
    id: "events.list",
    view: EventList,
    nav: {
        title: "Iowa City",
        navigatorStyle: opaque
    }
};