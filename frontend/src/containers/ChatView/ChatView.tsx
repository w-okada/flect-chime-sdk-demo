import { useRosterState, Flex, Roster, RosterHeader, RosterGroup, RosterAttendee, useAttendeeStatus, Label, Input, Textarea, PrimaryButton } from "amazon-chime-sdk-component-library-react";
import { useNavigation } from "../../providers/NavigationProvider";
import React, { useState } from "react";
import styled from "styled-components";
import { useRealitimeSubscribeState, RealtimeData } from "../../providers/RealtimeSubscribeProvider";

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
    console.log(c)
    const senderName = roster[c.senderId] ? roster[c.senderId].name : "unknwon"
    console.log(senderName, roster)

    const uuid = c.uuid
    const text = c.data
    const time = (new Date(c.createdDate)).toLocaleTimeString('ja-JP')

    attendeeItems.push(
      <div key={uuid}>
        <p style={{color:"green"}}>
        {time}  {senderName}
        </p>
        <p style={{paddingLeft:"5px"}}>
          {text}
        </p>
      </div>
    )
  }

  return (

    <Roster className="roster">
      <RosterHeader title="Chat" onClose={closeChatView}>
      </RosterHeader>
      <RosterGroup>{attendeeItems}</RosterGroup>
      <br/>
      <Textarea
        //@ts-ignore
        onChange={e => setChatMessage(e.target.value)}
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
