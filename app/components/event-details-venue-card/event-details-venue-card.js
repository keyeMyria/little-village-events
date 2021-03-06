import { TouchableLink } from "../touchable";
import Button from "../event-details-button";
import Card from "../event-details-icon-card";

import PhoneIcon from "../icons/phone";
import PinIcon from "../icons/pin";

import React, { Fragment } from "react";
import { parseLocation } from "parse-address";
import { Text, View, StyleSheet } from "react-native";

import _isFinite from "lodash/isFinite";


const styles = StyleSheet.create( {
    name: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "flex-start",
        paddingTop: 2,
        paddingBottom: 2
    },
    word: {
        fontSize: 16,
        fontWeight: "600",
        lineHeight: 18
    },
    call: {
        marginLeft: 6

    },
    phoneIcon: {
        width: 16,
        height: 16,
        color: "#007aff"
    },
    address: {
        fontSize: 12
    }

} );

const NameAndPhone = ( { venue, call } ) => {
    const { name, phone } = venue;

    let parts = [];
    if ( name ) {
        const words = name.split( " " );
        parts = words.map( ( word, i ) =>
            <Text style={ styles.word } key={i}>{ i !== words.length - 1 ? `${word} ` : word }</Text>
        );
    }

    if ( phone ) {
        parts.push(
            <TouchableLink key="call" style={ styles.call } onPress={ () => call( phone ) }>
                <PhoneIcon style={ styles.phoneIcon } />
            </TouchableLink>
        );
    }
    return parts.length ? (
        <View style={ styles.name }>
            { parts }
        </View>
    ) : null;
};

function joinAddressParts( parts, separator = " " ) {
    return parts
        .filter( p => !!p )
        .join( separator )
}

const Address = ( { address } ) => {
    const parsedAddress = address && parseLocation( address );
    if ( !parsedAddress )
        return null;

    const line1 = joinAddressParts( [
        parsedAddress.number,
        parsedAddress.prefix,
        parsedAddress.street,
        parsedAddress.type,
        parsedAddress.suffix,
        parsedAddress.sec_unit_type,
        parsedAddress.sec_unit_num
    ] );

    const line2 = joinAddressParts( [
        parsedAddress.city,
        joinAddressParts( [ parsedAddress.state, parsedAddress.zip ] )
    ], ", " );

    const parts = [ line1, line2 ]
        .map( ( line, index ) => line && <Text key={ index } style={ styles.address }>{ line.toUpperCase() }</Text> );
    return parts.length ? (
        <Fragment>{ parts }</Fragment>
    ) : null;
};

const DirectionsButton = ( { style, venue, openMap } ) => {
    const { name, latitude, longitude } = venue;
    return _isFinite( latitude ) && _isFinite( longitude )
        ? <Button style={ style } label="Directions" onPress={ () => openMap( { longitude, latitude, name } ) }/>
        : null
    ;
};

export const VenueCard = ( { venue, call, openMap } ) => (
    <Card
        style={ styles.root }
        renderIcon={ PinIcon }
        renderButton={ ( { style } ) => (
            <DirectionsButton
                style={ style }
                venue={ venue }
                openMap={ openMap }
            />
        ) }
    >
        <NameAndPhone venue={ venue } call={ call }/>
        <Address address={ venue.address }/>
    </Card>
);

export default ( { event, call, openMap } ) => {
    const { venue } = event;
    if ( !venue )
        return null;

    return <VenueCard venue={ venue } call={ call } openMap={ openMap }/>;
}
