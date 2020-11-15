// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useContext, ChangeEvent } from 'react';
import {
  Input,
  Flex,
  Heading,
  FormField,
  PrimaryButton,
  Modal,
  ModalBody,
  ModalHeader,
  Label
} from 'amazon-chime-sdk-component-library-react';

import { getErrorContext } from '../../providers/ErrorProvider';
import Card from '../../components/Card';
import Spinner from '../../components/Spinner';
import RegionSelection from './RegionSelection';
import { useAppState } from '../../providers/AppStateProvider';
import { useMeetingFormState } from '../../providers/MeetingFormStateProvider';


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
        <Label onClick={()=>setMode("JOIN_MEETING")} style={{textDecoration:"underline", cursor:"pointer"}}>Go to Join Meeting</Label>
      </div>
    </form>
  )
}

