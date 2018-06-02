import React from "react";
import Svg, { Path as Path_ } from "react-native-svg";
import { StyleSheet } from "react-native";
import omit from "lodash/omit";

// ATTN: generated by `yarn build-icons`, do not edit
export default ({ style = {}, color, ...rest }) => {
    const flattenedStyle = StyleSheet.flatten(style);
    const Path = props => (
        <Path_ fill={color || flattenedStyle.color} {...props} />
    );
    const props = { style: omit(flattenedStyle, ["color"]), ...rest };
    return (
        <Svg viewBox="0 0 34 30" {...props}>
            <Path d="M27.12 29.72l-9.61-5-9.61 5L9.74 19 2 11.45l10.71-1.56 4.8-9.73 4.8 9.73 10.74 1.56L25.28 19zM17.51 23l7.61 4-1.45-8.5 6.16-6-8.51-1.24-3.81-7.72-3.81 7.72-8.51 1.24 6.16 6L9.89 27z" />
        </Svg>
    );
};
