import { useMemo, useState } from "react";
import { WebSocketEndpoint } from "../../BackendConfig";
import { WebSocketWhiteboardClient, DrawingData } from "@dannadori/flect-amazon-chime-lib2";
export type UseWhiteboardClientProps = {
    joinToken: string;
    meetingId: string;
    attendeeId: string;
};

export type WhiteboardClientState = {
    whiteboardClient: WebSocketWhiteboardClient | null;
    drawingData: DrawingData[];
};
export const useWhiteboardClient = (props: UseWhiteboardClientProps) => {
    const [_lastUpdateTime, setLastUpdateTime] = useState(0);

    const whiteboardClient = useMemo(() => {
        if (!props.joinToken || !props.meetingId || !props.attendeeId) {
            return null;
        }
        console.log("[AppStateProvider] create whiteboard client!");
        const messagingURLWithQuery = `${WebSocketEndpoint}/Prod?joinToken=${props.joinToken}&meetingId=${props.meetingId}&attendeeId=${props.attendeeId}`;
        const c = new WebSocketWhiteboardClient(props.attendeeId!, messagingURLWithQuery);
        c.addWhiteboardDataUpdateListener((data: DrawingData[]) => {
            setLastUpdateTime(new Date().getTime());
        });
        return c;
    }, [props.joinToken, props.meetingId, props.attendeeId]);

    const returnValue: WhiteboardClientState = {
        whiteboardClient,
        drawingData: whiteboardClient?.drawingData || [],
    };

    return returnValue;
};
