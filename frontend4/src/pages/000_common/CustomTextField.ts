import { TextField, withStyles } from "@material-ui/core";

export const CustomTextField = withStyles({
    root: {
        "& input:valid + fieldset": {
            borderColor: "blue",
            borderWidth: 1,
        },
        "& input:invalid + fieldset": {
            borderColor: "blue",
            borderWidth: 1,
        },
        "& input:valid:focus + fieldset": {
            borderColor: "blue",
            borderLeftWidth: 6,
            // padding: '4px !important',
        },
        "& input:valid:hover + fieldset": {
            borderColor: "blue",
            borderLeftWidth: 6,
            // padding: '4px !important',
        },
        "& input:invalid:hover + fieldset": {
            borderColor: "blue",
            borderLeftWidth: 6,
            color: "blue",
            // padding: '4px !important',
        },
        "& label.Mui-focused": {
            color: "blue",
        },
        "& label.MuiInputLabel-root": {
            color: "blue",
        },
    },
})(TextField);
