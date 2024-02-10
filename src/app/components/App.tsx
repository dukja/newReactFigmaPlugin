import React, { useRef,useState ,useEffect} from "react";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import {CustomTabPanel, a11yProps} from "./CustomTabPanel"
import {ScrollTop, Props} from "./ScrollTop"
function App(props: Props) {
  const [nodeInfos, setNodeInfos] = useState(null);
  const [nodeNames, setNodeName] = useState(null);
  const [nodeProperty, setProperty] = useState(null);
  const [seletedNode, setNodeSelected] = useState(null);
  const [value, setValue] = React.useState(0);
  const styleContentRef = useRef<HTMLPreElement | null>(null);
  const nameContentRef = useRef<HTMLPreElement | null>(null);
  const selectedContentRef = useRef<HTMLPreElement | null>(null);


  useEffect(() => {
    window.onmessage = (event) => {
      const { data: eventData } = event;
      if (eventData.pluginMessage && eventData.pluginMessage.type === 'get_infos') {
        setNodeInfos(eventData.pluginMessage.nodesInfos);
      }
      if (eventData.pluginMessage && eventData.pluginMessage.type === 'get_names') {
        setNodeName(eventData.pluginMessage.nodeNames);
      }
      if (eventData.pluginMessage && eventData.pluginMessage.type === 'get_Property') {
        setProperty(eventData.pluginMessage.property);
      }
      if (eventData.pluginMessage && eventData.pluginMessage.type === 'get_selected') {
        setNodeSelected(eventData.pluginMessage.seletedNode);
      }
      if (eventData.pluginMessage && eventData.pluginMessage.type === 'get_reset') {
        setNodeSelected(eventData.pluginMessage.seletedNode);
      }
    };
  }, []);

  const handleChange = (_event: React.SyntheticEvent,newValue: number) => {
    setValue(newValue);
  };

  const handleInfos = () => {
    window.parent.postMessage({ pluginMessage: { type: 'request_infos' } }, '*');
  }

  const handleReset = () => {
    window.parent.postMessage({ pluginMessage: { type: 'request_reset' } }, '*');
  }

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

  const CtrlNodes = ()=>{
    return(
      <Stack direction={"row"} spacing={1} sx={{backgroundColor:"rgba(0, 0, 0, 0.05)",padding:"6px", borderRadius:"12px"}}>
        <Button onClick={handleInfos} disabled={nodeInfos!==null || nodeInfos}>{nodeInfos? `Loaded`:`Loading`}</Button>
        <Button onClick={handleCopy} disabled={!nodeInfos}>Copy</Button>
      </Stack>
    )
  }


  return (
        <>
          <Container maxWidth="md">
            <Stack sx={{position: 'fixed',top:"0px" ,backgroundColor:"rgba(255, 255, 255, 0.8)"}}  >
              <Tabs value={value} onChange={handleChange} aria-label="">
                <Tab label="all nodes" {...a11yProps(0)} />
                <Tab label="names" {...a11yProps(1)} />
                <Tab label="property" {...a11yProps(1)} />
                <Tab label="selected node" {...a11yProps(2)} />
              </Tabs>
            </Stack>
            <Stack id="back-to-top-anchor" />
            <Stack sx={{marginTop:"48px"}}>
              <CustomTabPanel value={value} index={0}>
                <CtrlNodes/>
                <Typography ref={styleContentRef} id="nodeStyleContent"  color="text.secondary"  sx={{whiteSpace:"pre"}} variant="caption">{nodeInfos &&  JSON.stringify(nodeInfos, null, 2)}</Typography>
              </CustomTabPanel>
              <CustomTabPanel value={value} index={1}>
                <CtrlNodes/>
                <Typography ref={nameContentRef} id="nodeStyleContent" color="text.secondary" sx={{whiteSpace:"pre"}} variant="caption">{nodeInfos && JSON.stringify(nodeNames, null, 2)}</Typography>
              </CustomTabPanel>
              <CustomTabPanel value={value} index={2}>
                <CtrlNodes/>
                <Typography ref={selectedContentRef} id="nodeStyleContent" color="text.secondary" sx={{whiteSpace:"pre"}} variant="caption">{nodeInfos &&  JSON.stringify(nodeProperty, null, 2)}</Typography>
              </CustomTabPanel>
              <CustomTabPanel value={value} index={3}>
                <Stack direction={"row"} spacing={1} sx={{backgroundColor:"rgba(0, 0, 0, 0.05)",padding:"6px", borderRadius:"12px"}}>
                    <Button onClick={handleGetInfo} {...a11yProps(2)} disabled={seletedNode !== null}>selected Style</Button>
                    <Button onClick={handleReset} disabled={!seletedNode}>Reset</Button>
                    <Button onClick={handleCopy} disabled={!seletedNode}>Copy</Button>
                </Stack>
                <Typography ref={selectedContentRef} id="nodeStyleContent" color="text.secondary" sx={{whiteSpace:"pre"}} variant="caption">{seletedNode &&  JSON.stringify(seletedNode, null, 2)}</Typography>
              </CustomTabPanel>
              </Stack>
          </Container>
          <ScrollTop {...props}/>     
        </>
  );
}
export default App;
