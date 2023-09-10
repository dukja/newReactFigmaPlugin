import React from "react";
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
interface ContentBoxProps {
    preMsg: string;
    conditionData: any;
    contentData: any;
    children?: React.ReactNode;
    contentRef:any;
  }
const ContentBox: React.FC<ContentBoxProps> = ({preMsg, conditionData, contentData, children , contentRef}) => {
    return(
      <Grid container rowSpacing={1}>
        <Grid item xs={12} >   
          <Typography color="text.secondary" variant="caption"><pre ref={contentRef} id="nodeStyleContent">    
          {conditionData ?  JSON.stringify(contentData, null, 2): preMsg}</pre></Typography> 
          {children}
        </Grid>
      </Grid> 
)}

export {ContentBox}