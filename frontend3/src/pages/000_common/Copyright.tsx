import React, { useMemo } from "react";
import { Typography, Link } from '@material-ui/core'
export const Copyright = () => {
  const copyright = useMemo(()=>{
    return (
      <Typography color="textSecondary" align="center">
        Copyright ©
        <Link color="inherit" href="https://www.flect.co.jp/">
          FLECT, Co., Ltd.
          </Link>{' '}
        {new Date().getFullYear()}
      </Typography>
    );
  
  },[])
  return <>{copyright}</>
}
