import React,{useState} from "react";
import {Tabs,Tab,Button,Stack,FormControl,FormLabel,FormControlLabel,Radio,Container,RadioGroup,FormHelperText} from '@mui/material';
import {CustomTabPanel, a11yProps} from "./CustomTabPanel"
import {ScrollTop, Props} from "./ScrollTop"
import SpacingTable from "./Convention";
function App(props: Props) {
  const [nodeType, setNodeType] = useState('');
  const [value, setValue] = React.useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleNodeTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNodeType(event.target.value); 
  };

  function handleCreate() {
    window.parent.postMessage({ pluginMessage: { type: 'request_create', nodeType: nodeType } }, '*');
  }

  return (
    <>
      <Container maxWidth="md">
        <Stack sx={{position: 'fixed',top:"0px" ,backgroundColor:"rgba(255, 255, 255, 0.8)"}}  >
          <Tabs value={value} onChange={handleChange} aria-label="">
            <Tab label="create node" {...a11yProps(0)} />
            <Tab label="convention" {...a11yProps(1)} />
          </Tabs>
        </Stack>
        <Stack id="back-to-top-anchor" />
        <Stack sx={{marginTop:"48px"}}>
          <CustomTabPanel value={value} index={0}>
          <Stack direction={"row"} spacing={1} sx={{backgroundColor:"rgba(0, 0, 0, 0.05)",padding:"6px", borderRadius:"12px"}}>
            <Button onClick={handleCreate} disabled={!nodeType}>Create</Button>
          </Stack>
          <FormControl sx={{marginTop:"16px"}}>
            <FormLabel id="demo-radio-buttons-group-label">에셋을 선택하고 Node Type을 선택한 후 생성해 주세요</FormLabel>
            <RadioGroup
              aria-labelledby="demo-radio-buttons-group-label"
              defaultValue="female"
              name="radio-buttons-group"
              onChange={handleNodeTypeChange} 
            >
              <FormControlLabel value="Stack" control={<Radio />} label="Stack" />
              <FormControlLabel value="컴포넌트명-{id 구분자}" control={<Radio />} label="컴포넌트명-{id 구분자}" />
              <FormControlLabel value="Grid {xs 숫자}" control={<Radio />} label="Grid {xs 숫자}" />
              <FormControlLabel value="Grid {container}" control={<Radio />} label="Grid {container}" />
              <FormControlLabel value="th {colspan 숫자} {rowspan 숫자}" control={<Radio />} label="th {colspan 숫자} {rowspan 숫자}" />
              <FormControlLabel value="td {colspan 숫자} {rowspan 숫자}" control={<Radio />} label="td {colspan 숫자} {rowspan 숫자}" />
              <FormControlLabel value="Image-Stack" control={<Radio />} label="Image-Stack" />
            </RadioGroup>
            <FormHelperText>한글로 된 부분을 반영해 주세요</FormHelperText>
          </FormControl>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <SpacingTable/>
          </CustomTabPanel>
          </Stack>
      </Container>
      <ScrollTop {...props}/>     
    </>
  );
}
export default App;
