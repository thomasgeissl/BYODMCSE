import { useState } from "react";
import Login from "./components/Login";
import styled from "@emotion/styled";

const Container = styled.div`
  width: 100vw;
  height: 100vh;
`;

function App() {
  return (
    <Container>
      <Login></Login>
    </Container>
  );
}

export default App;
