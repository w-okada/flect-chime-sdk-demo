import { useEffect, useState } from "react"


export const useScheduler = () =>{

    const [ tenSecondsTaskTrigger, setTenSecondsTasksTringer] = useState(0)
    const [ thirtyMinutesSecondsTaskTrigger, setThirtyMinutesSecondsTaskTrigger] = useState(0)
    const [ oneHourTaskTrigger, setOneHourTaskTrigger] = useState(0)
    const [ threeHourTaskTrigger, setThreeHourTaskTrigger] = useState(0)

    useEffect(() => {
        setInterval(() => {
            setTenSecondsTasksTringer(t => t + 1);
        }, 1000 * 10)
    },[])

    useEffect(() => {
        setInterval(() => {
            setThirtyMinutesSecondsTaskTrigger(t => t + 1);
        }, 1000 * 60 * 30)
    },[])

    useEffect(() => {
        setInterval(() => {
            setOneHourTaskTrigger(t => t + 1);
        }, 1000 * 60 * 60)
    },[])

    useEffect(() => {
        setInterval(() => {
            setThreeHourTaskTrigger(t => t + 1);
        }, 1000 * 60 * 60 * 3)
    },[])

    return {tenSecondsTaskTrigger, thirtyMinutesSecondsTaskTrigger, oneHourTaskTrigger, threeHourTaskTrigger}


}
