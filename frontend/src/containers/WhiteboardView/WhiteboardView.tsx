import { Flex, Roster, RosterHeader,  useContentShareState, Button, Cog, Modal, ModalHeader, ModalBody, ModalButtonGroup, ModalButton } from "amazon-chime-sdk-component-library-react";
import { useNavigation } from "../../providers/NavigationProvider";
import React, { useEffect, useState }  from "react";
import styled from "styled-components";
//import { useRealitimeSubscribeWhiteboardState } from "../../providers/RealtimeSubscribeWhiteboardProvider";
import { DrawingData } from "../../providers/RealtimeSubscribeWhiteboardProvider";
import { useWebSocketWhiteboardState } from "../../providers/WebScoketWhiteboardProvider";

import * as  QRCode  from 'qrcode'
import { useAppState } from "../../providers/AppStateProvider";
import { WebSocketEndpoint } from "../../BackendConfig";
import { SECOND_WIHTEBOARD_BASE_URL } from "../../constants";

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


const QRCodeToShare = () => {
  const {meetingId, localUserId, joinToken } = useAppState()

  const messagingURLWithQuery = `${WebSocketEndpoint}/Prod?joinToken=${joinToken}&meetingId=${meetingId}&attendeeId=${localUserId}_whiteboard`
  // const whiteBoardURL = `${window.location.origin.toString()}/whiteboard?wss=${encodeURIComponent(messagingURLWithQuery)}`
  const whiteBoardURL = `${SECOND_WIHTEBOARD_BASE_URL}?wss=${encodeURIComponent(messagingURLWithQuery)}`
    
  let canvasRef = React.createRef<HTMLCanvasElement>()

  useEffect(()=>{
    if(canvasRef.current){
      QRCode.toCanvas(canvasRef.current, whiteBoardURL)
    }else{
      console.log("canvas is null")
    }
  })

  return (
    <div>
      <canvas ref={canvasRef} />
      <div>
        {whiteBoardURL}
      </div>
      {/* <div>
        {window.location.origin.toString()}
        <br />
        {messagingURLWithQuery}
        <br />
      </div> */}
    </div>
  )
}

const ColorPallet = () => {
  // const { setDrawingMode, setDrawingStroke, drawingStroke, drawingMode, sendDrawingData } = useRealitimeSubscribeWhiteboardState()
  const {setDrawingMode, setDrawingStroke, drawingStroke, drawingMode, sendDrawingData} = useWebSocketWhiteboardState()
 
  let canvasRef = React.createRef<HTMLCanvasElement>()

  return (
    <div>
      <div>
        {colors.map((color) => (
          <span key={color} style={{ background: color, paddingLeft: "6px", paddingRight: "6px" }} onClick={() => {
            setDrawingStroke(color)
            setDrawingMode("DRAW")
          }}>
            {color === drawingStroke && drawingMode === "DRAW" ? "o" : "-"}
          </span>
        ))}
      </div>
      <br />
      <div>
        <span style={{ background: "white", paddingLeft: "3px" }} onClick={() => {
          setDrawingMode("ERASE")
        }}>
          Erase {drawingMode === "ERASE" ? "o" : "-"}
        </span>
      </div>
      <br />
      <div>
        <span style={{ background: "white", paddingLeft: "3px" }} onClick={() => {
          const drawingData: DrawingData = {
            drawingCmd: "CLEAR",
            startXR: 0,
            startYR: 0,
            endXR: 0,
            endYR: 0,
            stroke: "black",
            lineWidth: 2
          }
          sendDrawingData(drawingData)
        }}>
          Clear
        </span>
      </div>
      <br />
    </div>
  )
}

const QRCodeButton = () =>{
  const toggleModal = (): void => setShowModal(!showModal);
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
    {/* <canvas ref={canvasRef}/> */}
    <Button icon={<Cog />} onClick={toggleModal} label="QRCode" />
    {showModal && (
      <Modal size="md" onClose={toggleModal} rootId="modal-root">
        <ModalHeader title="Scan by your ipad" />
        <ModalBody>
          <QRCodeToShare />
        </ModalBody>
        <ModalButtonGroup
          primaryButtons={[
            <ModalButton variant="secondary" label="Close" closesModal />
          ]}
        />
      </Modal>
    )}
  </div>
  
  )

}

const WhiteboardView = () => {
  const { setNaviShowTarget } = useNavigation();
  const { tileId } = useContentShareState();
  const { mode } = useAppState()
  const { sendDrawingData } = useWebSocketWhiteboardState()

  const notification = (
    <Flex layout="fill-space-centered">
      <Title>Drawing is enable during sharing contents</Title>
    </Flex>
  )

  return (
    <Roster className="roster">
      <RosterHeader title="Whiteboard" onClose={()=>{setNaviShowTarget("NONE")}}>
      </RosterHeader>
      {tileId || mode === "Whiteboard" ? <></> : <>{notification}</>}
      <ColorPallet />
      {tileId ? <QRCodeButton />:<></> }

      <span style={{ background: "white", paddingLeft: "3px" }} onClick={() => {
          const drawingData: DrawingData = {
            drawingCmd: "SYNC_SCREEN",
            startXR: 0,
            startYR: 0,
            endXR: 0,
            endYR: 0,
            stroke: "black",
            lineWidth: 2
          }
          sendDrawingData(drawingData)
        }}>
        Sync Screen
      </span>

    </Roster>
  );
}

export default WhiteboardView
