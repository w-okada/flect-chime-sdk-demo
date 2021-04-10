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

    const qrcode = useMemo(()=>{
        return url ? <QRCode value={url} />:<></>
    },[url])

    const handleGenerateOnetimeCode = async () =>{
        const res = await generateOnetimeCode(meetingName!, attendeeId!, idToken!, accessToken!, refreshToken!)
        console.log("generatecode",res)
        setURL(res.uuid)
    }

    return (
            <div className={classes.root}>
                <Typography variant="body1" color="textSecondary">
                    About us
                </Typography>

                <Link onClick={(e: any) => { handleGenerateOnetimeCode() }}>
                            generateCode
                </Link>
                {qrcode}

            </div>
    );
}