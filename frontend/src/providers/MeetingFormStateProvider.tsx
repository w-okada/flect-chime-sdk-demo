import React, { useContext, ReactNode, useState } from "react"
import { getErrorContext } from "./ErrorProvider";
import { createGetAttendeeCallback, createMeeting, joinMeeting } from "../utils/api";
import { useMeetingManager } from "amazon-chime-sdk-component-library-react";
import { useAppState } from "./AppStateProvider";
import { useHistory } from "react-router-dom";
import routes from "../constants/routes";



type Props = {
    children: ReactNode;
  };
  
export type MODE = "CREATE_MEETING" | "JOIN_MEETING" | "CREATED_MEETING"
interface MeetingFormStateInterface{
    mode:MODE
    meetingName:string
    userName:string
    region:string

    isLoading: boolean,
    APIErrorCode: string,
    APIErrorName: string,
    APIErrorMessage: string,

    setMode:(mode:MODE)=>void,
    setMeetingName:(name:string)=>void,
    setUserName:(name:string)=>void,
    setRegion:(region:string)=>void,
    setIsLoading: (isLoading: boolean) => void,
    setError: (errorCode: string, errorName: string, errorMessage: string) => void,


    handleCreateMeeting: (e: React.FormEvent<Element>) => Promise<void>
    handleJoinMeeting: (e: React.FormEvent<Element>) => Promise<void>

}

const MeetingFormStateContext = React.createContext<MeetingFormStateInterface | null>(null)

export const useMeetingFormState = (): MeetingFormStateInterface => {
    const state = useContext(MeetingFormStateContext)
    if (!state) {
      throw new Error("Error using sign in context!")
    }
    return state
}
  
export const MeetingFormStateProvider = ({ children }: Props) => {
    const [mode, setMode] = useState("CREATE_MEETING" as MODE)
    const {meetingName:a} = useAppState()
    const [meetingName, setMeetingName] = useState(a)

    const [userName, setUserName] = useState("")
    const [region, setRegion] = useState("")

    const { updateErrorMessage } = useContext(getErrorContext());
    const [isLoading, setIsLoading] = useState(false)
    const [APIErrorCode, setErrorCode] = useState("")
    const [APIErrorName, setErrorName] = useState("")
    const [APIErrorMessage, setErrorMessage] = useState("")

    const { userId, idToken, accessToken, refreshToken, setAppMeetingInfo} = useAppState()

    const meetingManager = useMeetingManager();
    const history = useHistory()
    
    const setError = (errorCode: string, errorName: string, errorMessage: string) => {
        setErrorCode(errorCode)
        setErrorName(errorName)
        setErrorMessage(errorMessage)
    }
        
    const handleCreateMeeting = async (e: React.FormEvent<Element>) =>{
        e.preventDefault();
        setIsLoading(true);
        const validMeetingName = meetingName.trim().toLocaleLowerCase();
        const attendeeName = userName.trim();
        // if (!validMeetingName || !attendeeName) {
        //     if (!attendeeName) {setNameErr(true)}
        //     if (!validMeetingName) {setMeetingErr(true)}
        //     return;
        // }

        setIsLoading(true);
        // meetingManager.getAttendee = createGetAttendeeCallback(validMeetingName);

        try {
            const { created } = await createMeeting(validMeetingName, attendeeName, region, userId, idToken, accessToken, refreshToken );
            if(created){
                setMode("CREATED_MEETING")
            }else{
                updateErrorMessage("Already Exists");
            }
        } catch (error) {
            updateErrorMessage(error.message);
        } finally{
            setIsLoading(false);
        }
    }
    
    const handleJoinMeeting = async (e: React.FormEvent<Element>) => {
        e.preventDefault();
        setIsLoading(true);
        const validMeetingName = meetingName.trim().toLocaleLowerCase();
        const attendeeName = userName.trim();

//     if (!meetingName || !attendeeName) {
//       if (!attendeeName) {setNameErr(true);}
//       if (!meetingName) {setMeetingErr(true);}
//       return;
//     }

        setIsLoading(true);
        meetingManager.getAttendee = createGetAttendeeCallback(validMeetingName, idToken, accessToken);

        try {
            const joinInfo = await joinMeeting(validMeetingName, attendeeName, userId, idToken, accessToken, refreshToken);
            console.log("JoinInfo:", joinInfo )

            const meetingInfo = joinInfo.Meeting
            const attendeeInfo = joinInfo.Attendee


            await meetingManager.join({
                meetingInfo: meetingInfo,
                attendeeInfo: attendeeInfo
            });


            setIsLoading(false);
            setAppMeetingInfo(meetingInfo.MeetingId, meetingName, attendeeInfo.AttendeeId, attendeeName, region, attendeeInfo.JoinToken);
            history.push(routes.DEVICE);
        } catch (error) {
            setIsLoading(false);
            updateErrorMessage(error.message);
        } finally{
        }
    }
    
    const providerValue = {
        mode,
        meetingName,
        userName,
        region,

        isLoading,
        APIErrorCode,
        APIErrorName,
        APIErrorMessage,

        setMode,
        setMeetingName,
        setUserName,
        setRegion,
        setIsLoading,
        setError,

        handleCreateMeeting,
        handleJoinMeeting,
    }
    

    return (
        <MeetingFormStateContext.Provider value={providerValue}>
          {children}
        </MeetingFormStateContext.Provider>
    )

}










