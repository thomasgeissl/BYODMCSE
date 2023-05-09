import { createTheme } from "@mui/material/styles";
// https://coolors.co/palette/000000-14213d-fca311-e5e5e5-ffffff

const backgroundColor = "#001524"
const primary = "#15616d"
const secondary = "#ffecd1"
const tertiary = "#ff7d00"
const quarternary = "#78290f"
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
export {backgroundColor, primary, secondary, tertiary, quarternary}
