import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { Box } from "@mui/material";
import "./App.css";
import Room from "./components/Room";
import theme from "./theme";
import SoundCheck from "./components/SoundCheck.tsx";
import useLiveSetStore from "./store/liveSet";
import { useEffect } from "react";

const router = createBrowserRouter([
  {
    path: "/",
    element: <SoundCheck></SoundCheck>
  },
  {
    path: "/rooms/:roomId",
    element: <Room></Room>
  },
]);

function App() {
  return (
    <Box width={"100vw"} height={"100vh"} display={"flex"}>
    <ThemeProvider theme={theme}>
      <CssBaseline></CssBaseline>
      <RouterProvider
        router={router}
      >
      </RouterProvider>
    </ThemeProvider>
    </Box>
  );
}

export default App;
