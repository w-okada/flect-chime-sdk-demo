// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import routes from '../constants/routes';
import {BASE_URL} from '../Config'

interface MeetingResponse {
  JoinInfo: {
    Attendee: any;
    Meeting: any;
  };
}

export async function createMeeting(meetingName: string, userName: string, region: string, userId:string, idToken: string, accessToken:string, refreshToken:string): 
Promise<{created:boolean, meetingId:string}> {
  const encodedMeetingName = encodeURIComponent(meetingName)
  const encodedUserName      = encodeURIComponent(userName)
  const encodedRegion    = region ? encodeURIComponent(region) : ""

  const url = `${BASE_URL}/meetings`

  console.log("connect:::",url)
  const obj = {meetingName: encodedMeetingName, userName:encodedUserName, region:region, userId:userId, accessToken:accessToken}
  const body = JSON.stringify(obj)
  const response = await fetch(url,
    {
      method: 'POST',
      body:body,
      headers: {
        "Authorization": idToken,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }
  );
  const data = await response.json();
  const {created:created, meetingId:meetingId} = data;
  // console.log(data)
  // console.log(created, meetingId)
  return {created, meetingId};
}

export async function joinMeeting(meetingName: string, userName: string, userId:string, idToken: string, accessToken:string, refreshToken:string):
 Promise<{MeetingName:string, Meeting:any, Attendee:any}> { // 公式でもMeetingとAttendeeはanyで定義されている。 
  const encodedMeetingName = encodeURIComponent(meetingName)
  const encodedUserName      = encodeURIComponent(userName)

  const url = `${BASE_URL}/meetings/${encodedMeetingName}/attendees`

  console.log("connect:::",url)
  const obj = {meetingName: encodedMeetingName, userName:encodedUserName, userId:userId, accessToken:accessToken}
  const body = JSON.stringify(obj)
  const response = await fetch(url,
    {
      method: 'POST',
      body:body,
      headers: {
        "Authorization": idToken,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }
  );
  const data = await response.json();

  if (data === null) {
    throw new Error(`Server error: Join Meeting Failed`);
  }
  return data;
}



export function createGetAttendeeCallback(meetingId: string) {
  return async (chimeAttendeeId: string, externalUserId?: string) => {
    const attendeeUrl = `${BASE_URL}attendee?title=${encodeURIComponent(
      meetingId
    )}&attendee=${encodeURIComponent(chimeAttendeeId)}`;
    const res = await fetch(attendeeUrl, {
      method: 'GET'
    });

    if (!res.ok) {
      throw new Error('Invalid server response');
    }

    const data = await res.json();

    return {
      name: data.AttendeeInfo.Name
    };
  };
}

export async function endMeeting(meetingId: string) {
  const res = await fetch(
    `${BASE_URL}end?title=${encodeURIComponent(meetingId)}`,
    {
      method: 'POST'
    }
  );

  if (!res.ok) {
    throw new Error('Server error ending meeting');
  }
}
