import {
  Slider,
  Select,
  MenuItem,
  Grid,
  Typography,
  Checkbox,
} from "@mui/material";
import useLiveSetStore from "../store/liveSet";

interface Props {
  parameter: any;
}

const Parameter = ({ parameter }: Props) => {
  const setParameterValue = useLiveSetStore((state) => state.setParameterValue);
  const { value, options, name } = parameter;
  return (
    <Grid container>
      <Grid item xs={3}>
        <Typography>{name}</Typography>
      </Grid>
      <Grid item xs={9}>
        {typeof value === "boolean" && (
          <Checkbox
            checked={value}
            onChange={(event: any) => {
              setParameterValue(parameter.id, !value);
            }}
          ></Checkbox>
        )}
        {typeof value === "number" && (
          <Slider
            value={value}
            min={options?.min || 0}
            max={options?.max || 1}
            step={0.001}
            onChange={(event: any) => {
              setParameterValue(parameter.id, event.target.value);
            }}
          />
        )}
        {typeof value === "string" && Array.isArray(options) && (
          <Select
            fullWidth
            value={value}
            label={name}
            size="small"
            onChange={(event) => {
              setParameterValue(parameter.id, event.target.value);
            }}
          >
            {options?.map((option: any, index: number) => (
              <MenuItem key={index} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        )}
      </Grid>
    </Grid>
  );

  return <pre>{JSON.stringify(parameter, null, 4)}</pre>;
};

export default Parameter;
