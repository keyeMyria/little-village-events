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
        <Svg viewBox="0 0 29 30" {...props}>
            <Path d="M8.25.25v21.3A4.74 4.74 0 1 0 9.75 25V8.25h17.5v10.3a4.74 4.74 0 1 0 1.5 3.45V.25zM5 28.25A3.25 3.25 0 1 1 8.25 25 3.26 3.26 0 0 1 5 28.25zm19-3A3.25 3.25 0 1 1 27.25 22 3.26 3.26 0 0 1 24 25.25zM9.75 6.75v-5h17.5v5z" />
        </Svg>
    );
};