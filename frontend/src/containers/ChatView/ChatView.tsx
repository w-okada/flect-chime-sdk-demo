import { useRosterState, Flex, Roster, RosterHeader, RosterGroup, RosterAttendee, useAttendeeStatus, Label, Input, Textarea, PrimaryButton } from "amazon-chime-sdk-component-library-react";
import { useNavigation } from "../../providers/NavigationProvider";
import React, { useState } from "react";
import styled from "styled-components";
import { useRealitimeSubscribeState } from "../../providers/RealtimeSubscribeProvider";

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

export const ChatLine: React.FC<ChatProps> = ({ attendeeId, text }) => {
  const { muted, videoEnabled, sharingContent } = useAttendeeStatus(attendeeId);
  const { roster } = useRosterState();
  const attendeeName = roster[attendeeId]?.name || '';

  return (
    <Label id="" >Hello world</Label>
  );
};


const ChatView = () => {
  const { roster } = useRosterState();
  const { closeChatView } = useNavigation();
  const { chatData, sendChatData } = useRealitimeSubscribeState()
  const [ chatMessage, setChatMessage] = useState('');
  
  let attendees = Object.values(roster);
  console.log("chat view")
  const attendeeItems = []
  for (let c of chatData) {
    attendeeItems.push(
    <Label key={""+c.timestampMs}>{c.text()}</Label>
    )
  }

  return (

    <Roster className="roster">
      <RosterHeader title="Chat" onClose={closeChatView}>
      </RosterHeader>
      <RosterGroup>{attendeeItems}</RosterGroup>
      <Textarea
        // showClear={true}
        //@ts-ignore
        onChange={e => setChatMessage(e.target.value)}
        // sizing={"md"}
        value={chatMessage}
        placeholder="input your message"
        type="text"
        label="my test label"
        style={{resize:"vertical",}}
      />
      <PrimaryButton 
        label="send" 
        onClick={e=>{
          setChatMessage("")
          sendChatData(chatMessage)
        }}
      />
    </Roster>
  );
}

export default ChatView
