import React, { useMemo, useState } from 'react';
import { Link, Typography } from '@material-ui/core';
import { useStyles } from './css';
import { useAppState } from '../../../../providers/AppStateProvider';
import { generateOnetimeCode } from '../../../../api/api';
var QRCode = require('qrcode.react');

export const OnetimeCodePanel = () => {
    const classes = useStyles();
    const { meetingName, attendeeId, idToken, accessToken, refreshToken} = useAppState()
    const [url, setURL] = useState<string>()
    const [onetimeCode, setOnetimeCode] = useState<string>()

    const qrcode = useMemo(()=>{
        return url ? <QRCode value={url} />:<></>
    },[url])

    const handleGenerateOnetimeCode = async () =>{
        const res = await generateOnetimeCode(meetingName!, attendeeId!, idToken!, accessToken!, refreshToken!)
        const url = `${window.location.href}?mode=MEETING_MANAGER_SIGNIN&uuid=${res.uuid}&meetingName=${meetingName}&attendeeId=${attendeeId}`
        console.log("generatecode",res, url)

        setURL(url)
        setOnetimeCode(res.code)
    }

    return (
            <div className={classes.root}>
                <Typography variant="body1" color="textSecondary">
                    One Time Code
                </Typography>

                <Link onClick={(e: any) => { handleGenerateOnetimeCode() }}>
                    generateCode
                </Link>

                <Typography variant="body1" color="textSecondary">
                    <a href={url}  target="_blank" rel="noopener noreferrer">{url}</a>
                </Typography>

                {qrcode}

                <div>
                    {onetimeCode}
                </div>

            </div>
    );
}

 