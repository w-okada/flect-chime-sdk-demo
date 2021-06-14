import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Typography } from "@material-ui/core"
import React, { useState } from "react"
import { useAppState } from "../../../../providers/AppStateProvider"
import { useStyles } from "../../css"

type SettingDialogProps={
    open:boolean,
    onClose:()=>void
}

export const SettingDialog = (props:SettingDialogProps) =>{
    const classes = useStyles()
    const {audioInputDeviceSetting, audioOutputDeviceSetting, audioInputList, audioOutputList,
            } = useAppState()

    const [guiCounter, setGuiCounter] = useState(0)

    const onInputAudioChange = async (e: any) => {
        //// for input movie experiment [start]
        const videoElem = document.getElementById("for-input-movie")! as HTMLVideoElement
        videoElem.pause()
        videoElem.srcObject=null
        videoElem.src=""
        //// for input movie experiment [end]

        if (e.target.value === "None") {
            await audioInputDeviceSetting!.setAudioInput(null)
            setGuiCounter(guiCounter+1)
        } else {
            await audioInputDeviceSetting!.setAudioInput(e.target.value)
            setGuiCounter(guiCounter+1)
        }
    }
    const onSuppressionChange = async (e:any) =>{
        if (e.target.value === "None") {
            await audioInputDeviceSetting!.setAudioSuppressionEnable(false)
            setGuiCounter(guiCounter+1)
        } else {
            await audioInputDeviceSetting!.setAudioSuppressionEnable(true)
            await audioInputDeviceSetting!.setVoiceFocusSpec({variant:e.target.value})
            setGuiCounter(guiCounter+1)
        }
    }

    const onOutputAudioChange = async (e: any) => {
        if (e.target.value === "None") {
            await audioOutputDeviceSetting!.setAudioOutput(null)
            setGuiCounter(guiCounter+1)
        } else {
            await audioOutputDeviceSetting!.setAudioOutput(e.target.value)
            setGuiCounter(guiCounter+1)
        }
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
                            <Select onChange={onInputAudioChange} value={audioInputDeviceSetting!.audioInput} >
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
                            <Select onChange={onSuppressionChange} value={audioInputDeviceSetting!.audioSuppressionEnable ? audioInputDeviceSetting!.voiceFocusSpec?.variant: "None" } >
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
                            <Select onChange={onOutputAudioChange} value={audioOutputDeviceSetting!.audioOutput} >
                                <MenuItem disabled value="Video">
                                    <em>Speaker</em>
                                </MenuItem>
                                {audioOutputList?.map(dev => {
                                    return <MenuItem value={dev.deviceId} key={dev.deviceId} >{dev.label}</MenuItem>
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
