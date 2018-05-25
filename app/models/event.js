import Categories from "./categories";

import moment from "moment";

import _get from "lodash/get";
import _find from "lodash/find";
import _reduce from "lodash/reduce";


function imageUrl( rawEvent ) {
    const { multimedia } = rawEvent;
    if ( !multimedia )
        return "";

    const image = _find( multimedia, image => image.source === "uc" && image.type === "img" && !!image.id );
    return image ? `https://ucarecdn.com/${image.id}/` : null;
}


function date( path ) {
    return rawEvent => {
        const date = _get( rawEvent, path, null );
        return date && moment( date );
    }
}


function array( path, visitor, _default = [] ) {
    return rawEvent => {
        const array = _get( rawEvent, path, null );
        if ( !array )
            return _default;

        return _reduce( array, ( result, item ) => {
            const value = visitor( item );
            if ( value !== null )
                result.push( value );
            return result;
        }, [] );
    }
}


function object( path, visitor, _default = {} ) {
    return rawEvent => {
        const object = _get( rawEvent, path, null );
        return object && visitor( object ) || _default;
    }
}


function value( path ) {
    return rawEvent => {
        return _get( rawEvent, path, null );
    }
}

function fieldValue( rawEvent, field, source ) {
    let path = field;
    switch ( typeof source ) {
        case "function": return source( rawEvent );
        case "string": path = source; break;
    }

    return _get( rawEvent, path, null );
}

function fields( fieldsMap ) {
    return rawEvent => {
        return _reduce( fieldsMap, ( result, source, field ) => {
            result[ field ] = fieldValue( rawEvent, field, source );
            return result;
        }, {} )
    };
}


function process( rawEvent, fieldsMap ) {
    return fields( fieldsMap )( rawEvent );
}


const summary = {
    "id": 1,
    "updatedAt": date( "updated_at" ),

    "name": 1,
    "venueId": "venue_id",
    "venueName": "venue.name",
    "allDay": 1,
    "startTime": date( "starttime" ),
    "endTime": date( "endtime" ),

    "categories": array( "categories", fields( {
        "id": 1,
        "name": c => Categories[c.id] || null
    } ) ),
    "featured": 1,

    "imageUrl": imageUrl
};


const details = {

    description: 1,
    summary: 1,

    moreInfo: "moreinfo",

    ticketUrl: "ticketurl",
    tickets: array( "tickets", value( "price" ) ),

    venue: object( "venue", fields( {
        "address": 1,
        "phone": 1,
        "latitude": 1,
        "longitude": 1,
        "location": venue => ( [ venue.name, venue.address ].filter( p => !!p ).join( " " ) )
    } ) )
};


export const makeSummaryEvent = rawEvent => ( {
    ...process( rawEvent, summary ),
    details: null
} );


export const makeFullEvent = rawEvent => ( {
    ...process( rawEvent, summary ),
    details: process( rawEvent, details )
} );