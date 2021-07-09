import { Button, Tooltip  } from "@material-ui/core"
import {ChevronLeft, ChevronRight} from '@material-ui/icons'
import React, { useMemo } from "react"
import clsx from 'clsx';
import { useStyles } from "../../css";

type DrawerOpenerProps = {
    open:boolean
    setOpen:(val:boolean)=>void
}

export const DrawerOpener = (props:DrawerOpenerProps) =>{
    const classes = useStyles()
    const opener = useMemo(()=>{
        return(
            props.open?
            <Tooltip title="Drawer Close">
                <Button color="inherit" className={clsx(classes.menuButton)} startIcon={<ChevronLeft />} id="close-drawer"  onClick={()=>{props.setOpen(false)}}>
                    menu
                </Button>
            </Tooltip>
            :
            <Tooltip title="Drawer Open">
                <Button color="inherit" className={clsx(classes.menuButton)} endIcon={<ChevronRight /> } id="open-drawer" onClick={()=>{props.setOpen(true)}}>
                    menu
                </Button>
            </Tooltip>
        )
    },[props.open]) // eslint-disable-line

    return(
        <>
            {opener}
        </>
    )

}