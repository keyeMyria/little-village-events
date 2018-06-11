import { makeRSVPEvent, validateRSVPEvent } from "./rsvp";
import Storage from "../storage";

import EventEmitter from "events";

const arrayToMap = array => {
    return array.reduce( ( result, pair ) => {
        const rsvp = pair[ 1 ];
        result[ rsvp.rsvpId ] = rsvp;
        return result;
    }, {} );
};

export default class RSVPs {


    storage = new Storage( "RSVP" );
    events = new EventEmitter();

    addEventListener( ...args ) {
        return this.events.addListener( ...args );
    }


    async add( event, calendarDay ) {
        const rsvp = makeRSVPEvent( event, calendarDay );
        await this.storage.set( rsvp.rsvpId, rsvp );
        this.events.emit( "added", rsvp );
        return rsvp;
    }


    async remove( rsvp ) {
        validateRSVPEvent( rsvp );
        await this.storage.remove( rsvp.rsvpId );
        this.events.emit( "removed", rsvp );
        return rsvp;
    }


    async all() {
        const result = await this.storage.all();
        return arrayToMap( result );
    }


    clear() {
        return this.storage.clear();
    }


};