import { IconButton, Tooltip  } from "@material-ui/core"
import {Settings, ExitToApp} from '@material-ui/icons'
import React, { useMemo } from "react"
import clsx from 'clsx';
import { useStyles } from "../../css";

type DialogType = "Setting" | "LeaveMeeting"

type DialogOpenerProps = {
    type: DialogType
    onClick:()=>void
}

export const DialogOpener = (props:DialogOpenerProps) =>{
    const classes = useStyles()

    const icon = useMemo(()=>{
        switch(props.type){
            case "Setting":
                return <Settings />
            case "LeaveMeeting":
                return <ExitToApp />

        }
    },[props.type])
    const tooltip = useMemo(()=>{
        switch(props.type){
            case "Setting":
                return "Setting"
            case "LeaveMeeting":
                return "Leave Meeting"
        }
    },[props.type])
    const enabler = useMemo(()=>{
        return(
            <Tooltip title={tooltip}>
                <IconButton color="inherit" className={clsx(classes.menuButton)} onClick={props.onClick}>
                    {icon}
                </IconButton>
            </Tooltip>
        )
    },[props.type]) // eslint-disable-line

    return(
        <>
            {enabler}
        </>
    )

}