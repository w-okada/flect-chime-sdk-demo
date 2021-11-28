import { Tooltip } from "@material-ui/core";
import React, { useMemo } from "react";
import { useAppState } from "../../../providers/AppStateProvider";

type VideoState = "ENABLED" | "PAUSED" | "NOT_SHARE";

export const AudienceList = () => {
    const { chimeClient } = useAppState();

    const targetIds = Object.values(chimeClient!.videoTileStates).reduce<string>((ids, cur) => {
        return `${ids}_${cur.boundAttendeeId}`;
    }, "");
    const targetNames = Object.values(chimeClient!.attendees).reduce<string>((names, cur) => {
        return `${names}_${cur.name}`;
    }, "");

    const sortedAudiences = Object.values(chimeClient!.attendees).sort((a, b) => {
        if (a.name === b.name) {
            return 0;
        }
        return a.name > b.name ? 1 : -1;
    });

    const targetVideoStates: VideoState[] = Object.values(sortedAudiences).map((x) => {
        if (!chimeClient!.videoTileStates[x.attendeeId]) {
            return "NOT_SHARE";
        }
        if (x.isVideoPaused) {
            return "PAUSED";
        } else {
            return "ENABLED";
        }
    });
    const targetVideoStatesString = targetVideoStates.reduce<string>((states, cur) => {
        return `${states}_${cur}`;
    }, "");

    // const audienceList = useMemo(()=>{
    //     const l = Object.values(attendees).map((x)=>{
    //         return(
    //             <>
    //                 <Tooltip title={`${x.attendeeId}`}>
    //                     <div>
    //                         {x.name}
    //                     </div>
    //                 </Tooltip>
    //             </>
    //         )
    //     })

    //     return(
    //         <div style={{display:"flex", flexDirection:"column"}}>
    //             {l}
    //         </div>
    //     )
    // },[attendees])

    const audienceList = useMemo(() => {
        const l = sortedAudiences.map((x, index) => {
            if (x.attendeeId.indexOf("#content") > 0) {
                return <></>;
            }
            // let videoStateComp
            // switch(targetVideoStates[index]){
            //     case "ENABLED":
            //         videoStateComp = (
            //             <Tooltip title={`click to pause`}>
            //                 <IconButton style={{width: "20px", height:"20px", color:"white"  }} onClick={ ()=>{chimeClient!.setPauseVideo(x.attendeeId, true)} } >
            //                     <VideocamIcon></VideocamIcon>
            //                 </IconButton>
            //             </Tooltip>
            //         )
            //         break
            //     case "PAUSED":
            //         videoStateComp = (
            //             <Tooltip title={`click to play`}>
            //                 <IconButton style={{width: "20px", height:"20px", color:"white" }} onClick={ ()=>{chimeClient!.setPauseVideo(x.attendeeId, false)} } >
            //                     <VideocamOffIcon  ></VideocamOffIcon>
            //                 </IconButton>
            //             </Tooltip>
            //         )
            //         break
            //     case "NOT_SHARE":
            //         videoStateComp = <></>
            //         break
            // }

            return (
                <div style={{ display: "flex", flexDirection: "row" }} key={x.attendeeId}>
                    <Tooltip title={`${x.attendeeId}`}>
                        <div>{x.name}</div>
                    </Tooltip>
                    {/* <div>
                            {videoStateComp}
                        </div> */}
                </div>
            );
        });

        return <div style={{ display: "flex", flexDirection: "column" }}>{l}</div>;
    }, [targetIds, targetNames, targetVideoStatesString]); // eslint-disable-line

    return (
        <>
            <div style={{ color: "burlywood" }}>Spacemen</div>
            <div style={{ marginLeft: "15pt" }}>{audienceList}</div>
        </>
    );
};
