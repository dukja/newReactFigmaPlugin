import React, { useRef,useState ,useEffect, Children} from "react";
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Fade from '@mui/material/Fade';
import Fab from '@mui/material/Fab';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import LoadingButton from '@mui/lab/LoadingButton';
import SaveIcon from '@mui/icons-material/Save';
const theme = createTheme({
  typography: {
    // In Chinese and Japanese the characters are usually larger,
    // so a smaller fontsize may be appropriate.
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
interface ContentBoxProps {
  preMsg: string;
  conditionData: any;
  contentData: any;
  children?: React.ReactNode;
}




function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}
  interface Props {
    /**
     * Injected by the documentation to work in an iframe.
     * You won't need it on your project.
     */
    window?: () => Window;
  }
function ScrollTop(props:Props) {

  
  const { window } = props;
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const anchor = (
      (event.target as HTMLDivElement).ownerDocument || document
    ).querySelector('#back-to-top-anchor');

    if (anchor) {
      anchor.scrollIntoView({
        block: 'center',
      });
    }
  };

  return (
    <Fade in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        <Fab size="small" aria-label="scroll back to top">
          <KeyboardArrowUpIcon />
        </Fab>
      </Box>
    </Fade>
  );
}
function App(props: Props) {
  const [loading, setLoading] = useState(false);
  const [nodeStyle, setNodeStyle] = useState(null);
  const [nodeName, setNodeName] = useState(null);
  const [seletedNode, setNodeSelected] = useState(null);

  const [value, setValue] = React.useState(0);
  const nodeStyleContentRef = useRef(null);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
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
      }
      if (eventData.pluginMessage && eventData.pluginMessage.type === 'get_selected') {
        setNodeSelected(eventData.pluginMessage.seletedNode);
      }
    };
  }, []);

  const handleLoading = () => {
    setLoading(true);
    window.parent.postMessage({ pluginMessage: { type: 'request_info' } }, '*');
  }


  const handleCopy = () => {
    const nodeStyleContentRef = useRef<HTMLPreElement | null>(null);
    const content = nodeStyleContentRef.current?.textContent;

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
}
function openExternalLink(url:any) {
  window.parent.postMessage({ pluginMessage: { type: 'open-external-link', url: url } }, '*');
}
const ContentBox: React.FC<ContentBoxProps> = ({preMsg, conditionData, contentData, children}) => {
  return(
    <Grid container rowSpacing={1}>
      <Grid item xs={12} >   
        <Typography color="text.secondary" variant="caption"><pre ref={nodeStyleContentRef} id="nodeStyleContent">    
        {conditionData ?  JSON.stringify(contentData, null, 2): preMsg}</pre></Typography> 
        {children}
      </Grid>
    </Grid> 
)}

function handleGetInfo () {
  window.parent.postMessage({ pluginMessage: { type: 'request_selected' } }, '*');
}
  return (
    <ThemeProvider theme={theme}>
        <main>
          <Container maxWidth="md">
            <Box sx={{position: 'fixed',top:"20px", left:"16px",right:"16px" ,backgroundColor:"rgba(255, 255, 255, 0.8)"}}  >
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Stack direction={"row"} alignItems="center" justifyContent="space-between" spacing={2} sx={{backgroundColor:"rgba(0, 0, 0, 0.05)",padding:"12px", borderRadius:"12px"}}>
                    <Typography color="info" variant="caption">
                      https://jsonviewer.stack.hu/
                    </Typography>
                    <Stack direction={"row"} spacing={1}>
                    {
                       nodeStyle? 
                       <Button onClick={handleCopy} variant="contained">Copy</Button>:
                        (loading? 
                          <LoadingButton loading loadingPosition="start" startIcon={<SaveIcon />} variant="contained">Loading</LoadingButton>:
                          <Button onClick={handleLoading} variant="outlined">Start</Button>
                        ) 
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
            </Box>
            <Box id="back-to-top-anchor" />
            <Box sx={{marginTop:"114px"}}>
              <CustomTabPanel value={value} index={0}>
                <ContentBox conditionData={nodeStyle} contentData={nodeStyle} children={undefined} preMsg={`[START]를 클릭하고 기다려주세요`}/>
              </CustomTabPanel>
              <CustomTabPanel value={value} index={1}>
                <ContentBox conditionData={nodeStyle} contentData={nodeName} children={undefined} preMsg={`[START]를 클릭하고 기다려주세요`}/>
              </CustomTabPanel>
              <CustomTabPanel value={value} index={2}>
                <ContentBox conditionData={seletedNode} contentData={seletedNode} preMsg={`에셋을 선택하고 [GET INFO]을 클릭해 주세요`}>
                  <Button onClick={handleGetInfo} variant="contained">GET INFO</Button>
                </ContentBox>
              </CustomTabPanel>
            </Box>
          </Container>
          <ScrollTop {...props}/>        
        </main>
    </ThemeProvider>
  );
}

export default App;
