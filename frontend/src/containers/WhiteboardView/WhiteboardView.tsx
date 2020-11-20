import { useRosterState, Flex, Roster, RosterHeader, RosterGroup, RosterAttendee, useAttendeeStatus, Label, Input, Textarea, PrimaryButton, useContentShareState, Severity } from "amazon-chime-sdk-component-library-react";
import { useNavigation } from "../../providers/NavigationProvider";
import React, { useState } from "react";
import styled from "styled-components";
import { useRealitimeSubscribeState, RealtimeData, DrawingData } from "../../providers/RealtimeSubscribeProvider";

export const Title = styled.h1`
  background-color: ___CSS_0___;
  color: ___CSS_1___;
  padding: 2rem;
  border-radius: 4px;
  overflow-y: auto;
`;

export interface ChatProps {
  attendeeId: string;
  text: string
}


const colors = [
  'red',
  'orange',
  'yellow',
  'olive',
  'green',
  'teal',
  'blue',
  'violet',
  'purple',
  'pink',
  'brown',
  'grey',
  'black',
]

const ColorPallet = () =>{
  const { setDrawingMode, setDrawingStroke, drawingStroke, drawingMode, sendWhiteBoardData} = useRealitimeSubscribeState()
  return(
    <div>
      <div>
    {colors.map((color) => (
      <span style={{background:color, paddingLeft:"6px",paddingRight:"6px"}} onClick={()=>{
        setDrawingStroke(color)
        setDrawingMode("DRAW")
      }}>
        {color === drawingStroke &&  drawingMode === "DRAW" ?"o" : "-"}
      </span>
    ))}
      </div>
      <br />
      <div>
        <span style={{background:"white",paddingLeft:"3px"}} onClick={()=>{
            setDrawingMode("ERASE")
          }}>
            Erase {drawingMode === "ERASE" ? "o" : "-"}
        </span>
      </div>
      <br />
      <div>
        <span style={{background:"white",paddingLeft:"3px"}} onClick={()=>{
                                  const drawingData:DrawingData = {
                                    drawingCmd: "CLEAR",
                                    startXR: 0,
                                    startYR: 0,
                                    endXR: 0,
                                    endYR: 0,
                                    stroke: "black",
                                    lineWidth: 2
                                }
                                sendWhiteBoardData(drawingData)
          }}>
            Clear
        </span>
      </div>
  </div>
  )
}

const WhiteboardView = () => {
  const { roster } = useRosterState();
  const { closeWhiteboardView } = useNavigation();
  const { chatData, sendChatData } = useRealitimeSubscribeState()
  const [ chatMessage, setChatMessage] = useState('');
  const { tileId } = useContentShareState();
  let attendees = Object.values(roster);

  const notification = (
    <Flex layout="fill-space-centered">
      <Title>Drawing is enable during sharing contents</Title>
    </Flex>
  )

  return (

    <Roster className="roster">
      <RosterHeader title="Whiteboard" onClose={closeWhiteboardView}>
      </RosterHeader>
      {tileId ?<></>:<>{notification }</>}
      <ColorPallet />
    </Roster>
  );
}

export default WhiteboardView
