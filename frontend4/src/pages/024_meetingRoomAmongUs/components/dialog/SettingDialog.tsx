import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, InputLabel, MenuItem, Select, Switch, Typography } from "@material-ui/core"
import React, { useState } from "react"
import { useAppState } from "../../../../providers/AppStateProvider"
import { useStyles } from "../../css"
import { ViewMode } from "../../MeetingRoomAmongUs"

type SettingDialogProps={
    open:boolean,
    onClose:()=>void

    viewMode:ViewMode
    setViewMode:(mode:ViewMode) => void
    debugEnable:boolean
    setDebugEnable:(mode:boolean) => void
    screenSize:number[]
    setScreenSize:(size:number[])=>void
}

const ScreenSize:{[key:string]:number[]} = {
    "640x480":[640,480],
    "320x240":[320,240],
    "160x120":[160,120],
    "64x48":[64,48]
}

export const SettingDialog = (props:SettingDialogProps) =>{
    const classes = useStyles()
    const {chimeClient, audioInputList, audioOutputList,} = useAppState()

    const [guiCounter, setGuiCounter] = useState(0)

    const onInputAudioChange = async (e: any) => {
        //// for input movie experiment [start]
        const videoElem = document.getElementById("for-input-movie")! as HTMLVideoElement
        videoElem.pause()
        videoElem.srcObject=null
        videoElem.src=""
        //// for input movie experiment [end]

        if (e.target.value === "None") {
            await chimeClient!.audioInputDeviceSetting!.setAudioInput(null)
            setGuiCounter(guiCounter+1)
        } else {
            await chimeClient!.audioInputDeviceSetting!.setAudioInput(e.target.value)
            setGuiCounter(guiCounter+1)
        }
    }
    const onSuppressionChange = async (e:any) =>{
        if (e.target.value === "None") {
            await chimeClient!.audioInputDeviceSetting!.setAudioSuppressionEnable(false)
            setGuiCounter(guiCounter+1)
        } else {
            await chimeClient!.audioInputDeviceSetting!.setAudioSuppressionEnable(true)
            await chimeClient!.audioInputDeviceSetting!.setVoiceFocusSpec({variant:e.target.value})
            setGuiCounter(guiCounter+1)
        }
    }

    const onOutputAudioChange = async (e: any) => {
        if (e.target.value === "None") {
            await chimeClient!.audioOutputDeviceSetting!.setAudioOutput(null)
            setGuiCounter(guiCounter+1)
        } else {
            await chimeClient!.audioOutputDeviceSetting!.setAudioOutput(e.target.value)
            setGuiCounter(guiCounter+1)
        }
    }    

    const onViewModeChanged = async (e:any) =>{
        props.setViewMode(e.target.value)
    }
    const onDebugEnableChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        props.setDebugEnable(event.target.checked )
    };
    const onScreenSizeChanged = (e:any) => {
        const size = ScreenSize[e.target.value as string]
        props.setScreenSize(size)
    }


    return(
        <div>
            <Dialog disableBackdropClick disableEscapeKeyDown scroll="paper" open={props.open} onClose={props.onClose} >
                <DialogTitle>
                    <Typography gutterBottom>
                        Settings
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="h5" gutterBottom>
                        Devices and Effects
                    </Typography>
                    {/* <form className={classes.form} noValidate> */}
                    <form  noValidate>
                        <FormControl className={classes.formControl} >
                            <InputLabel>Microhpone</InputLabel>
                            <Select onChange={onInputAudioChange} value={chimeClient!.audioInputDeviceSetting!.audioInput} >
                                <MenuItem disabled value="Video">
                                    <em>Microphone</em>
                                </MenuItem>
                                {audioInputList?.map(dev => {
                                    return <MenuItem value={dev.deviceId} key={dev.deviceId}>{dev.label}</MenuItem>
                                })}
                            </Select>
                        </FormControl>

                        <FormControl className={classes.formControl} >
                            <InputLabel>Noise Suppression</InputLabel>
                            <Select onChange={onSuppressionChange} value={chimeClient!.audioInputDeviceSetting!.audioSuppressionEnable ? chimeClient!.audioInputDeviceSetting!.voiceFocusSpec?.variant: "None" } >
                                <MenuItem disabled value="Video">
                                    <em>Microphone</em>
                                </MenuItem>
                                {["None", "auto", "c100", "c50", "c20", "c10"].map(val => {
                                    return <MenuItem value={val} key={val}>{val}</MenuItem>
                                })}
                            </Select>
                        </FormControl>


                        <FormControl className={classes.formControl} >
                            <InputLabel>Speaker</InputLabel>
                            <Select onChange={onOutputAudioChange} value={chimeClient!.audioOutputDeviceSetting!.audioOutput} >
                                <MenuItem disabled value="Video">
                                    <em>Speaker</em>
                                </MenuItem>
                                {audioOutputList?.map(dev => {
                                    return <MenuItem value={dev.deviceId} key={dev.deviceId} >{dev.label}</MenuItem>
                                })}
                            </Select>
                        </FormControl>


                        <Divider />
                        <Typography variant="h5" gutterBottom>
                            Experimental
                        </Typography>
                        {/* <FormControl className={classes.formControl} >
                            <InputLabel>View Mode</InputLabel>
                            <Select onChange={onViewModeChanged} value={props.viewMode} >
                                {["MultiTileView", "SeparateView"].map(val => {
                                    return <MenuItem value={val} key={val}>{val}</MenuItem>
                                })}
                            </Select>
                        </FormControl> */}

                        <FormControl className={classes.formControl} >
                            <InputLabel>debug</InputLabel>
                            <Switch
                                checked={props.debugEnable}
                                onChange={onDebugEnableChanged}
                                inputProps={{ 'aria-label': 'secondary checkbox' }}
                            />
                        </FormControl>


                        <FormControl className={classes.formControl} >
                            <InputLabel>canvas size</InputLabel>
                            <Select onChange={onScreenSizeChanged} value={`${props.screenSize[0]}x${props.screenSize[1]}`} >
                                {Object.keys(ScreenSize).map(val => {
                                    return <MenuItem value={val} key={val}>{val}</MenuItem>
                                })}
                            </Select>
                        </FormControl>
                    </form>

                </DialogContent>
                <DialogActions>
                    <Button onClick={props.onClose} color="primary">
                        Ok
                    </Button>
                </DialogActions>
            </Dialog> 
            <video id="for-input-movie"  loop hidden />
        </div>


    )
}
