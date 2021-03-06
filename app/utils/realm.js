import schema from "app/models/schema";
import seed from "app/models/seed";

import { dayEnd, dayStart } from "app/utils/date";
import { defaultEventEndTime, isOngoingEvent } from "app/utils/event-time";
import { distance } from "app/utils/geo";

import Realm from "realm";

import omit from "lodash/omit";
import values from "lodash/values";
import uniqBy from "lodash/uniqBy";
import isNil from "lodash/isNil";

import EventEmitter from "EventEmitter";


export const createInstance = ( options = {} ) => {
    const realm = new Realm( {
        schema,
        schemaVersion: 12,
        // deleteRealmIfMigrationNeeded: !isProduction(),
        ...options,
        migration: ( oldRealm, newRealm ) => {
            // if ( !isProduction() )
            //     newRealm.deleteAll();
        }
    } );

    // realm.write( () => realm.deleteAll() );
    seed( realm );
    // console.log( "Realm path:", realm.path );
    return realm;
};


export const write = ( realm, fn ) => {
    let result;
    realm.write( () => result = fn() );
    return result;
};


export const createEventSummary = ( realm, { categories, ...summaryData } ) =>
    realm.create( "EventSummary", {
        ...summaryData,
        categories: uniqBy( categories, "id" )
    }, true );


export const createEventDetails = ( realm, eventId, detailsData, locations ) => {
    if ( locations ) {
        const { venue } = detailsData;
        venue.distances = locations.map( location => ( {
            id: `${venue.id}.${location.id}`,
            locationId: location.id,
            distance: isNil( location.latitude )
                ? 0
                : Math.round( distance(
                    { lat: location.latitude, lon: location.longitude },
                    { lat: venue.latitude, lon: venue.longitude }
                ) )
        } ) );
    }

    return realm.create( "EventDetails", {
        id: eventId,
        ...detailsData
    }, true );
}


export const createRsvpedEventItem = ( realm, eventSummary, { startTime, endTime } ) => {
    const ongoing = isOngoingEvent( eventSummary );

    const id = ongoing
        ? `${eventSummary.id}.${startTime}`
        : `${eventSummary.id}`;

    return realm.create( "EventItem", {
        id,
        eventDate: dayStart( startTime ),
        startTime: startTime,
        endTime,
        allDay: false,
        rsvp: true,
        eventSummary
    }, true );
};


const normalizeEventTime = eventSummary => {
    const { allDay, startTime, endTime } = eventSummary;
    return allDay
        ? {
            startTime: dayStart( startTime ),
            endTime: dayEnd( endTime || startTime )
        }
        : {
            startTime,
            endTime: endTime && endTime.valueOf() > startTime.valueOf()
                ? endTime
                : defaultEventEndTime( eventSummary )
        }
};


export const toEventItem = ( eventSummary ) => {
    const ongoing = isOngoingEvent( eventSummary );

    const { startTime, endTime } = normalizeEventTime( eventSummary );

    return {
        id: `${eventSummary.id}`,
        eventDate: ongoing ? null : dayStart( startTime ),
        startTime,
        endTime,
        allDay: eventSummary.allDay,
        rsvp: false,
        eventSummary
    };
};


export const createEventItem = ( realm, eventSummary ) => {
    return realm.create( "EventItem", toEventItem( eventSummary ), true );
};


export const createEventWithDetails = ( realm, eventData ) => {
    const summary = createEventSummary( realm, eventData );
    createEventItem( realm, summary );
    createEventDetails( realm, eventData.id, eventData.details );
};


export const getEventItem = ( realm, eventItemId ) =>
    realm.objectForPrimaryKey( "EventItem", eventItemId );


export const getEventSummary = ( realm, eventId ) =>
    realm.objectForPrimaryKey( "EventSummary", eventId );


export const getEventDetails = ( realm, eventId ) =>
    realm.objectForPrimaryKey( "EventDetails", eventId );


export const getUserProfile = ( realm, id ) =>
    realm.objectForPrimaryKey( "UserProfile", id );


export const updateUserProfile = ( realm, id, userProfileData ) =>
    realm.create( "UserProfile", {
        id,
        ...userProfileData
    }, true );


const copyRealmObjProperty = ( obj, name, type ) => {
    switch ( type ) {
        case "object":
            return toPlainObj( obj[ name ] );
        case "list":
            return obj[ name ].map( toPlainObj );
        case "linkingObjects":
            return null;
    }

    return obj[ name ];
};


export function toPlainObj( obj, skipProps = [] ) {
    const props = obj.objectSchema().properties;
    const result = {};
    values( omit( props, skipProps ) ).forEach( ( { name, type } ) => {
        result[ name ] = copyRealmObjProperty( obj, name, type );
    } );

    return result;
}


export const realmQuerySubscription = () => {
    const eventName = "queryUpdate";
    return {
        query: null,
        eventEmmiter: new EventEmitter(),

        subscribe( callback ) {
            this.eventEmmiter.addListener( eventName, callback );
        },

        update( newQuery ) {
            if ( this.query )
                this.query.removeAllListeners();
            this.query = newQuery;
            this.query.addListener( this._emitQeuryUpdate.bind( this ) );
        },

        reset() {
            this.update( null );
            this.eventEmmiter.removeAllListeners();
        },

        _emitQeuryUpdate( ...args ) {
            this.eventEmmiter.emit( eventName, ...args );
        }
    }
};
