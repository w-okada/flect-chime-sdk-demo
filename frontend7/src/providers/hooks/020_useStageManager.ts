import { useMemo, useState } from "react";

export const SignInType = {
    normal: "normal",
    slack: "slack",
} as const;
type SignInType = typeof SignInType[keyof typeof SignInType]

type UseStageManagerProps = {
    signInType?: SignInType
};

export const STAGE = {
    SIGNIN: "SIGNIN",
    ENTRANCE: "ENTRANCE",
    // ENTRANCE_AS_GUEST: "ENTRANCE_AS_GUEST",
    // CREATE_MEETING_ROOM: "CREATE_MEETING_ROOM",
    // WAITING_ROOM: "WAITING_ROOM",
    // MEETING_ROOM: "MEETING_ROOM",
    SLACK_SIGNUP: "SLACK_SIGNUP",
    // SLACK_SIGNUP2: "SLACK_SIGNUP2",
} as const;
export type STAGE = typeof STAGE[keyof typeof STAGE];

export type StageManagerState = {
    signInType?: SignInType
    signInComplete: boolean
    stage: STAGE
}
export type StageManagerStateAndMethods = StageManagerState & {
    setStage: (val: STAGE) => void,
    setSignInComplete: (val: boolean) => void
}


export const useStageManager = (props: UseStageManagerProps): StageManagerStateAndMethods => {
    const initialState: StageManagerState = useMemo(() => {
        let stage: STAGE
        if (props.signInType && props.signInType === SignInType.slack) {
            stage = STAGE.SLACK_SIGNUP
        } else {
            stage = STAGE.SIGNIN
        }
        return {
            SignInType: props.signInType,
            signInComplete: false,
            stage
        }
    }, [props.signInType])

    const [state, setState] = useState<StageManagerState>(initialState);

    const setStage = (stage: STAGE) => {
        setState({
            ...state,
            stage
        })
    }

    const setSignInComplete = (val: boolean) => {
        setState({ ...state, signInComplete: val })
    }

    return {
        ...state,
        setStage,
        setSignInComplete
    };
};
