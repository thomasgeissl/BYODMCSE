import { createTheme } from "@mui/material/styles";
// https://coolors.co/palette/000000-14213d-fca311-e5e5e5-ffffff

const backgroundColor = "#181818"
const primary = "#FCA311"
const secondary = "#FFFFFF"
const tertiary = "#14213D"
const theme = createTheme({
  palette: {
    mode: "dark",
    // TODO: get the correct frog green
    // and the secondary color
    primary: {
      main: primary,
    },
    secondary: {
      main: secondary,
    },
  },
});

export default theme;
export {backgroundColor, primary, secondary, tertiary}
