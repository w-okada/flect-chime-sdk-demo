import React from "react";
import { useMemo } from "react";
import { useAppState } from "../003_provider/AppStateProvider";
import { Processing } from "./parts/001_processing";

export const LoadingUserInformationDialog = () => {
    const {} = useAppState();

    const description = useMemo(() => {
        return "Now loading user information.";
    }, []);

    const processing = useMemo(() => {
        return (
            <div className="dialog-input-controls">
                {" "}
                <Processing />{" "}
            </div>
        );
    }, []);

    const form = useMemo(() => {
        return (
            <div className="dialog-frame">
                <div className="dialog-title">Load User Information</div>
                <div className="dialog-content">
                    <div className={"dialog-application-title"}>Flect Amazon Chime Demo</div>
                    <div className="dialog-description">{description}</div>
                    <form>
                        <div className="dialog-input-container">{processing}</div>
                    </form>
                </div>
            </div>
        );
    }, []);
    return form;
};
