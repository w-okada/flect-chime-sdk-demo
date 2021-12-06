import { useEffect, useState } from "react";

export type SchedulerTrigger = {
    tenSecondsTaskTrigger: number;
    thirtyMinutesSecondsTaskTrigger: number;
    oneHourTaskTrigger: number;
    threeHourTaskTrigger: number;
};

export const useScheduler = () => {
    const [schedulerTrigger, setSchedulerTrigger] = useState<SchedulerTrigger>({
        tenSecondsTaskTrigger: 0,
        thirtyMinutesSecondsTaskTrigger: 0,
        oneHourTaskTrigger: 0,
        threeHourTaskTrigger: 0,
    });

    useEffect(() => {
        setInterval(() => {
            setSchedulerTrigger((t) => {
                return { ...t, tenSecondsTaskTrigger: t.tenSecondsTaskTrigger + 1 };
            });
        }, 1000 * 10);
    }, []);

    useEffect(() => {
        setInterval(() => {
            setSchedulerTrigger((t) => {
                return { ...t, thirtyMinutesSecondsTaskTrigger: t.thirtyMinutesSecondsTaskTrigger + 1 };
            });
        }, 1000 * 60 * 30);
    }, []);

    useEffect(() => {
        setInterval(() => {
            setSchedulerTrigger((t) => {
                return { ...t, oneHourTaskTrigger: t.oneHourTaskTrigger + 1 };
            });
        }, 1000 * 60 * 60);
    }, []);

    useEffect(() => {
        setInterval(() => {
            setSchedulerTrigger((t) => {
                return { ...t, threeHourTaskTrigger: t.threeHourTaskTrigger + 1 };
            });
        }, 1000 * 60 * 60 * 3);
    }, []);

    return schedulerTrigger;
};
