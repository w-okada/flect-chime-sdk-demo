import { CanvasVideoFrameBuffer, VideoFrameBuffer, VideoFrameProcessor } from "amazon-chime-sdk-js";
import { VirtualBackgroundGoogleMeetTFLite } from "./VirtualBackgroundGoogleMeetTFLite";
import { VirtualBackgroundGoogleMeetTFJS } from "./VirtualBackgroundGoogleMeetTFJS";
import { VirtualBackgroundBodyPix } from "./VirtualBackgroundBodyPix";

export type VirtualBackgroundSegmentationType = "None" | "BodyPix" | "GoogleMeet" | "GoogleMeetTFLite";
export type BackgroundMode = "Image" | "Blur" | "Color";

export interface VirtualBackgroundConfig {
    frontPositionX: number; // ratio (position and size of front image)
    frontPositionY: number; // ratio (position and size of front image)
    frontWidth: number; // ratio (position and size of front image)
    frontHeight: number; // ratio (position and size of front image)

    width: number; // pixel (output size. If =<0, fit the background canvas size )
    height: number; // pixel (output size. If =<0, fit the background canvas size )

    type: VirtualBackgroundSegmentationType;
    backgroundMode: BackgroundMode;
    backgroundImage: HTMLCanvasElement | HTMLImageElement | null;
    backgroundColor: string;
}

export class VirtualBackground implements VideoFrameProcessor {
    BodyPix = new VirtualBackgroundBodyPix();
    GMTfjs = new VirtualBackgroundGoogleMeetTFJS();
    GMTflite = new VirtualBackgroundGoogleMeetTFLite();

    canvasBackground = document.createElement("canvas");

    private config: VirtualBackgroundConfig = {
        frontPositionX: 0, // ratio (position and size of front image)
        frontPositionY: 0, // ratio (position and size of front image)
        frontWidth: 1, // ratio (position and size of front image)
        frontHeight: 1, // ratio (position and size of front image)
        width: -1, // pixel (output size. If =<0, fit the background canvas size )
        height: -1, // pixel (output size. If =<0, fit the background canvas size )

        type: "None",
        backgroundMode: "Color",
        backgroundImage: null,
        backgroundColor: "#000000",
    };

    //////////////////////////////
    // Video Processing API RSC  //
    //////////////////////////////
    targetCanvas = document.createElement("canvas");
    canvasVideoFrameBuffer = new CanvasVideoFrameBuffer(this.targetCanvas!);

    ////////////////////////////
    // constructor & destory ///
    ////////////////////////////
    constructor() {
        console.log(`[VirtualBackground][constructor] initializing.`);
        const bg = new Image();
        bg.src = "/default/bg1.jpg";
        bg.onload = () => {
            this.canvasBackground.getContext("2d")!.drawImage(bg, 0, 0, this.canvasBackground.width, this.canvasBackground.height);
        };
    }

    async destroy() {
        this.canvasVideoFrameBuffer.destroy();
        return;
    }

    ///////////////////////
    // Parameter Setter ///
    ///////////////////////
    setVirtualBackgroundType(type: VirtualBackgroundSegmentationType) {
        this.config.type = type;
    }

    setBackgroundMode(mode: BackgroundMode) {
        this.config.backgroundMode = mode;
    }
    setBackgroundImage(path: string) {
        const bg = new Image();
        bg.src = path;
        bg.onload = () => {
            this.canvasBackground.getContext("2d")!.drawImage(bg, 0, 0, this.canvasBackground.width, this.canvasBackground.height);
        };
    }

    setBackgroundColor(color: string) {
        this.config.backgroundColor = color;
    }

    ////////////////
    // Processor  //
    ////////////////

    async process(buffers: VideoFrameBuffer[]) {
        if (buffers.length === 0) {
            return Promise.resolve(buffers);
        }
        // @ts-ignore
        const canvas = buffers[0].asCanvasElement();
        const frameWidth = canvas!.width;
        const frameHeight = canvas!.height;
        if (frameWidth === 0 || frameHeight === 0) {
            return Promise.resolve(buffers);
        }

        for (const f of buffers) {
            try {
                // @ts-ignore
                const canvas = f.asCanvasElement() as HTMLCanvasElement;
                // let result: any
                switch (this.config.type) {
                    case "BodyPix":
                        this.BodyPix.predict(canvas, this.canvasBackground, this.targetCanvas, this.config);
                        break;
                    case "GoogleMeet":
                        this.GMTfjs.predict(canvas, this.canvasBackground, this.targetCanvas, this.config);
                        break;
                    case "GoogleMeetTFLite":
                        this.GMTflite.predict(canvas, this.canvasBackground, this.targetCanvas, this.config);
                        break;
                    default:
                        this.convert_none(canvas);
                }
            } catch (err) {
                console.log("Exception:: ", err);
            }
        }
        buffers[0] = this.canvasVideoFrameBuffer;
        return Promise.resolve(buffers);
    }

    convert_none = (foreground: HTMLCanvasElement) => {
        // TODO: Width and Height
        this.targetCanvas.getContext("2d")!.drawImage(foreground, 0, 0, this.targetCanvas.width, this.targetCanvas.height);
    };
}
