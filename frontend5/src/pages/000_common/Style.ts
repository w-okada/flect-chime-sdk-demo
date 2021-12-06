import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
    root: {
        background: "white",
    },
    paper: {
        marginTop: theme.spacing(8),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.primary.main,
    },
    title: {
        color: "black",
        fontSize: 24,
    },
    form: {
        width: "100%",
        marginTop: theme.spacing(1),
    },
    loginField: {
        display: "flex",
        flexDirection: "column",
        marginLeft: 50,
        marginRight: 50,
    },
    roomConfig: {
        display: "flex",
        flexDirection: "row",
        marginTop: 20,
        alignItems: "center",
    },
    deviceConfig: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    deviceCheckBox: {
        display: "flex",
        alignItems: "center",
        // flexDirection: "row",
        // marginLeft: 20,
    },

    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    margin: {
        margin: theme.spacing(1),
    },

    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    cameraPreview: {
        width: "50%",
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
    input: {
        fontSize: "100pt",
    },
}));
