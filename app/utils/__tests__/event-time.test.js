import { addToDate, dayEnd, dayStart, subtractFromDate } from "../date";
import { eventTense, firstRSVPDate, getRSVPInfo, lastRSVPDate, RSVPTimeForDay } from "../event-time";

import _keys from "lodash/keys";
import _pick from "lodash/pick";

import sinon from "sinon";
import config from "../../config";

const dateHour = ( date, hour ) => addToDate( dayStart( date ), { minutes: hour * 60 } );

const earlyMorning = date => dateHour( date, 2 );
const morning = date => dateHour( date, 9 );
const noon = date => dateHour( date, 12 );
const evening = date => dateHour( date, 18 );
const lateEvening = date => dateHour( date, 22 );


const integrityWrapper = testFunc =>
    ( event, ...args ) => {
        const eventSnapshot = JSON.stringify( event );
        testFunc( event, ...args );
        expect( JSON.stringify( event ) ).toMatch( eventSnapshot );
    };


const allDayWrapper = testFunc =>
    ( event, ...args ) => {
        testFunc( event, ...args );
        if ( event.allDay === undefined )
            testFunc( { ...event, allDay: true }, ...args );
    };


const expectedWrapper = testFunc =>
    expected => event => testFunc( event, expected );

const allDayExpectedWrapper = ( testFunc ) =>
    expectedWrapper( allDayWrapper( testFunc ) )
;


const toJSON = event => {
    return JSON.stringify( _pick( event, _keys( event ).sort() ) );
};

describe( "event-time", () => {

    const today = noon( new Date( "2018-05-14" ) );
    const tomorrow = addToDate( today, { days: 1 } );
    const weekLater = addToDate( today, { days: 7 } );
    const yesterday = subtractFromDate( today, { days: 1 } );
    const weekAgo = subtractFromDate( today, { days: 7 } );

    const sandbox = sinon.createSandbox();

    beforeEach( () => {
    } );

    afterEach( () => {
        sandbox.restore();
    } );

    describe( "firstRSVPDate", () => {
        const test = integrityWrapper(
            ( event, expected ) => expect( JSON.stringify( firstRSVPDate( event ) ) ).toMatch( JSON.stringify( expected ) )
        );

        it( "handles one time events", () => {
            test( { startTime: morning( today ) }, morning( today ) );
            test( { startTime: morning( today ), allDay: true }, dayStart( today ) );
        } );

        it( "handles reoccurring events", () => {
            test( { startTime: morning( weekAgo ), endTime: evening( weekLater ) }, morning( weekAgo ) );
            test( {
                startTime: morning( weekAgo ),
                endTime: evening( weekLater ),
                allDay: true
            }, dayStart( weekAgo ) );
        } );

    } );

    describe( "lastRSVPDate", () => {
        const test = integrityWrapper(
            ( event, expected ) => expect( JSON.stringify( lastRSVPDate( event ) ) ).toMatch( JSON.stringify( expected ) )
        );

        it( "handles one time events", () => {
            [
                { startTime: morning( today ), endTime: evening( today ) },
                { startTime: lateEvening( today ), endTime: earlyMorning( tomorrow ), allDay: false }
            ].forEach( allDayExpectedWrapper( test )( null ) );
        } );

        it( "handles reoccurring events", () => {
            test( { startTime: morning( weekAgo ), endTime: evening( weekLater ) }, morning( weekLater ) );
            test( {
                startTime: morning( weekAgo ),
                endTime: evening( weekLater ),
                allDay: true
            }, dayStart( weekLater ) );
            test(
                { startTime: lateEvening( today ), endTime: earlyMorning( tomorrow ), allDay: true },
                dayStart( tomorrow )
            );

        } );

        it( "handles events with incorrect endTime", () => {
            test( { startTime: evening( today ), endTime: morning( today ) }, null );
        } );

    } );

    describe( "getRSVPInfo", () => {
        const test = integrityWrapper(
            ( event, expected ) => expect( JSON.stringify( getRSVPInfo( event ) ) ).toMatch( JSON.stringify( expected ) )
        );

        it( "handles one time events", () => {
            test(
                { startTime: morning( today ), endTime: evening( today ) },
                { first: morning( today ), last: morning( today ), singleDay: true, allDay: false, duration: 540 }
            );

            test(
                { startTime: lateEvening( today ), endTime: earlyMorning( tomorrow ) },
                { first: lateEvening( today ), last: lateEvening( today ), singleDay: true, allDay: false, duration: 240 }
            );

            test(
                { startTime: evening( today ), endTime: morning( today ) },
                { first: evening( today ), last: evening( today ), singleDay: true, allDay: false, duration: 0 }
            );

        } );

        it( "handles reoccurring events", () => {
            test(
                { startTime: morning( yesterday ), endTime: evening( tomorrow ) },
                { first: morning( yesterday ), last: morning( tomorrow ), singleDay: false, allDay: false, duration: 540 }
            );

            test(
                { startTime: morning( yesterday ), endTime: evening( tomorrow ), allDay: true },
                { first: dayStart( yesterday ), last: dayStart( tomorrow ), singleDay: false, allDay: true, duration: null }
            );


            test(
                { startTime: lateEvening( today ), endTime: earlyMorning( tomorrow ), allDay: true },
                { first: dayStart( today ), last: dayStart( tomorrow ), singleDay: false, allDay: true, duration: null }
            );

        } );

    } );


    describe( "RSVPTimeForDay", () => {

        const test = integrityWrapper(
            ( event, expected ) => expect( toJSON( RSVPTimeForDay( event, today ) ) ).toMatch( toJSON( expected ) )
        );

        const testAllDayExpected = allDayExpectedWrapper( test );

        describe( "one time events", () => {

            it( "handles events", () => {

                test(
                    { startTime: morning( today ), endTime: morning( today ), allDay: true },
                    { startTime: dayStart( today ), endTime: dayEnd( today ), allDay: true }
                );


                test(
                    { startTime: morning( today ), endTime: evening( today ) },
                    { startTime: morning( today ), endTime: evening( today ), allDay: false }
                );


                test(
                    { startTime: morning( today ), endTime: evening( today ), allDay: true },
                    { startTime: dayStart( today ), endTime: dayEnd( today ), allDay: true }
                );


                test(
                    { startTime: morning( yesterday ), endTime: evening( yesterday ), allDay: false },
                    null
                );

                test(
                    { startTime: morning( yesterday ), endTime: evening( yesterday ), allDay: true },
                    null
                );

                test(
                    { startTime: morning( tomorrow ), endTime: evening( tomorrow ), allDay: false },
                    null
                );

                test(
                    { startTime: morning( tomorrow ), endTime: evening( tomorrow ), allDay: true },
                    null
                );


                test( { startTime: lateEvening( yesterday ), endTime: earlyMorning( today ) }, null );


                test(
                    { startTime: lateEvening( today ), endTime: earlyMorning( tomorrow ) },
                    { startTime: lateEvening( today ), endTime: earlyMorning( tomorrow ), allDay: false }
                );


            } );


        } );

        describe( "reoccurring events", () => {

            it( "handles past events", () => {
                [
                    { startTime: morning( weekAgo ), endTime: evening( yesterday ) },
                    { startTime: lateEvening( weekAgo ), endTime: earlyMorning( yesterday ) },
                    { startTime: lateEvening( weekAgo ), endTime: earlyMorning( today ), allDay: false }
                ].forEach( testAllDayExpected( null ) );

            } );


            it( "handles ongoingEvents events", () => {

                [
                    { startTime: morning( weekAgo ), endTime: evening( weekLater ) },
                    { startTime: morning( weekAgo ), endTime: evening( today ) },
                    { startTime: morning( today ), endTime: evening( weekLater ) },
                ].forEach( event => {
                    test(
                        { ...event, allDay: false },
                        { startTime: morning( today ), endTime: evening( today ), allDay: false }
                    );
                    if ( event.allDay === undefined ) {
                        test(
                            { ...event, allDay: true },
                            { startTime: dayStart( today ), endTime: dayEnd( today ), allDay: true } );
                    }
                } );


                test(
                    { startTime: lateEvening( weekAgo ), endTime: earlyMorning( today ), allDay: true },
                    { startTime: dayStart( today ), endTime: dayEnd( today ), allDay: true }
                );


                test(
                    { startTime: lateEvening( today ), endTime: earlyMorning( weekLater ), allDay: true },
                    { startTime: dayStart( today ), endTime: dayEnd( today ), allDay: true }
                );


                test(
                    { startTime: lateEvening( weekAgo ), endTime: earlyMorning( weekLater ) },
                    { startTime: lateEvening( today ), endTime: earlyMorning( tomorrow ), allDay: false }
                );

            } );

            it( "handles future events", () => {

                [
                    { startTime: morning( tomorrow ), endTime: evening( weekLater ) },
                    { startTime: lateEvening( tomorrow ), endTime: earlyMorning( weekLater ) }
                ].forEach( testAllDayExpected( null ) );

            } );

        } );

    } );


    describe( "eventTense", () => {

        const currentTime = noon( today );

        const test = integrityWrapper(
            ( event, expected ) => expect( eventTense( event, today, currentTime ) ).toEqual( expected )
        );
        const testExpected = expectedWrapper( test );
        const testAllDayExpected = allDayExpectedWrapper( test );

        it( "handles one time events", () => {

            [
                { startTime: morning( yesterday ), endTime: evening( yesterday ) },
                { startTime: lateEvening( yesterday ), endTime: earlyMorning( today ), allDay: false },
                { startTime: lateEvening( yesterday ), endTime: evening( today ), allDay: false },
                { startTime: earlyMorning( today ), endTime: morning( today ), allDay: false },
                { startTime: subtractFromDate( currentTime, { minutes: config.eventThresholds.past } ), allDay: false },
            ].forEach( testAllDayExpected( "past" ) );

            [
                { startTime: morning( today ), endTime: evening( today ) },
                { startTime: currentTime, endTime: evening( today ) },
                { startTime: subtractFromDate( currentTime, { minutes: config.eventThresholds.past - 1 } ), endTime: evening( today ) },
            ].forEach( testExpected( "present" ) );

            [
                { startTime: morning( today ), endTime: evening( today ), allDay: true },
                { startTime: evening( today ), endTime: lateEvening( today ), allDay: true },
                { startTime: addToDate( currentTime, { minutes: config.eventThresholds.upcoming - 1 } ) },
                {
                    startTime: addToDate( currentTime, { minutes: config.eventThresholds.upcoming - 1 } ),
                    endTime: evening( today )
                },
            ].forEach( testExpected( "upcoming" ) );

            [
                { startTime: evening( today ), endTime: lateEvening( today ), allDay: false },
                { startTime: lateEvening( today ), endTime: earlyMorning( tomorrow ), allDay: false },
                { startTime: morning( tomorrow ), endTime: evening( tomorrow ) },
                { startTime: addToDate( currentTime, { minutes: config.eventThresholds.upcoming } ), allDay: false },
            ].forEach( testAllDayExpected( "future" ) );
        } );

        it( "handles reoccurring events", () => {
            [
                { startTime: morning( weekAgo ), endTime: evening( yesterday ) },
                { startTime: morning( weekAgo ), endTime: morning( today ), allDay: false },
                { startTime: lateEvening( weekAgo ), endTime: earlyMorning( today ), allDay: false },
                { startTime: lateEvening( weekAgo ), endTime: evening( today ), allDay: false },
            ].forEach( testAllDayExpected( "past" ) );

            [
                { startTime: morning( weekAgo ), endTime: evening( weekLater ) },
                { startTime: morning( weekAgo ), endTime: evening( today ) },
                { startTime: morning( weekAgo ), endTime: earlyMorning( weekLater ) },
                { startTime: earlyMorning( today ), endTime: evening( weekLater ) },
            ].forEach( testExpected( "present" ) );

            [
                { startTime: morning( weekAgo ), endTime: evening( weekLater ), allDay: true },
                { startTime: morning( weekAgo ), endTime: evening( today ), allDay: true },
                { startTime: morning( weekAgo ), endTime: earlyMorning( weekLater ), allDay: true },
                { startTime: earlyMorning( today ), endTime: evening( weekLater ), allDay: true },
                { startTime: lateEvening( today ), endTime: morning( weekLater ), allDay: true },
                {
                    startTime: addToDate( currentTime, { minutes: config.eventThresholds.upcoming - 1 } ),
                    endTime: evening( weekLater ),
                    allDay: false
                }
            ].forEach( testExpected( "upcoming" ) );

            [
                { startTime: lateEvening( weekAgo ), endTime: earlyMorning( weekLater ), allDay: false },
                { startTime: lateEvening( weekAgo ), endTime: evening( weekLater ), allDay: false },
                { startTime: evening( weekAgo ), endTime: lateEvening( weekLater ), allDay: false },
                { startTime: evening( today ), endTime: lateEvening( weekLater ), allDay: false },
                { startTime: morning( tomorrow ), endTime: evening( weekLater ) },
            ].forEach( testAllDayExpected( "future" ) );

        } );

    } );

} );
