import React, { useMemo } from 'react';


export const CreditPanel = () => {
    const credit = useMemo(()=>{
        return(
            <div style={{display:"flex", flexDirection:"column"}}>
                <div>
                    Powered by <a href="https://www.flect.co.jp/" rel="noopener noreferrer" target="_blank">FLECT</a>. 
                </div>
                <div>
                    <a href="https://github.com/w-okada/flect-chime-sdk-demo" rel="noopener noreferrer" target="_blank">github</a>
                </div>
            </div>
        )
        
    },[])
    return (
        <> 
            <div style={{color:"burlywood"}}>
                Credit
            </div>
            <div style={{marginLeft:"15pt"}}>
                {credit}
            </div>
        </>
    );
}