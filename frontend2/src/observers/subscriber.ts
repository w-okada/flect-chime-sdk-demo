export const attendeeIdPresenceSubscriber = (attendeeId: string, present: boolean) => {
    console.log(`${attendeeId} present = ${present}`);
    // if (!present) {
    //     app.deleteAttendee(meetingId, attendeeId)
    //     return;
    // }
    // audioVideo.realtimeSubscribeToVolumeIndicator(
    //     attendeeId,
    //     async (
    //         attendeeId: string,
    //         volume: number | null,
    //         muted: boolean | null,
    //         signalStrength: number | null
    //     ) => {
    //         app.changeAttendeeStatus(meetingId, attendeeId, volume, muted, signalStrength)
    //     }
    // );
}

export const activeSpeakerDetectorSubscriber = (attendeeIds: string[]) => {
    console.log(`activeSpeakerDetectorSubscriber ${attendeeIds}`);
}