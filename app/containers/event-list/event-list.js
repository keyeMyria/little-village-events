import Header from "./event-list.header";
import Item from "./event-list.item";
import state from "./event-list.state";

import { injectState, provideState } from "../../utils/freactal";

import React from "react";
import { SectionList } from "react-native";
import { compose } from "recompose";

const EventList = ( props ) => {
    const { state } = props;
    return (
        <SectionList
            sections={ state.eventCalendar }
            renderItem={ props => <Item { ...props }/> }
            renderSectionHeader={ Header }
            keyExtractor={ ( item, index ) => item.id || index }
        />
    );
};

export default compose(
    injectState,
    provideState( state ),
    injectState
)( EventList );
