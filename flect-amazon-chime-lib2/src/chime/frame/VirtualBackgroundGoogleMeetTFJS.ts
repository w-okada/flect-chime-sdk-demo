import { generateDefaultGoogleMeetSegmentationParams, generateGoogleMeetSegmentationDefaultConfig, GoogleMeetSegmentationSmoothingType, GoogleMeetSegmentationWorkerManager } from "@dannadori/googlemeet-segmentation-worker-js";
import { VirtualBackgroundConfig } from "./VirtualBackground";

export class VirtualBackgroundGoogleMeetTFJS {
    personCanvas = document.createElement("canvas");
    personMaskCanvas = document.createElement("canvas");
    lightWrapCanvas = document.createElement("canvas");
    canvasBackground = document.createElement("canvas");

    googleMeetLightWrappingEnable = true;
    googlemeetModelReady = false;
    googlemeetConfig = (() => {
        const c = generateGoogleMeetSegmentationDefaultConfig();
        c.processOnLocal = true;
        c.modelKey = Object.keys(c.modelTFLites)[0];
        c.useTFJS = true;
        c.useSimd = true;
        return c;
    })();
    googlemeetParams = (() => {
        const p = generateDefaultGoogleMeetSegmentationParams();
        p.interpolation = 4;
        p.jbfD = 2;
        p.jbfSigmaC = 2;
        p.jbfSigmaS = 2;
        p.jbfPostProcess = 3;
        p.processSizeKey = Object.keys(this.googlemeetConfig.processSizes)[0];
        p.threshold = 1.0;
        return p;
    })();
    googlemeetManager = (() => {
        console.log("GOOGLE!");
        const m = new GoogleMeetSegmentationWorkerManager();
        m.init(this.googlemeetConfig).then(() => {
            this.googlemeetModelReady = true;
        });
        return m;
    })();

    lightWrappingBlur = 10;
    antialiaseBlur = 4;

    predict = async (frontCanvas: HTMLCanvasElement, backCanvas: HTMLCanvasElement, targetCanvas: HTMLCanvasElement, config: VirtualBackgroundConfig) => {
        const result = await this.googlemeetManager!.predict(frontCanvas, this.googlemeetParams!);
        if (result) {
            this.convert_googlemeet(frontCanvas, backCanvas, targetCanvas, result, config);
        }
    };

    convert_googlemeet = (foreground: HTMLCanvasElement, background: HTMLCanvasElement, targetCanvas: HTMLCanvasElement, segmentation: ImageData, conf: VirtualBackgroundConfig) => {
        // (1) resize output canvas and draw background
        if (conf.width <= 0 || conf.height <= 0) {
            conf.width = foreground.width > background.width ? foreground.width : background.width;
            conf.height = foreground.height > background.height ? foreground.height : background.height;
        }

        targetCanvas.width = conf.width;
        targetCanvas.height = conf.height;
        targetCanvas.getContext("2d")!.drawImage(background, 0, 0, conf.width, conf.height);
        if (conf.type === "None") {
            // Depends on timing, bodypixResult is null
            targetCanvas.getContext("2d")!.drawImage(foreground, 0, 0, targetCanvas.width, targetCanvas.height);
            return;
        }

        // (2) generate foreground transparent
        this.personMaskCanvas.width = segmentation.width;
        this.personMaskCanvas.height = segmentation.height;
        this.personMaskCanvas.getContext("2d")!.putImageData(segmentation, 0, 0);

        // (3) generarte Person Canvas
        this.personCanvas.width = conf.width;
        this.personCanvas.height = conf.height;
        const personCtx = this.personCanvas.getContext("2d")!;
        personCtx.clearRect(0, 0, this.personCanvas.width, this.personCanvas.height);
        personCtx.filter = `blur(${this.antialiaseBlur}px)`;
        personCtx.drawImage(this.personMaskCanvas, 0, 0, this.personCanvas.width, this.personCanvas.height);
        personCtx.filter = `none`;
        personCtx.globalCompositeOperation = "source-atop";
        personCtx.drawImage(foreground, 0, 0, this.personCanvas.width, this.personCanvas.height);
        this.personCanvas.getContext("2d")!.globalCompositeOperation = "source-over";

        // (4) apply LightWrapping
        const dstCtx = targetCanvas.getContext("2d")!;
        dstCtx.filter = `blur(${this.lightWrappingBlur}px)`;
        dstCtx.drawImage(this.personMaskCanvas, 0, 0, targetCanvas.width, targetCanvas.height);
        dstCtx.filter = "none";

        // (5) draw personcanvas
        dstCtx.drawImage(this.personCanvas, 0, 0, targetCanvas.width, targetCanvas.height);
        return;
    };
}
