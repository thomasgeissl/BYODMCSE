import { useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import Login from "./components/Login";
import Rooms from "./components/Rooms";
import Stage from "./components/Stage";
import styled from "@emotion/styled";
import { HashRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import "./App.css";
import Room from "./components/Room";
import theme, {backgroundColor, primary} from "./theme";

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: ${backgroundColor};
  color: white;
  a{
    color: ${primary}
  }
  display: flex;
`;

function App() {
  return (
    <Router
      // basename={import.meta.env.MODE === "development" ? "/" : `/BYODMCSE`}
    >
      <ThemeProvider theme={theme}>
        <Container>
          <Routes>
            {/* <Route path="/" element={<Login></Login>}></Route> */}
            <Route path="/" element={<Room></Room>}></Route>
            <Route path="/rooms" element={<Rooms></Rooms>}></Route>
            <Route path="/rooms/:roomId" element={<Room />} />
            <Route
              path="*"
              element={
                <main style={{ padding: "1rem" }}>
                  <p>There's nothing here!</p>
                </main>
              }
            />
          </Routes>
        </Container>
      </ThemeProvider>
    </Router>
  );
}

export default App;
