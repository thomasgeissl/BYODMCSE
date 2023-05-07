import { useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import Login from "./components/Login";
import Rooms from "./components/Rooms";
import Room from "./components/Room";
import styled from "@emotion/styled";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import "./App.css";
import Lobby from "./components/Lobby";
import theme from "./theme";

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  text-align: center;
`;

function App() {
  return (
    <BrowserRouter
      basename={import.meta.env.MODE === "development" ? "/" : `/BYODMCSE`}
    >
      <ThemeProvider theme={theme}>
        <Container>
          <Routes>
            <Route path="/" element={<Login></Login>}></Route>
            <Route path="/rooms" element={<Rooms></Rooms>}></Route>
            <Route path="/rooms/:roomId" element={<Lobby />} />
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
    </BrowserRouter>
  );
}

export default App;
