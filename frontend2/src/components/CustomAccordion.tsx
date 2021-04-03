import React, { ReactNode } from "react"
import MuiAccordionDetails from '@material-ui/core/AccordionDetails';
import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import { withStyles } from "@material-ui/core/styles";
import { ExpandMore } from "@material-ui/icons";

type Props = {
    title: string
    children: ReactNode
};

const Accordion = withStyles({
    root: {
        boxShadow: 'none',
        margin: '0px',
        // '&:not(:last-child)': {
        //     borderBottom: 0,
        //     margin: '0px',
        // },
        // '&:before': {
        //     display: 'none',
        //     margin: '0px',
        // },
        '&$expanded': {
            margin: '0px',
        },
    },
    expanded: {},
})(MuiAccordion);

const AccordionSummary = withStyles({
    root: {
        backgroundColor: 'rgba(250, 250, 250)',
        margin: '0px',
        height: "10px",
        '&$expanded': {
            height: "0px",
            margin: '0px',
        },
    },
    content: {
        margin: '0px',
        '&$expanded': {
            height: "0px",
        },
    },
    //expanded: {},
})(MuiAccordionSummary);

const AccordionDetails = withStyles((theme) => ({
    root: {
        padding: theme.spacing(2),
    },
}))(MuiAccordionDetails);


export const CustomAccordion = ({ title, children }: Props) => {
    return (
        <>
            <Accordion square expanded={true}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                    {title}
                </AccordionSummary>
                <AccordionDetails>
                    {children}
                </AccordionDetails>
            </Accordion>

        </>
    )
}
