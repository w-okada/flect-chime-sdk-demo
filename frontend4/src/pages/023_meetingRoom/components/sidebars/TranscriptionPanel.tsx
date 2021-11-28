import React, { useMemo, useState } from "react";
import { Button, TextField, Typography } from "@material-ui/core";
import { useAppState } from "../../../../providers/AppStateProvider";
import { useStyles } from "./css";

export const TranscriptionPanel = () => {
    const classes = useStyles();
    const { chimeClient } = useAppState();

    const transcriptionViewArea = useMemo(() => {
        return (
            <div className={classes.transcriptionArea}>
                {chimeClient?.transcriptionClient?.transcriptionScripts.map((d, i) => {
                    return (
                        <div key={`mes${i}`} className={classes.message}>
                            <Typography className={classes.title} color="textSecondary">
                                {chimeClient.getUserNameByAttendeeIdFromList(d.userName)}, {new Date(d.endTime).toLocaleTimeString()}
                            </Typography>
                            <div>{d.script}</div>
                        </div>
                    );
                })}
                {chimeClient?.transcriptionClient?.transcriptionPartialScript ? <div>{chimeClient?.transcriptionClient?.transcriptionPartialScript.script}</div> : <div></div>}
            </div>
        );
    }, [chimeClient?.transcriptionClient?.transcriptionScripts, chimeClient?.transcriptionClient?.transcriptionPartialScript]); // eslint-disable-line

    return (
        <div className={classes.root}>
            <div className={classes.margin}>{transcriptionViewArea}</div>

            <div>
                <Button
                    size="small"
                    className={classes.margin}
                    onClick={() => {
                        chimeClient!.startTranscribe("ja-JP");
                    }}
                >
                    {/* en-US | en-GB | es-US | fr-CA | fr-FR | en-AU | it-IT | de-DE | pt-BR | ja-JP | ko-KR | zh-CN */}
                    start transcribe
                </Button>
                <Button
                    size="small"
                    className={classes.margin}
                    onClick={() => {
                        chimeClient!.stopTranscribe();
                    }}
                >
                    stop transcribe
                </Button>
            </div>
        </div>
    );
};
