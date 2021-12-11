import { Button, CircularProgress, FormControl, InputLabel, MenuItem, Select } from "@material-ui/core";
import { MeetingRoom } from "@material-ui/icons";
import React, { useState } from "react";
import { AVAILABLE_AWS_REGIONS, DEFAULT_REGION } from "../../constants";
import { useAppState } from "../../providers/AppStateProvider";
import { STAGE } from "../../providers/hooks/useStageManager";
import { CustomTextField } from "../000_common/CustomTextField";
import { Questionnaire } from "../000_common/Questionnaire";
import { useStyles } from "../000_common/Style";

export const CreateMeetingRoom = () => {
    const { chimeClientState, setMessage, setStage } = useAppState();
    const [meetingName, setMeetingName] = useState(chimeClientState.meetingName || "");
    const [region, setRegion] = useState(DEFAULT_REGION);
    const [isLoading, setIsLoading] = useState(false);

    const classes = useStyles();

    const onCreateMeetingClicked = async () => {
        setIsLoading(true);
        try {
            await chimeClientState.createMeeting(meetingName, region);
            setMessage("Info", "Room created", [`room created, please join.`]);
            setIsLoading(false);
            setStage(STAGE.ENTRANCE);
        } catch (e: any) {
            console.log(e);
            setMessage("Exception", "Creating meeting room failed", [`room(${e.meetingName}) exist?: ${!e.created}`]);
            setIsLoading(false);
        }
    };

    const forms = (
        <>
            <div className={classes.loginField}>
                <CustomTextField onChange={(e) => setMeetingName(e.target.value)} label="meeting name" secret={false} height={20} fontsize={16} defaultValue={meetingName} autofocus />
                <FormControl className={classes.formControl}>
                    <InputLabel>Region</InputLabel>
                    <Select value={region} onChange={(e: any) => setRegion(e.target.value)}>
                        <MenuItem disabled value="Video">
                            <em>Region</em>
                        </MenuItem>
                        {Object.keys(AVAILABLE_AWS_REGIONS).map((key) => {
                            return (
                                <MenuItem value={key} key={key}>
                                    {AVAILABLE_AWS_REGIONS[key]}
                                </MenuItem>
                            );
                        })}
                    </Select>
                </FormControl>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginRight: 0 }}>
                {isLoading ? (
                    <CircularProgress />
                ) : (
                    <Button variant="contained" color="primary" className={classes.submit} onClick={onCreateMeetingClicked} id="submit">
                        Create Meeting
                    </Button>
                )}
            </div>
        </>
    );

    const links = [
        {
            title: "Join Meeting",
            onClick: () => {
                setStage(STAGE.ENTRANCE);
            },
        },
        {
            title: "Sign out",
            onClick: () => {
                setStage(STAGE.SIGNIN);
            },
        },
    ];

    return (
        <>
            <Questionnaire avatorIcon={<MeetingRoom />} title="Create Meeting" forms={forms} links={links} />
        </>
    );
};
