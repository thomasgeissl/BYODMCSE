import { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
function Login() {
	const [orchestraId, setOrchestraId] = useState("")
	const onEnterClicked = (event) => {
		console.log("on enter clicked")
	}
  return (
    <div>
	    <TextField label="room id" variant="outlined" value={orchestraId} />
	    <Button variant="outlined" onClick={onEnterClicked}>enter</Button>
    </div>
  )
}

export default Login
