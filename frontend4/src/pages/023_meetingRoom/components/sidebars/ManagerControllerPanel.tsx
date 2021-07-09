import React, { useEffect, useMemo,} from 'react';
import { Button, Tooltip, Typography } from '@material-ui/core';
import { useStyles } from './css';
import { useAppState } from '../../../../providers/AppStateProvider';
import EmojiPeopleIcon from '@material-ui/icons/EmojiPeople';
import ScreenShareIcon from '@material-ui/icons/ScreenShare';
import CameraRollIcon from '@material-ui/icons/CameraRoll';
import SportsEsportsIcon from '@material-ui/icons/SportsEsports';

  
export const ManagerControllerPanel = () => {
    // const classes = useStyles();
    // const {ownerId, isOwner, publicIp,
    //       startHMM, sendTerminate, sendStartRecord, sendStopRecord, sendStartShareTileView, sendStopShareTileView, hMMStatus, stateLastUpdate,
    //       currentGameState
    //     } = useAppState()


    // const ownerStateComp = useMemo(()=>{
    //     return (
    //         isOwner?
    //         <>
    //             <Tooltip title={"Your are owner"}>
    //                 <EmojiPeopleIcon className={classes.activeState}/>
    //             </Tooltip>
    //         </>
    //         :
    //         <>
    //             <Tooltip title={"Your are not owner"}>
    //                 <EmojiPeopleIcon className={classes.inactiveState}/>
    //             </Tooltip>
    //         </>
    //     )
    // },[isOwner])  // eslint-disable-line

    // const managerStateComp = useMemo(()=>{
    //     return (
    //         hMMStatus.active?
    //         <>
    //             <Tooltip title={"hmm active"}>
    //                 <SportsEsportsIcon className={classes.activeState}/>
    //             </Tooltip>
    //         </>
    //         :
    //         <>
    //             <Tooltip title={"hmm not active"}>
    //                 <SportsEsportsIcon className={classes.inactiveState}/>
    //             </Tooltip>
    //         </>
    //     )
    // },[hMMStatus.active])  // eslint-disable-line

    // const recordingStateComp = useMemo(()=>{
    //     return (
    //         hMMStatus.recording?
    //         <>
    //             <Tooltip title={"recording"}>
    //                 <CameraRollIcon className={classes.activeState}/>
    //             </Tooltip>
    //         </>
    //         :
    //         <>
    //             <Tooltip title={"not recording"}>
    //                 <CameraRollIcon className={classes.inactiveState}/>
    //             </Tooltip>
    //         </>
    //     )
    // },[hMMStatus.recording])  // eslint-disable-line

    // const shareTileViewStateComp = useMemo(()=>{
    //     return (
    //         hMMStatus.shareTileView?
    //         <>
    //             <Tooltip title={"share tile view"}>
    //                 <ScreenShareIcon className={classes.activeState}/>
    //             </Tooltip>
    //         </>
    //         :
    //         <>
    //             <Tooltip title={"not share share tile view"}>
    //                 <ScreenShareIcon className={classes.inactiveState}/>
    //             </Tooltip>
    //         </>
    //     )
    // },[hMMStatus.shareTileView])  // eslint-disable-line
    
    // const stateLastUpdateTime = useMemo(()=>{
    //     const datetime = new Date(stateLastUpdate);
    //     // const d = datetime.toLocaleDateString()
    //     const t = datetime.toLocaleTimeString()
    //     // return `${d} ${t}`
    //     return `${t}`
    // },[stateLastUpdate])

    // useEffect(()=>{
    //     console.log(currentGameState)
    //     // console.log("AMONG:", amongUsStates.slice(-1)[0])
    // },[currentGameState])
   

    // return (
    //         <div className={classes.root}>                
    //             <Typography variant="body1" color="textSecondary">
    //                 Manager 
    //             </Typography>
    //             {ownerStateComp}
    //             {managerStateComp}
    //             {recordingStateComp}
    //             {shareTileViewStateComp}

    //             <br/>
    //             lastupdate:{stateLastUpdateTime}
    //             <br/>

    //             <br/>

    //             <Button size="small" className={classes.margin} onClick={()=>{startHMM()}} >
    //                 run manager
    //             </Button>
    //             <Button size="small" className={classes.margin} onClick={()=>{ sendTerminate() }}>
    //                 stop manager
    //             </Button>

    //             <Button size="small" className={classes.margin} onClick={()=>{sendStartRecord()}}>
    //                 start recording
    //             </Button>
    //             <Button size="small" className={classes.margin} onClick={()=>{sendStopRecord()}}>
    //                 stop recording
    //             </Button>

    //             <Button size="small" className={classes.margin} onClick={()=>{sendStartShareTileView()}}>
    //                 start share tileview
    //             </Button>
    //             <Button size="small" className={classes.margin} onClick={()=>{sendStopShareTileView()}}>
    //                 stop share tileview
    //             </Button>
    //             <div>
    //                 <br/>
    //                 Owner:{ownerId}
    //                 <br />
    //                 {publicIp? `publicIp ${publicIp}`:""}
    //             </div>


    //         </div>

    // );


    return(<></>)
}

 