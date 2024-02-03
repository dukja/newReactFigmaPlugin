import React, { useRef,useState ,useEffect} from "react";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import LoadingButton from '@mui/lab/LoadingButton';
import {CustomTabPanel, a11yProps} from "./CustomTabPanel"
import {ScrollTop, Props} from "./ScrollTop"
function App(props: Props) {
  const [loading, setLoading] = useState(false);
  const [nodeStyle, setNodeStyle] = useState(null);
  const [nodeName, setNodeName] = useState(null);
  const [seletedNode, setNodeSelected] = useState(null);
  const [value, setValue] = React.useState(0);
  const styleContentRef = useRef<HTMLPreElement | null>(null);
  const nameContentRef = useRef<HTMLPreElement | null>(null);
  const selectedContentRef = useRef<HTMLPreElement | null>(null);


  const handleChange = (_event: React.SyntheticEvent,newValue: number) => {
    setValue(newValue);
  };
  useEffect(() => {
    window.onmessage = (event) => {
      const { data: eventData } = event;
      if (eventData.pluginMessage && eventData.pluginMessage.type === 'get_style') {
        setNodeStyle(eventData.pluginMessage.nodeStyle);
        setLoading(false);
      }
      if (eventData.pluginMessage && eventData.pluginMessage.type === 'get_name') {
        setNodeName(eventData.pluginMessage.nodeName);
        setLoading(false);
      }
      if (eventData.pluginMessage && eventData.pluginMessage.type === 'get_selected') {
        setNodeSelected(eventData.pluginMessage.seletedNode);
        setLoading(false);
      }
      if (eventData.pluginMessage && eventData.pluginMessage.type === 'get_reset') {
        setNodeStyle(eventData.pluginMessage.nodeStyle);
        setNodeSelected(eventData.pluginMessage.seletedNode);
      }
    };
  }, []);

  const handleLoading = () => {
    setLoading(true);
    window.parent.postMessage({ pluginMessage: { type: 'request_style' } }, '*');
  }

  // const handleReset = () => {
  //   window.parent.postMessage({ pluginMessage: { type: 'request_reset' } }, '*');
    
  // }

  function handleGetInfo () {
    window.parent.postMessage({ pluginMessage: { type: 'request_selected' } }, '*');
  }

  const handleCopy = async () => {
    let content;

    if (value === 0) {
        content = styleContentRef.current?.textContent;
    } else if (value === 1) {
        content = nameContentRef.current?.textContent;
    } else if (value === 2) {
        content = selectedContentRef.current?.textContent;
    }
    if (content) {
      const el = document.createElement('textarea');
      el.value = content;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      alert("Copied to clipboard!");  // 복사 완료 
    } else {
        alert("Failed to copy!");  // 복사 실패
    }
};


  return (
        <>
          <Container maxWidth="md">
            <Stack sx={{position: 'fixed',top:"20px", left:"16px",right:"16px" ,backgroundColor:"rgba(255, 255, 255, 0.8)"}}  >
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Stack direction={"row"} alignItems="center" justifyContent="space-between" spacing={2} sx={{backgroundColor:"rgba(0, 0, 0, 0.05)",padding:"12px", borderRadius:"12px"}}>
                    <Stack direction={"row"} spacing={1}>
                    {
                      loading? 
                      <LoadingButton size="small" onClick={handleLoading} loading={loading} variant="contained">Loading</LoadingButton>:
                      <><Button onClick={handleLoading} variant="outlined">all Style</Button>
                      <Button onClick={handleGetInfo} variant="outlined" {...a11yProps(2)}>selected Style</Button>
                      {/* <Button onClick={handleReset} variant="outlined">Reset</Button> */}
                      <Button onClick={handleCopy} variant="contained">Copy</Button></>
                    }
                    </Stack>
                    {/* <Typography color="info" variant="caption">
                      https://jsonviewer.stack.hu/
                    </Typography> */}
                  </Stack>
                </Grid>                 
                <Grid item xs={12}>
                    <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                      <Tab label="all style" {...a11yProps(0)} />
                      <Tab label="asset name" {...a11yProps(1)} />
                      <Tab label="selected Style" {...a11yProps(2)} />
                    </Tabs>
                </Grid>
              </Grid>        
            </Stack>
            <Stack id="back-to-top-anchor" />
            <Stack sx={{marginTop:"140px"}}>
              <CustomTabPanel value={value} index={0}>
                    {nodeStyle ? <Typography ref={styleContentRef} id="nodeStyleContent"  color="text.secondary"  sx={{whiteSpace:"pre"}} variant="caption"> {JSON.stringify(nodeStyle, null, 2)}</Typography>:
                    <Typography ref={styleContentRef} id="nodeStyleContent"  color="text.secondary"  sx={{whiteSpace:"pre"}} variant="caption"> [ALL STYLE]을 클릭하고 기다려주세요</Typography>}
              </CustomTabPanel>
              <CustomTabPanel value={value} index={1}>
                    {nodeStyle ? <Typography ref={nameContentRef} id="nodeStyleContent" color="text.secondary" sx={{whiteSpace:"pre"}} variant="caption">{JSON.stringify(nodeName, null, 2)}</Typography>: 
                    <Typography ref={nameContentRef} id="nodeStyleContent" color="text.secondary" sx={{whiteSpace:"pre"}} variant="caption">[ALL STYLE]을 클릭하고 기다려주세요</Typography>}
              </CustomTabPanel>
              <CustomTabPanel value={value} index={2}>
                    {seletedNode ?  <Typography ref={selectedContentRef} id="nodeStyleContent" color="text.secondary" sx={{whiteSpace:"pre"}} variant="caption">{JSON.stringify(seletedNode, null, 2)}</Typography>: 
                    <Typography ref={selectedContentRef} id="nodeStyleContent" color="text.secondary" sx={{whiteSpace:"pre"}} variant="caption">에셋을 선택하고 [SELECTED STYLE]을 클릭해 주세요</Typography>}
              </CustomTabPanel>
              </Stack>
          </Container>
          <ScrollTop {...props}/>     
        </>
  );
}
export default App;
