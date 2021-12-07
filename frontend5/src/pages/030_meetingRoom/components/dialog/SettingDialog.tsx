import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, InputLabel, MenuItem, Select, Typography } from "@material-ui/core";
import React, { useEffect, useState, useMemo } from "react";
import { useAppState } from "../../../../providers/AppStateProvider";
import { useStyles } from "../../css";
import { DefaultDeviceController } from "amazon-chime-sdk-js";
import { CustomSelect } from "../../../000_common/CustomSelect";
import { VirtualBackgroundSegmentationType, NoiseSuppressionType } from "@dannadori/flect-amazon-chime-lib2";
import { TranscribeLangs } from "../../../../providers/hooks/useChimeClient";

export const SettingDialog = () => {
    // const classes = useStyles();
    const { chimeClientState, deviceState, frontendState } = useAppState();
    const audioInputDeviceId = typeof chimeClientState.audioInputDevice === "string" ? chimeClientState.audioInputDevice : "None";
    const noiseSuppressionType = chimeClientState.noiseSuppressionType;
    const videoInputDeviceId = typeof chimeClientState.videoInputDevice === "string" ? chimeClientState.videoInputDevice : "None";
    const segmentationType = chimeClientState.virtualBackgroundSegmentationType;
    const audioOutputDeviceId = chimeClientState.audioOutputDevice;

    const cameras = deviceState.mediaDeviceList.videoinput.map((x) => {
        return { label: x.label, value: x.deviceId };
    });

    const virtualBackgrounds = [
        { label: "None", value: "None" },
        { label: "BodyPix", value: "BodyPix" },
        { label: "GoogleMeet", value: "GoogleMeet" },
        { label: "GoogleMeetTFLite", value: "GoogleMeetTFLite" },
    ];
    const microphones = deviceState.mediaDeviceList.audioinput.map((x) => {
        return { label: x.label, value: x.deviceId };
    });
    const noiseSuppressions: { label: string; value: NoiseSuppressionType }[] = [
        { label: "None", value: "None" },
        { label: "auto", value: "auto" },
        { label: "c100", value: "c100" },
        { label: "c50", value: "c50" },
        { label: "c20", value: "c20" },
        { label: "c10", value: "c10" },
    ];

    const transcribeLangs = useMemo(() => {
        const langs = [];
        for (const lang of Object.values(TranscribeLangs)) {
            langs.push({
                label: lang,
                value: lang,
            });
        }
        return langs;
    }, []);

    const speakers = deviceState.mediaDeviceList.audiooutput.map((x) => {
        return { label: x.label, value: x.deviceId };
    });

    const setVideoInputDevice = async (value: string) => {
        //// for input movie experiment [start]
        const videoElem = document.getElementById("for-input-movie")! as HTMLVideoElement;
        videoElem.pause();
        videoElem.srcObject = null;
        videoElem.src = "";
        //// for input movie experiment [end]
        if (value === "None") {
            await chimeClientState.setVideoInput(null);
            chimeClientState.stopLocalVideoTile();
            // } else if (e.target.value === "File") {
            // fileInputRef.current!.click()
        } else {
            await chimeClientState.setVideoInput(value);
            chimeClientState.startLocalVideoTile();
        }
    };

    const setVirtualBackgroundSegmentationType = async (value: string) => {
        if (value === "None") {
            // await chimeClientState.setVirtualBackgroundEnable(false); // bug?
            await chimeClientState.setVirtualBackgroundSegmentationType("None");
        } else {
            // await chimeClientState.setVirtualBackgroundEnable(true); // bug?
            await chimeClientState.setVirtualBackgroundSegmentationType(value as VirtualBackgroundSegmentationType);
        }
    };

    const setBackgroundImage = async () => {
        const input = document.createElement("input");
        input.type = "file";
        input.onchange = (e: any) => {
            const path = URL.createObjectURL(e.target.files[0]);
            const fileType = e.target.files[0].type;
            console.log(path, fileType);

            if (fileType.startsWith("image")) {
                chimeClientState.setBackgroundImagePath(path);
            } else {
                console.log("not supported filetype", fileType);
            }
        };
        input.click();
    };

    const setAudioInputDevice = async (value: string) => {
        //// for input movie experiment [start]
        const videoElem = document.getElementById("for-input-movie")! as HTMLVideoElement;
        videoElem.pause();
        videoElem.srcObject = null;
        videoElem.src = "";
        //// for input movie experiment [end]

        if (value === "None") {
            await chimeClientState.setAudioInput(null);
        } else {
            await chimeClientState.setAudioInput(value);
        }
    };

    const setNoiseSuppressionType = async (value: NoiseSuppressionType) => {
        if (value === "None") {
            await chimeClientState.setNoiseSuppressionEnable(false);
            await chimeClientState.setNoiseSuppressionType("None");
        } else {
            await chimeClientState.setNoiseSuppressionEnable(true);
            await chimeClientState.setNoiseSuppressionType(value);
        }
    };

    const setAudioOutputDevice = async (value: string) => {
        if (value === "None") {
            await chimeClientState.setAudioOutput(null);
        } else {
            await chimeClientState.setAudioOutput(value);
        }
    };

    const setInputMovieFile = (noise: boolean) => {
        const input = document.createElement("input");
        input.type = "file";
        input.onchange = (e: any) => {
            const path = URL.createObjectURL(e.target.files[0]);
            const fileType = e.target.files[0].type;
            console.log(path, fileType);
            if (fileType.startsWith("video")) {
                const videoElem = document.getElementById("for-input-movie")! as HTMLVideoElement;
                videoElem.pause();
                videoElem.srcObject = null;

                videoElem.onloadeddata = async (e) => {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    const mediaStream = videoElem.captureStream() as MediaStream;

                    /////// Generate AudioInput Source
                    let stream: MediaStream | null = new MediaStream();
                    if (mediaStream.getAudioTracks().length > 0) {
                        mediaStream.getAudioTracks().forEach((t) => {
                            console.log("AUDIO TRACK", t);
                            stream!.addTrack(t);
                        });
                        console.log("AUDIO ", stream);
                        // audioInputDeviceSetting!.setAudioInput(mediaStream)
                    } else {
                        stream = null;
                        console.log("NO AUDIO TRACK");
                        // audioInputDeviceSetting!.setAudioInput(null)
                    }

                    const audioContext = DefaultDeviceController.getAudioContext();
                    const outputNode = audioContext.createMediaStreamDestination();
                    if (stream) {
                        const sourceNode = audioContext.createMediaStreamSource(stream);
                        sourceNode.connect(outputNode);
                    }

                    if (noise) {
                        const outputNodeForMix = audioContext.createMediaStreamDestination();
                        const gainNode = audioContext.createGain();
                        gainNode.gain.value = 0.1;
                        gainNode.connect(outputNodeForMix);
                        const oscillatorNode = audioContext.createOscillator();
                        oscillatorNode.frequency.value = 440;
                        oscillatorNode.connect(gainNode);
                        oscillatorNode.start();
                        chimeClientState.setBackgroundMusic(outputNodeForMix.stream);
                    }
                    chimeClientState.setAudioInput(outputNode.stream);

                    /////// Generate VideoInput Source
                    if (mediaStream.getVideoTracks().length > 0) {
                        const stream = new MediaStream();
                        mediaStream.getVideoTracks().forEach((t) => {
                            stream.addTrack(t);
                        });
                        await chimeClientState.setVideoInput(mediaStream);
                        chimeClientState.startLocalVideoTile();
                        await chimeClientState.setVirtualBackgroundSegmentationType("None");
                    } else {
                        await chimeClientState.setVideoInput(null);
                        chimeClientState.stopLocalVideoTile();
                    }
                };
                videoElem.src = path;
                videoElem.currentTime = 0;
                videoElem.autoplay = true;
                videoElem.play();
            } else {
                console.log("not supported filetype", fileType);
            }
        };
        input.click();
    };

    return (
        <>
            <Dialog
                disableBackdropClick
                disableEscapeKeyDown
                scroll="paper"
                open={frontendState.settingDialogOpen}
                onClose={() => {
                    frontendState.setSettingDialogOpen(false);
                }}
            >
                <DialogTitle>
                    <Typography gutterBottom>Settings</Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="h5" gutterBottom>
                        Devices and Effects
                    </Typography>
                    <div style={{ margin: 10 }}>
                        <CustomSelect onChange={setVideoInputDevice} label="camera" height={16} fontsize={12} labelFontsize={16} items={cameras} defaultValue={videoInputDeviceId} />
                    </div>
                    <div style={{ margin: 10 }}>
                        <CustomSelect onChange={setVirtualBackgroundSegmentationType} label="virtual background" height={16} fontsize={12} labelFontsize={16} items={virtualBackgrounds} defaultValue={segmentationType} />
                    </div>
                    <div>
                        <Button variant="outlined" color="primary" onClick={setBackgroundImage} size="small">
                            <Typography variant="caption">background image</Typography>
                        </Button>
                    </div>
                    <div style={{ margin: 10 }}>
                        <CustomSelect onChange={setAudioInputDevice} label="Microhpone" height={16} fontsize={12} labelFontsize={16} items={microphones} defaultValue={audioInputDeviceId} />
                    </div>
                    <div style={{ margin: 10 }}>
                        <CustomSelect onChange={setAudioOutputDevice} label="Speaker" height={16} fontsize={12} labelFontsize={16} items={speakers} defaultValue={audioOutputDeviceId} />
                    </div>

                    <div style={{ margin: 10 }}>
                        <CustomSelect onChange={setNoiseSuppressionType} label="noise suppression" height={16} fontsize={12} labelFontsize={16} items={noiseSuppressions} defaultValue={noiseSuppressionType} />
                    </div>

                    <div style={{ margin: 10 }}>
                        <CustomSelect onChange={chimeClientState.setTranscribeLang} label="transcribe lang" height={16} fontsize={12} labelFontsize={16} items={transcribeLangs} defaultValue={chimeClientState.transcribeLang} />
                    </div>

                    <form noValidate>
                        <Divider />
                        <Typography variant="h5">Experimentals</Typography>
                        <div style={{ display: "flex" }}>
                            <div style={{ width: "50%" }}>
                                <Typography variant="body1">Movie Input</Typography>
                            </div>
                            <div style={{ width: "50%" }}>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => {
                                        setInputMovieFile(false);
                                    }}
                                >
                                    choose movie file
                                </Button>
                            </div>
                        </div>
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={(e) => {
                            frontendState.setSettingDialogOpen(false);
                        }}
                        color="primary"
                    >
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
            <video id="for-input-movie" loop hidden />
        </>
    );
};
