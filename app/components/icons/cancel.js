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
        <Svg viewBox="0 0 24 24" {...props}>
            <Path d="M3.586 19L19.001 3.585 20.415 5 5 20.415z" />
            <Path d="M3.586 5L5 3.585 20.415 19l-1.414 1.415z" />
        </Svg>
    );
};
