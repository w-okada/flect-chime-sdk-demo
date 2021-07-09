import { IconButton, Tooltip  } from "@material-ui/core"
import {Mic, MicOff, Videocam, VideocamOff, VolumeUp, VolumeOff} from '@material-ui/icons'
import React, { useMemo } from "react"
import clsx from 'clsx';
import { useStyles } from "../../css";

type DeviceType = "Mic" | "Camera" | "Speaker"

type DeviceEnablerProps = {
    type: DeviceType
    enable:boolean
    setEnable:(val:boolean)=>void
}

export const DeviceEnabler = (props:DeviceEnablerProps) =>{
    const classes = useStyles()
    const icon = useMemo(()=>{
        const index = props.enable? 0 : 1
        switch(props.type){
            case "Mic":
                return [<Mic />, <MicOff />][index]
            case "Camera":
                return [<Videocam/>, <VideocamOff/>][index]
            case "Speaker":
                return [<VolumeUp/>, <VolumeOff/>][index]
        }
    },[props.enable, props.type])
    const tooltip = useMemo(()=>{
        const index = props.enable? 0 : 1
        switch(props.type){
            case "Mic":
                return ["Mic Off", "Mic On"][index]
            case "Camera":
                return ["Camera Off", "Camera On"][index]
            case "Speaker":
                return ["Speaker Off", "Speaker On"][index]
        }
    },[props.enable, props.type])
    const enabler = useMemo(()=>{
        return(
            <Tooltip title={tooltip}>
                <IconButton color="inherit" className={clsx(classes.menuButton)} onClick={()=>{props.setEnable(!props.enable)}}>
                    {icon}
                </IconButton>
            </Tooltip>
            )
    },[props.enable, props.type]) // eslint-disable-line

    return(
        <>
            {enabler}
        </>
    )

}