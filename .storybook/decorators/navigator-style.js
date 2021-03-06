import BackIcon from "/app/components/icons/back";
import navStyles from "/app/navigator/styles";

import { injectState } from "@textpress/freactal";

import { StyleSheet } from "react-native";
import React, { Fragment } from "react";
import { compose } from "recompose";

import _isString from "lodash/isString"


const styles = StyleSheet.create( {
    back: {
        position: "absolute",
        left: 5,
        top: 31,
        width: 22,
        height: 22
    }
} );


export default function navigatorStyleDecorator( options ) {
    if ( _isString( options.style ) )
        options.style = navStyles[ options.style ];

    const navStyle = options.style || options.navigatorStyle;

    function StorybookProvider( { children } ) {

        const navigatorStyle = ( { state, children } ) => {
            state.navigator.setStyle( navStyle );
            state.navigator.setButtons( { rightButtons: [], leftButtons: [], ...( options.navigatorButtons || {} ) } );

            return <Fragment>{ children }</Fragment>;
        };

        const NavigatorStyle = compose( injectState )(
            navigatorStyle
        );

        return (
            <NavigatorStyle>
                { children }
                { options.back
                    ? <BackIcon style={ [ styles.back, { color: navStyle.navBarButtonColor || "#000" } ] } />
                    : null }
            </NavigatorStyle>
        );
    }

    return ( story ) => {
        return <StorybookProvider>{ story() }</StorybookProvider>;
    };
}
