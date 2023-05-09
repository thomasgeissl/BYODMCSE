import { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3;
`;

function Login() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const onEnterClicked = (event) => {
    navigate(`/rooms/${roomId}`, { replace: true });
  };
  return (
    <Container>
      <TextField
        label="room id"
        variant="outlined"
        value={roomId}
        size="big"
        onChange={(event) => setRoomId(event.target.value)}
      />
      <Button variant="outlined" onClick={onEnterClicked}>
        enter
      </Button>
    </Container>
  );
}

export default Login;
