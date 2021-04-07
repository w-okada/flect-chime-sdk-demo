import { Typography  } from "@material-ui/core"
import React, { useMemo } from "react"
import { useStyles } from "../../css";

type TitleProps = {
    title:string
}

export const Title = (props:TitleProps) =>{
    const classes = useStyles()
    const title = useMemo(()=>{
        return(
            <Typography color="inherit" noWrap className={classes.title}>
                {props.title}
            </Typography>
        )
    },[]) // eslint-disable-line

    return(
        <>
            {title}
        </>
    )

}