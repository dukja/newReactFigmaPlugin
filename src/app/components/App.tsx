import React, { useRef,useState ,useEffect} from "react";
import Box from '@mui/material/Box';
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
import {ContentBox} from "./ContentBox"
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
      console.log("Received message in App.tsx", event.data);
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
    };
  }, []);

  const handleLoading = () => {
    setLoading(true);
    window.parent.postMessage({ pluginMessage: { type: 'request_info' } }, '*');
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


  function handleGetInfo () {
    window.parent.postMessage({ pluginMessage: { type: 'request_selected' } }, '*');
  }
  return (
        <main>
          <Container maxWidth="md">
            <Stack sx={{position: 'fixed',top:"20px", left:"16px",right:"16px" ,backgroundColor:"rgba(255, 255, 255, 0.8)"}}  >
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Stack direction={"row"} alignItems="center" justifyContent="space-between" spacing={2} sx={{backgroundColor:"rgba(0, 0, 0, 0.05)",padding:"12px", borderRadius:"12px"}}>
                    <Typography color="info" variant="caption">
                      https://jsonviewer.stack.hu/
                    </Typography>
                    <Stack direction={"row"} spacing={1}>
                    {
                      loading? 
                      <LoadingButton size="small" onClick={handleLoading} loading={loading} variant="outlined">Loading</LoadingButton>:
                      <><Button onClick={handleLoading} variant="outlined">Start</Button>
                      <Button onClick={handleCopy} variant="contained">Copy</Button></>
                    }
                    </Stack>
                  </Stack>
                </Grid>                 
                <Grid item xs={12}>
                    <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                      <Tab label="style" {...a11yProps(0)} />
                      <Tab label="name" {...a11yProps(1)} />
                      <Tab label="selected" {...a11yProps(2)} />
                    </Tabs>
                </Grid>
              </Grid>        
            </Stack>
            <Stack id="back-to-top-anchor" />
            <Stack sx={{marginTop:"114px"}}>
              <CustomTabPanel value={value} index={0}>
                <ContentBox>
                  <pre ref={styleContentRef} id="nodeStyleContent">   <Typography component="div" color="text.secondary" variant="caption"> 
                  {nodeStyle ?  JSON.stringify(nodeStyle, null, 2): `[START]를 클릭하고 기다려주세요`}</Typography></pre> 
                </ContentBox>
              </CustomTabPanel>
              <CustomTabPanel value={value} index={1}>
                <ContentBox>
                <pre ref={nameContentRef} id="nodeStyleContent"><Typography component="div" color="text.secondary" variant="caption">  
                  {nodeStyle ?  JSON.stringify(nodeName, null, 2): `[START]를 클릭하고 기다려주세요`}</Typography></pre> 
                  </ContentBox>
              </CustomTabPanel>
              <CustomTabPanel value={value} index={2}>
                <ContentBox>
                  <pre ref={selectedContentRef} id="nodeStyleContent"><Typography component="div" color="text.secondary" variant="caption">    
                  {seletedNode ?  JSON.stringify(seletedNode, null, 2): `에셋을 선택하고 [GET INFO]을 클릭해 주세요`}</Typography></pre> 
                  <Button onClick={handleGetInfo} variant="contained">GET INFO</Button>
                </ContentBox>
              </CustomTabPanel>
            </Stack>
          </Container>
          <ScrollTop {...props}/>        
        </main>
  );
}
export default App;
