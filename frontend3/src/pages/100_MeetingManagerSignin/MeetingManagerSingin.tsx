import { Button, CircularProgress, Container, createStyles, CssBaseline, makeStyles } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useAppState } from "../../providers/AppStateProvider";


const lineSpacerHeihgt = 10
export const useStyles = makeStyles((theme) =>
    createStyles({
        paper: {
            marginTop: theme.spacing(8),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        },        
        button:{
            width:100
        },
        buttonList:{
            display:"flex", 
            flexDirection:"column", 
            alignItems:"center"            
        },
        lineSpacer:{
            height:lineSpacerHeihgt,
        },
    }),
);

type InternalStage = "Signining" | "Joining" | "Entering"

type State = {
    internalStage: InternalStage,
    userName: string | null
}

export const MeetingManagerSignin = () => {
    const classes = useStyles();

    const query = new URLSearchParams(window.location.search);
    const meetingName = query.get('meetingName') || null  // meeting name is already encoded
    const attendeeId = query.get('attendeeId') || null
    const uuid = query.get('uuid') || null

    const { onetimeCodeInfo,  handleSinginWithOnetimeCodeRequest, handleSinginWithOnetimeCode, setStage, setMessage, joinMeeting, enterMeeting,
            audioInputDeviceSetting, videoInputDeviceSetting, audioOutputDeviceSetting, forceLoadCounter, setForceLoadCounter } = useAppState()
    const [ isLoading, setIsLoading] = useState(false)
    // const [ internalStage, setInternalStage] = useState<InternalStage>("Signining")
    // const [ userName, setUserName ] = useState<string>()
    const [state, setState] = useState<State>({internalStage:"Signining", userName:null})

    const onetimeCodeClicked = async (code:string) =>{
        setIsLoading(true)        
        ////// Signin
        const res = await handleSinginWithOnetimeCode(onetimeCodeInfo!.meetingName, onetimeCodeInfo!.attendeeId, onetimeCodeInfo!.uuid, code)
        if(res.result){
            setState({...state, userName: res.userName||null, internalStage:"Joining"})
        }else{
            setMessage("Exception", "Signin error", [`can not sigin. please generate code and retry.`] )
            setIsLoading(false)            
        }
    }    
    

    useEffect(()=>{
        if(state.internalStage === "Signining"){
            handleSinginWithOnetimeCodeRequest(meetingName!, attendeeId!, uuid!)
        }else if(state.internalStage === "Joining" && state.userName){
            console.log("joining...")
            joinMeeting(onetimeCodeInfo!.meetingName!, state.userName).then(()=>{
                setForceLoadCounter(forceLoadCounter+1)
                setState({...state, internalStage:"Entering"})
            }).catch(e=>{
                console.log(e)
                setMessage("Exception", "Enter Room Failed", [`${e.message}`, `(code: ${e.code})`] )     
                setIsLoading(false)
            })
        }else if(state.internalStage === "Entering"){
            console.log("entering...")
            const p1 = audioInputDeviceSetting!.setAudioInput("dummy")
            const p2 = videoInputDeviceSetting!.setVideoInput(null)
            // const audioOutput = (audioOutputList && audioOutputList!.length > 0) ? audioOutputList[0].deviceId:null
            // const p3 = audioOutputDeviceSetting!.setAudioOutput(audioOutput)
            // const audioOutput = (audioOutputList && audioOutputList!.length > 0) ? audioOutputList[0].deviceId:null
            const p3 = audioOutputDeviceSetting!.setAudioOutput(null)
            enterMeeting().then(()=>{
                Promise.all([p1,p2,p3]).then(()=>{
                    setIsLoading(false)
                    setStage("MEETING_MANAGER")
                })
            }).catch(e=>{
                setIsLoading(false)
                console.log(e)
            })
        }
    },[state.internalStage, state.userName]) // eslint-disable-line

    let passwordSelector
    if(isLoading){
        passwordSelector = <CircularProgress />
    }else if(onetimeCodeInfo){
        passwordSelector = onetimeCodeInfo.codes.map(x=>{
            return (
                <div key={x}>
                    <div>
                        <Button color="primary" variant="outlined" className={classes.button} key={x} onClick={()=>{onetimeCodeClicked(x)}}>{x}</Button>
                    </div>                    
                    <div className={classes.lineSpacer} />
                </div>
            )
             
        })
    }else{
        passwordSelector = <div>now loading</div>
    }

    return (
        <Container maxWidth="xs">
            <CssBaseline />
            <div className={classes.paper}>
                <div>
                    Select your code.
                </div>
                <div className={classes.buttonList}>
                    {passwordSelector}
                </div>
                
            </div>
        </Container>
    )
}
