import React from "react";
import Grid from '@mui/material/Grid';
interface ContentBoxProps {
    children?: React.ReactNode;

  }
const ContentBox: React.FC<ContentBoxProps> = ({children}) => {
    return(
      <Grid container rowSpacing={1}>
        <Grid item xs={12} >   
          {children}
        </Grid>
      </Grid> 
)}

export {ContentBox}