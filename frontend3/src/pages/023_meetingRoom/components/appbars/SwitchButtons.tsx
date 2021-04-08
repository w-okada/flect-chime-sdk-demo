import { IconButton, makeStyles, Tooltip  } from "@material-ui/core"
import { Stop, ViewCompact, ViewComfy} from '@material-ui/icons'
import React, { useMemo } from "react"
// import { useStyles } from "../../css";
import { FiberManualRecord } from '@material-ui/icons'

const toolbarHeight = 20

export const useStyles = makeStyles((theme) => ({
    menuButton: {
        width: toolbarHeight, height: toolbarHeight,
    },

    menuButtonActive: {
        width: toolbarHeight, height: toolbarHeight,
        color: "#ee7777"
    },
}));



type SwitchButtonsType = "ScreenView"
export type ScreenType = "FullView" | "FeatureView" | "GridView" | "RecorderView"
type SwitchButtonsProps = {
    type: SwitchButtonsType
    selected: ScreenType | "" // "" is placeholder
    onClick:(val:ScreenType | "")=>void
}

export const SwitchButtons = (props: SwitchButtonsProps) =>{
    const classes = useStyles()

    const switchLabelArray:ScreenType[] = useMemo(()=>{
        switch(props.type){
            case "ScreenView":
                return ["FullView", "FeatureView", "GridView", "RecorderView"]
        }
    },[props.type, props.selected]) // eslint-disable-line

    const selectedIndex = useMemo(()=>{
        return switchLabelArray.findIndex(x => {return x===props.selected})
    },[props.type, props.selected]) // eslint-disable-line
    
    const icons = useMemo(()=>{
        switch(props.type){
            case "ScreenView":
                return [<Stop/>, <ViewCompact/>, <ViewComfy/>, <FiberManualRecord />]
        }
    },[props.type, props.selected]) // eslint-disable-line
    
    const tooltips = useMemo(()=>{
        switch(props.type){
            case "ScreenView":
                return ["Full Screen", "Feature View", "Grid View", "Recorder View"]
        }
    },[props.type, props.selected]) // eslint-disable-line


    const enabler = useMemo(()=>{
        return icons.map((val,index) =>{
            return (
                <Tooltip key={`tooltip_${index}`} title={tooltips[index]}>
                    <IconButton color="inherit" className={index === selectedIndex ? classes.menuButtonActive : classes.menuButton} onClick={(e)=>{props.onClick(switchLabelArray[index])}}>
                    {/* <IconButton color="inherit" style={{color: "#ee7777"}} onClick={(e)=>{props.onClick(switchLabelArray[index])}}> */}
                        {icons[index]}
                    </IconButton>
                </Tooltip>
            )
        })
    },[props.type, props.selected]) // eslint-disable-line

    return(
        <>
            {enabler}
        </>
    )

}