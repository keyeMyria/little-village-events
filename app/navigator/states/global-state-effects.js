import { createEventItem, createEventSummary, createEventDetails, updateUserProfile as _updateUserProfile, write, toPlainObj } from "app/utils/realm";
import openBrowser from "app/utils/openEmbeddedBrowser"
import slowlog from "app/utils/slowlog";
import debug from "app/utils/debug";
import calendar from "app/utils/calendar";
import notifications from "app/utils/notifications";

import { mergeIntoState, update } from "@textpress/freactal";

import { Dimensions, Linking, Share } from "react-native";
import openMapApp from "react-native-open-maps";
import phoneCall from "react-native-phone-call"


const log = debug( "app:load-events" );


const loadEvents = async ( realm, api, dates ) => {
    const events = await api.getEventList( dates.first, dates.last );

    const locations = realm.objects( "Location" ).filtered( "latitude != null" ).map( toPlainObj );
    // Realm isolates each transaction from external updates until it's completed,
    // so we can't rely on `summary.venue.distances` being up-to-date, and have
    // to track which venues have been/will be updated on our own
    const updatedVenues = {};
    const updateVenueDistancesIfNeeded = async ( { id: eventId, venue } ) => {
        if ( !updatedVenues[ venue.id ] && venue.distances.length < locations.length ) {
            updatedVenues[ venue.id ] = true;
            log( "updating venue distances for %s (%o)", venue.name, toPlainObj( venue ) );
            const fullEvent = await api.getEventFullData( eventId );
            realm.write( () => createEventDetails( realm, eventId, fullEvent.details, locations ) );
        }
    };

    slowlog( () => realm.write( () => {
        events.forEach( eventSummaryData => {
            const summary = createEventSummary( realm, eventSummaryData );
            updateVenueDistancesIfNeeded( summary );
            if ( !summary.items.length )
                createEventItem( realm, summary );
        } );
    } ), { threshold: 100 } );
};


export const initialize = async ( effects, { realm, api, dates } ) => {
    Dimensions.addEventListener( "change", effects.updateDimensions );

    await loadEvents( realm, api, dates );

    return mergeIntoState( {} );
};


export const updateUserProfile = update( ( { realm, userProfile }, profileData ) => ( {
    userProfile: write( realm, () => _updateUserProfile( realm, userProfile.id, profileData ) )
} ) );


export const call = async ( effects, number ) => {
    await phoneCall( {
        number: number.replace( /[- ()]/g, "" ),
        prompt: true
    } );
    return mergeIntoState( {} );
};


export const share = async ( effects, content, options ) => {
    await Share.share( content, options );
    return mergeIntoState( {} );
};


export const openMap = async ( effects, options ) => {
    await openMapApp( options );
    return mergeIntoState( {} );
};


export const openEmbeddedBrowser = async ( effects, options ) => {
    const { url, readerMode, tintColor, barTintColor, fromBottom, wait } = options;

    const success = await openBrowser( { url, readerMode, tintColor, barTintColor, fromBottom }, wait );

    if ( !success )
        await effects.openExternalURL( url );

    return ( state ) => state;
};


export const openExternalURL = async ( effects, url ) => {
    if ( await Linking.canOpenURL( url ) )
        await Linking.openURL( url );
    return mergeIntoState( {} );
};


export const addEventToCalendar = async ( effects, calendarEvent ) => {
    await calendar.addEvent( calendarEvent );
    return mergeIntoState( {} );
};


export const scheduleNotification = async ( effects, notification ) => {
    await notifications.schedule( notification );
    return mergeIntoState( {} );
};


export const cancelNotification = async ( effects, notification ) => {
    await notifications.cancel( notification );
    return mergeIntoState( {} );
};


export const updateDimensions = update( ( state, dimensions ) => {

    return {
        screenDimensions: dimensions.screen,
        windowDimensions: dimensions.screen
    }
} );
