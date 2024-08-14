import { Box, Button, Typography } from "@mui/material";
import { backgroundColor } from "../theme";

interface Props extends React.PropsWithChildren {
  title: string;
}

function Widget({ children, title }: Props) {
  return (
    <Box
      sx={{
        height: "100%",
        width: "500px",
        backgroundColor: "rgb(24,24,24)",
        borderRadius: "24px",
        padding: "12px",
        overflow: "auto",
      }}
      display={"flex"}
      gap={2}
      flexDirection="column"
    >
      <Typography variant="h6" color="primary">
        {title}
      </Typography>
      {children}
    </Box>
  );
}

export default Widget;
