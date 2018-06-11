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
        <Svg viewBox="0 0 27 30" {...props}>
            <Path d="M23.22 9.18C20.73 7.23 18.06 7.66 15.7 8c-.66.11-1.28.19-1.88.24-.34-2.67-2.32-5.75-5.14-6.6l-.43 1.48c2.15.64 3.72 3.06 4.06 5.15-.56 0-1.13-.13-1.74-.23-2.36-.38-5-.81-7.52 1.14C-.24 11.75-1.1 19 2.93 25.26c3.3 5.14 6.73 4.64 9 4.3a6.85 6.85 0 0 1 2.39 0 14.19 14.19 0 0 0 2.08.19c2.05 0 4.52-.74 6.93-4.49 4.03-6.26 3.17-13.51-.11-16.08zm-1.15 15.27c-2.77 4.33-5.41 3.94-7.52 3.62a10.64 10.64 0 0 0-1.42-.14 10.5 10.5 0 0 0-1.41.14c-2.12.32-4.75.71-7.53-3.62C.42 18.57 1.52 12.28 4 10.36c2-1.54 4.09-1.2 6.35-.83a18 18 0 0 0 2.8.3 18 18 0 0 0 2.81-.3c2.25-.37 4.38-.71 6.35.83 2.44 1.92 3.54 8.21-.24 14.09z" />
            <Path d="M18.17 5.57a4.44 4.44 0 0 0 1.31-3.17V.25h-.75a4.47 4.47 0 0 0-4.48 4.48v2.15H15a4.44 4.44 0 0 0 3.17-1.31zm-2.42-.84a3 3 0 0 1 .87-2.11A3.11 3.11 0 0 1 18 1.84v.56a3 3 0 0 1-2.23 2.89z" />
        </Svg>
    );
};