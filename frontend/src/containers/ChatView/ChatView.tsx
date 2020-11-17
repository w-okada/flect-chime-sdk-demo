import { useRosterState, Flex, Roster, RosterHeader, RosterGroup, RosterAttendee, useAttendeeStatus, Label } from "amazon-chime-sdk-component-library-react";
import { useNavigation } from "../../providers/NavigationProvider";
import React from "react";
import styled from "styled-components";

export const Title = styled.h1`
  background-color: ___CSS_0___;
  color: ___CSS_1___;
  padding: 2rem;
  border-radius: 4px;
  overflow-y: auto;
`;

export interface ChatProps {
  attendeeId: string;
  text:string
}

export const ChatLine: React.FC<ChatProps> = ({ attendeeId, text }) => {
  const { muted, videoEnabled, sharingContent } = useAttendeeStatus(attendeeId);
  const { roster } = useRosterState();
  const attendeeName = roster[attendeeId]?.name || '';

  return (
    <Label>Hello world</Label>
  );
};


const ChatView = () => {
    const { roster } = useRosterState();
    const { closeChatView } = useNavigation();

    let attendees = Object.values(roster);
    console.log("chat view")
    const attendeeItems = []
    for(let i=0; i< 30; i++){
      attendeeItems.push(
        <Flex layout="fill-space-centered">
          <Title>I'm acentered</Title>
        </Flex>

      )
    }
  
    return (

      <Roster className="roster">
         <RosterHeader title="Chat" onClose={closeChatView}>
         </RosterHeader>
        <RosterGroup>{attendeeItems}</RosterGroup>
      </Roster>
    );
}


export default ChatView
