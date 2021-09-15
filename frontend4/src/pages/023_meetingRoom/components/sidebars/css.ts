import { createStyles, makeStyles, Theme } from "@material-ui/core";
import { deepOrange, grey } from "@material-ui/core/colors";
const lineSpacerHeihgt = 10

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            // height: '100%', 
            height: 400, 
            width: "100%", 
            wordWrap: "break-word", 
            whiteSpace: "normal"            
        },
        container: {
            maxHeight: `calc(100% - 10px)`,
        },        
        title: {
            fontSize: 14,
        },
        button:{
            margin: theme.spacing(1)
        },
        activatedButton: {
            margin: theme.spacing(1),
            color: "#ee7777"
        },
        lineSpacer:{
            height:lineSpacerHeihgt,
        },
        margin: {
            margin: theme.spacing(1),
        },
        //// Member
        table: {
            //   minWidth: 750,
            width: 20
        },
        visuallyHidden: {
            border: 0,
            clip: 'rect(0 0 0 0)',
            height: 1,
            margin: -1,
            overflow: 'hidden',
            padding: 0,
            position: 'absolute',
            top: 20,
            width: 1,
        },
        // paper: {
        //     width: '100%',
        //     marginBottom: theme.spacing(2),
        // },


        //// for chat
        messageArea:{
            height: 280, 
            width: "100%", 
            overflow: 'auto'
        },
        message:{
            width: "100%", 
            textAlign: 'left', 
            wordWrap: "break-word", 
            whiteSpace: "normal"
        },
        sendButton:{
            textAlign: 'right',
        },
        //// for transcription
        transcriptionArea:{
            height: 280, 
            width: "100%", 
            overflow: 'auto'
        },
        //// for whiteboard

        paper: {
            width: '100%',
            marginBottom: theme.spacing(2),
            maxHeight: `calc(100% - 10px)`,
            orverflow: 'scroll',

        },
        selectedColor:{
            border: "1px solid",
            borderRadius: "4px",
        },
        color:{
        },


        //// for BGM
        seList:{
            height: '70%', 
            width: "100%", 
            wordWrap: "break-word", 
            whiteSpace: "normal",  
            overflow: "auto"             
        },
        control:{
            height: '30%', 
            width: "100%", 
            wordWrap: "break-word", 
            whiteSpace: "normal",  
            overflow: "auto"             
        },
        volumeControl:{
            display:"flex"
        },

        //// Color
        activeState: {
            color: theme.palette.getContrastText(deepOrange[500]),
            backgroundColor: deepOrange[500],
            margin:3
          },
        inactiveState: {
            color: theme.palette.getContrastText(grey[500]),
            backgroundColor: grey[500],
            margin:3
        },

    }),
);
