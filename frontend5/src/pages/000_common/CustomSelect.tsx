import React, { useState } from "react";
import { FormControl, InputLabel, makeStyles, MenuItem, Select, TextField, Theme } from "@material-ui/core";
import { blueGrey } from "@material-ui/core/colors";

interface UseCustomSelectStylesProps {
    height: number;
    fontsize: number;
    labelFontsize: number;
}
const useCustomSelectStyles = makeStyles<Theme, UseCustomSelectStylesProps>(() => ({
    input: {
        color: "black",
        height: ({ height }) => height,
        fontSize: ({ fontsize }) => fontsize,
        border: "none",
        borderBottom: "inset 1px " + blueGrey[500],
        "&:hover,&:active": {
            // color: "red",
            borderBottom: "inset 1px " + blueGrey[500],
        },
    },
    inputLabel: {
        color: blueGrey[400],
        height: ({ height }) => height,
        fontSize: ({ labelFontsize }) => labelFontsize,
        "&:hover,&:active": {
            color: blueGrey[400],
            height: ({ height }) => height,
            fontSize: ({ labelFontsize }) => labelFontsize,
        },
    },
    inputLabelFocused: {
        color: blueGrey[400],
        height: ({ height }) => height,
        fontSize: ({ labelFontsize }) => labelFontsize,
    },
}));

export type CustomSelectProps<T> = {
    label: string;
    onChange: (value: T) => void;
    autofocus?: boolean;
    height: number;
    fontsize: number;
    labelFontsize: number;
    defaultValue?: T;
    items: { label: string; value: T }[];
};

export const CustomSelect = <T extends string | number | readonly string[] | undefined>(props: CustomSelectProps<T>) => {
    const classes = useCustomSelectStyles({ height: props.height, fontsize: props.fontsize, labelFontsize: props.labelFontsize });
    const [value, setValue] = useState<T | undefined>(props.defaultValue);
    const items = props.items.map((x) => {
        return (
            <MenuItem style={{ fontSize: props.fontsize }} key={x.label} value={x.value}>
                <em>{x.label}</em>
            </MenuItem>
        );
    });

    return (
        <FormControl>
            <InputLabel
                shrink={true}
                classes={{
                    root: classes.inputLabel,
                    focused: classes.inputLabelFocused,
                }}
            >
                {props.label}
            </InputLabel>
            <Select
                onChange={(e) => {
                    props.onChange(e.target.value as T);
                    setValue(e.target.value as T);
                }}
                defaultValue={value}
                inputProps={{
                    classes: {
                        root: classes.input,
                    },
                }}
            >
                {items}
            </Select>
        </FormControl>
    );
};
