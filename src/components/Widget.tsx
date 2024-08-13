import { Box, Button } from "@mui/material";
import { backgroundColor } from "../theme";

interface Props extends React.PropsWithChildren {
}

function Widget({children}:Props) {
  return (
    <Box sx={{height: "100%", width: "500px", backgroundColor: "rgb(24,24,24)", borderRadius: "24px", padding: "24px", overflow: "auto"}} display={"flex"} gap={3}>
      {children}
    </Box>
  );
}

export default Widget;
