import { Avatar, Box, Container, CssBaseline, Divider, Link, Typography } from "@material-ui/core";
import React from "react";
import { useStyles } from "../000_common/Style";
import { Copyright } from "./Copyright";

export type QuestionnaireProps = {
    avatorIcon: JSX.Element;
    title: string;
    forms: JSX.Element;
    links: {
        title: string;
        onClick: () => void;
    }[];
};

export const Questionnaire = (props: QuestionnaireProps) => {
    const classes = useStyles();
    const links = props.links.map((x) => {
        return (
            <Link key={x.title} onClick={x.onClick}>
                {x.title}
            </Link>
        );
    });

    return (
        <Container maxWidth="xs" className={classes.root}>
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>{props.avatorIcon}</Avatar>
                <Typography variant="h4" className={classes.title}>
                    {props.title}
                </Typography>

                <div>{props.forms}</div>

                <Divider style={{ width: "50%" }} />
                <div style={{ display: "flex", flexDirection: "column" }}>{links}</div>

                <Divider style={{ width: "50%" }} />
                <Copyright />
            </div>
        </Container>
    );
};
