import { useEffect, useState } from "react"


export const useScheduler = () =>{

    const [ tenSecondsTaskTrigger, setTenSecondsTasksTringer] = useState(0)

    useEffect(() => {
        const id = setInterval(() => {
            setTenSecondsTasksTringer(t => t + 1);
        }, 1000 * 10)
    },[])

    return {tenSecondsTaskTrigger}
}
