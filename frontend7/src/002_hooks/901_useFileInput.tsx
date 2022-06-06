import React, { useMemo, useState } from "react";

export type FileInputState = {
    dataURL: string;
    error: boolean;
    message: string;
};
export type FileInputStateAndMethod = FileInputState & {
    // click: () => void;
    click: () => Promise<string>;
};

export const useFileInput = () => {
    const click = async (regex: string) => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        const p = new Promise<string>((resolve, reject) => {
            fileInput.onchange = (e) => {
                console.log("file select");
                // @ts-ignore
                if (!e.target.files[0].type.match(regex)) {
                    // setState({
                    //     dataURL: "",
                    //     error: true,
                    //     // @ts-ignore
                    //     message: `not target file type ${e.target.files[0].type}`,
                    // });
                    // return;
                    //@ts-ignore
                    reject(`not target file type ${e.target.files[0].type}`);
                }
                const reader = new FileReader();
                reader.onload = () => {
                    console.log("load data", reader.result as string);
                    resolve(reader.result as string);
                    // setState({
                    //     dataURL: reader.result as string,
                    //     error: false,
                    //     message: "",
                    // });
                };
                // @ts-ignore
                reader.readAsDataURL(e.target.files[0]);
            };
            fileInput.click();
        });

        const url = await p;
        return url;
    };
    return { click };
};
