import { Flex, Roster, RosterHeader,  useContentShareState } from "amazon-chime-sdk-component-library-react";
import { useNavigation } from "../../providers/NavigationProvider";
import React  from "react";
import styled from "styled-components";
import { useRealitimeSubscribeWhiteboardState, DrawingData } from "../../providers/RealtimeSubscribeWhiteboardProvider";
import { useWebSocketWhiteboardState } from "../../providers/WebScoketWhiteboardProvider";

export const Title = styled.h1`
  background-color: ___CSS_0___;
  color: ___CSS_1___;
  padding: 2rem;
  border-radius: 4px;
  overflow-y: auto;
`;

const FileTransferView = () => {
  const { setNaviShowTarget } = useNavigation();
  const { tileId } = useContentShareState();

  return (

    <Roster className="roster">
      <RosterHeader title="FileTransfer" onClose={()=>{setNaviShowTarget("NONE")}}>
      </RosterHeader>
      <div>aAAAAAAAAAAAAAAaaa</div>
    </Roster>
  );
}

export default FileTransferView
