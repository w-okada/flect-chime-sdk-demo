import { DefaultVideoTransformDeviceObserver } from "amazon-chime-sdk-js";

export class DefaultVideoTransformDeviceObserverImpl implements DefaultVideoTransformDeviceObserver {
    processingDidStart() {
        console.log("process Start!")
    }
    processingDidFailToStart() {
        console.log("process Fail Start!")
    }
    processingDidStop() {
        console.log("process stop!!")
    }
    processingLatencyTooHigh(latencyMs: number) {
        console.log("process latency!!", latencyMs)

    }
}
