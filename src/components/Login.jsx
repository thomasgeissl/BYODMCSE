import { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";
const Container = styled.div``;

function Login() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const onEnterClicked = (event) => {
    console.log("on enter clicked");
    navigate(`/rooms/${roomId}`, { replace: true });
  };
  return (
    <Container>
      enter room id
      <TextField
        label="room id"
        variant="outlined"
        value={roomId}
        size="small"
	onChange={(event)=>setRoomId(event.target.value)}
      />
      <Button variant="outlined" onClick={onEnterClicked}>
        enter
      </Button>
    </Container>
  );
}

export default Login;
