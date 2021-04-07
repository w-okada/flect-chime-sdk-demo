import { IconButton, Tooltip  } from "@material-ui/core"
import {ScreenShare, StopScreenShare} from '@material-ui/icons'
import React, { useMemo } from "react"
import clsx from 'clsx';
import { useStyles } from "../../css";

type FeatureType = "ShareScreen"

type FeatureEnablerProps = {
    type: FeatureType
    enable:boolean
    setEnable:(val:boolean)=>void
}

export const FeatureEnabler = (props:FeatureEnablerProps) =>{
    const classes = useStyles()
    const icon = useMemo(()=>{
        const index = props.enable? 0 : 1
        switch(props.type){
            case "ShareScreen":
                return [<StopScreenShare />, <ScreenShare />][index]
        }
    },[props.enable, props.type])
    const tooltip = useMemo(()=>{
        const index = props.enable? 0 : 1
        switch(props.type){
            case "ShareScreen":
                return ["Stop Screen Share", "Start Screen Share"][index]
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