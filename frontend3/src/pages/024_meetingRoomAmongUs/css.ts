import { createStyles, makeStyles, Theme } from "@material-ui/core";
import { blue, blueGrey, deepOrange, deepPurple, grey } from "@material-ui/core/colors";
const lineSpacerHeihgt = 10

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            background:"black",
            color:'white',
            height:"100%",
            widht:"100%",
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


        formControl: {
            margin: theme.spacing(1),
            width: '100%'
            // minWidth: 120,
        },
        icon: {
            fill: "blue",
        },
        label: {
            color: "blue",
            "&.Mui-focused": {
              color: "blue",
            },
        },
        select: {
            '&:before': {
                borderColor: "blue",
                color:"blue",
            },
            '&:after': {
                borderColor: "blue",
                color:"blue",
            }
        },
        input_amongus: {
            color: 'blue',
        },
        

        //// Color
        activeState_old: {
            color: theme.palette.getContrastText(blueGrey[500]),
            backgroundColor: blueGrey[500],
            margin:3
        },
        activeState_hmm: {
            color: "white",
            backgroundColor: "orange",
            margin:3
        },
        activeState_arena: {
            color: "white",
            backgroundColor: "blue",
            margin:3
        },
        activeState_field: {
            color: "white",
            backgroundColor: "red",
            margin:3
        },
        inactiveState: {
            color: theme.palette.getContrastText(grey[500]),
            backgroundColor: grey[500],
            margin:3
        },
        menuButton: {
            // display: 'inline-block',
            padding:0,
            margin:0,
            border:0,
            minHeight: 0,
            minWidth: 0,
            verticalAlign:"top"
        },
        dividerColor: {
            background: "grey"
        }
    }),
);
