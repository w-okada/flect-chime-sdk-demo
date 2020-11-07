// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useContext, ChangeEvent } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Input,
  Flex,
  Heading,
  FormField,
  PrimaryButton,
  useMeetingManager,
  Modal,
  ModalBody,
  ModalHeader,
  Meeting,
  Label
} from 'amazon-chime-sdk-component-library-react';

import { getErrorContext } from '../../providers/ErrorProvider';
import routes from '../../constants/routes';
import Card from '../../components/Card';
import Spinner from '../../components/Spinner';
import DevicePermissionPrompt from '../DevicePermissionPrompt';
import RegionSelection from './RegionSelection';
import { createMeeting, createGetAttendeeCallback, joinMeeting } from '../../utils/api';
import { useAppState } from '../../providers/AppStateProvider';

import { useMeetingFormState } from '../../providers/MeetingFormStateProvider';
import { useSignInState } from '../../providers/SignInStateProvider';


const MeetingNameField:React.FC = () =>{
  const { meetingName, setMeetingName } = useMeetingFormState()
  return (
    <FormField
      field={Input}
      label="Meeting room name"
      value={meetingName}
      fieldProps={{
        name: 'meetingName',
        placeholder: 'Enter Meeting room'
      }}
      onChange={(e: ChangeEvent<HTMLInputElement>)=>setMeetingName(e.target.value)}
    />)
}

const UserNameField:React.FC = () =>{
  const { userName, setUserName } = useMeetingFormState()
  return (
    <FormField
      field={Input}
      label="User name"
      value={userName}
      fieldProps={{
        name: 'userName',
        placeholder: 'Enter user name'
      }}
      onChange={(e: ChangeEvent<HTMLInputElement>)=>setUserName(e.target.value)}
    />)
}


const ErrorModal:React.FC = () =>{
  const { errorMessage, updateErrorMessage } = useContext(getErrorContext());

  return(
    <>
      {errorMessage && (
        <Modal size="md" onClose={ ()=>updateErrorMessage('')}>
          <ModalHeader title={`Error...`} />
          <ModalBody>
            <Card
              title="Error"
              description={errorMessage}
            />
          </ModalBody>
        </Modal>
      )}
    </>
  )
}


const SubmitButton:React.FC<{isLoading:boolean, onClick:(e:React.MouseEvent<HTMLButtonElement, MouseEvent>)=>{}}> = ({isLoading, onClick}) => {
  return(
    <Flex
      container
      layout="fill-space-centered"
      style={{ marginTop: '2.5rem' }}
    >
      {isLoading ? (
        <Spinner />
      ) : (
        <PrimaryButton label="Continue" onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>)=>{ onClick(e)} } />
      )}
    </Flex>    
  )
}


export const CreateMeetingForm: React.FC = () => {
  const { isLoading, handleCreateMeeting, region, setRegion} = useMeetingFormState()
  return(
    // <></>
    <form>
      <Heading tag="h1" level={4} css="margin-bottom: 1rem">
        Create Meeting
      </Heading>
      <MeetingNameField />
      <RegionSelection setRegion={setRegion} region={region} />
      <SubmitButton isLoading={isLoading} onClick={handleCreateMeeting}/>
      <ErrorModal />
    </form>
  )
}

export const JoinMeetingForm: React.FC = () => {
  const { isLoading, handleJoinMeeting} = useMeetingFormState()
  return(
    <form>
      <Heading tag="h1" level={4} css="margin-bottom: 1rem">
        Join Meeting
      </Heading>
      <MeetingNameField />
      <UserNameField />
      <SubmitButton isLoading={isLoading} onClick={handleJoinMeeting}/>
      <ErrorModal />
    </form>
  )
}

export const CreatedMeetingForm: React.FC = () => {
  const { meetingName, setMode } = useMeetingFormState()
  const { userId } = useAppState()
  return(
    <form>
      <Heading tag="h1" level={4} css="margin-bottom: 1rem">
        Meeting is created.
      </Heading>
      <div>
        MeetingName: {meetingName} <br/>
        Owner: {userId}<br/><br/>
        <Label onClick={()=>setMode("JOIN_MEETING")}><a href="#" style={{color: '#989da5'}}>Go to Join Meeting</a> </Label>
      </div>
    </form>
  )
}


// const MeetingForm: React.FC<{mode : MODE, setSelectorMode?:(mode:MODE)=>void}> = ({mode, setSelectorMode}) => {
//   const meetingManager = useMeetingManager();
//   const {
//     setAppMeetingInfo,
//     region: appRegion,
//     userId: userId,
//     idToken: idToken,
//     accessToken: accessToken,
//     refreshToken: refreshToken,
//     meetingId: appMeetingId,
//     meetingName: appMeetingName
//   } = useAppState();

//   const [meetingId, setMeetingId] = useState(appMeetingId);
//   const [meetingName, setMeetingName] = useState(appMeetingName);
//   const [meetingErr, setMeetingErr] = useState(false);
//   const [name, setName] = useState('');
//   const [nameErr, setNameErr] = useState(false);
//   const [region, setRegion] = useState(appRegion);
//   const [isLoading, setIsLoading] = useState(false);
//   const { errorMessage, updateErrorMessage } = useContext(getErrorContext());
//   const history = useHistory();

//   if(!userId || !idToken){
//     history.push(routes.SIGNIN)
//     return <div />
//   }

//   // When push join meeting button, triggered this.
//   const handleJoinMeeting = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const meetingName = meetingId.trim().toLocaleLowerCase();
//     const attendeeName = name.trim();

//     if (!meetingName || !attendeeName) {
//       if (!attendeeName) {setNameErr(true);}
//       if (!meetingName) {setMeetingErr(true);}
//       return;
//     }

//     setIsLoading(true);
//     meetingManager.getAttendee = createGetAttendeeCallback(meetingName);

//     try {
//       const { JoinInfo } = await joinMeeting(meetingName, attendeeName, region, userId, idToken, accessToken, refreshToken);

//       await meetingManager.join({
//         meetingInfo: JoinInfo.Meeting,
//         attendeeInfo: JoinInfo.Attendee
//       });

//       setAppMeetingInfo(meetingId, meetingName, attendeeName, region);
//       history.push(routes.DEVICE);
//     } catch (error) {
//       updateErrorMessage(error.message);
//     }
//   };


//   const handleCreateMeeting = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const validMeetingName = meetingName.trim().toLocaleLowerCase();
//     const attendeeName = name.trim();

//     if (!validMeetingName || !attendeeName) {
//       if (!attendeeName) {setNameErr(true)}
//       if (!validMeetingName) {setMeetingErr(true)}
//       return;
//     }

//     setIsLoading(true);
//     meetingManager.getAttendee = createGetAttendeeCallback(validMeetingName);

//     try {
//       const { created:created, meetingId:meetingId } = await createMeeting(meetingName, validMeetingName, region, userId, idToken, accessToken, refreshToken );
//       setIsLoading(false);
//       setSelectorMode!("CREATED_MEETING")
//     } catch (error) {
//       updateErrorMessage(error.message);
//     }
//   };

//   const closeError = (): void => {
//     updateErrorMessage('');
//     setIsLoading(false);
//   };

//   const headers = {
//     "CREATE_MEETING":"Create Meeting",
//     "JOIN_MEETING":"Join a meeting",
//     "CREATED_MEETING":"Meeting is created.Join it."
//   }
//   const header = headers[mode]

//   const buttons = {
//     "CREATE_MEETING": <PrimaryButton label="Create a meeting" onClick={handleCreateMeeting} />,
//     "JOIN_MEETING":<PrimaryButton label="Join a meeting" onClick={handleJoinMeeting} />,
//     "CREATED_MEETING":<PrimaryButton label="Join a meeting" onClick={handleJoinMeeting} />
//   }
//   const button = buttons[mode]
    
//   return (
//     <form>
//       <Heading tag="h1" level={4} css="margin-bottom: 1rem">
//         { header }
//       </Heading>
//       <FormField
//         field={Input}
//         label="Meeting Name"
//         value={meetingName}
//         infoText="Anyone with access to the meeting name can join"
//         fieldProps={{
//           name: 'meetingName',
//           placeholder: 'Enter Meeting Name'
//         }}
//         errorText="Please enter a valid meeting Name"
//         error={meetingErr}
//         onChange={(e: ChangeEvent<HTMLInputElement>): void => {
//           setMeetingName(e.target.value);
//           if (meetingErr) {
//             setMeetingErr(false);
//           }
//         }}
//       />
//       <FormField
//         field={Input}
//         label="Name"
//         value={name}
//         fieldProps={{
//           name: 'name',
//           placeholder: 'Enter Your Name'
//         }}
//         errorText="Please enter a valid name"
//         error={nameErr}
//         onChange={(e: ChangeEvent<HTMLInputElement>): void => {
//           setName(e.target.value);
//           if (nameErr) {
//             setNameErr(false);
//           }
//         }}
//       />
//       <RegionSelection setRegion={setRegion} region={region} />
//       <Flex
//         container
//         layout="fill-space-centered"
//         style={{ marginTop: '2.5rem' }}
//       >
//         {isLoading ? (
//           <Spinner />
//         ) : (
//           // <PrimaryButton label="Join a meeting" onClick={handleJoinMeeting} />
//           button
//         )}
//       </Flex>


//       {errorMessage && (
//         <Modal size="md" onClose={closeError}>
//           <ModalHeader title={`Meeting ID: ${meetingId}`} />
//           <ModalBody>
//             <Card
//               title="Unable to join meeting"
//               description="There was an issue finding that meeting. The meeting may have already ended, or your authorization may have expired."
//               smallText={errorMessage}
//             />
//           </ModalBody>
//         </Modal>
//       )}
//       <DevicePermissionPrompt />
//     </form>
//   );

// };

// export default MeetingForm;
