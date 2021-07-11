import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
    root: {
        background: 'white',
    },
    title:{
        color: 'black'
    },
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.primary.main,
    },
    form: {
        width: '100%',
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    margin: {
        margin: theme.spacing(1),
    },
    input: {
        color: 'black',
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    cameraPreview: {
        width: '50%'
    },
    icon: {
        fill: "blue",
    },
    label: {
        color: "blue",
        "&.Mui-focused": {
          color: "blue",
        },
    }

}));


export const useAmongUsStyles = makeStyles((theme) => ({
    root: {
        background: 'black'
    },
    title:{
        color: 'red'
    },
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.primary.main,
    },
    form: {
        width: '100%',
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    margin: {
        margin: theme.spacing(1),
    },
    input: {
        color: 'blue',
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    cameraPreview: {
        width: '50%'
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
    icon: {
        fill: "blue",
    },
    label: {
        color: "blue",
        "&.Mui-focused": {
          color: "blue",
        },
    },
}));