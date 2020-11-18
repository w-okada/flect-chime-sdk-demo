// // Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// // SPDX-License-Identifier: Apache-2.0

// import { HTMLAttributes, forwardRef, useRef, useEffect } from "react";
// import { BaseProps } from "amazon-chime-sdk-component-library-react/lib/components/ui/Base"
import React from "react";
// import { CustomStyledVideoTile } from "./CustomStyledVideoTile";


// type ObjectFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';

// export interface VideoTileProps
//   extends Omit<HTMLAttributes<HTMLDivElement>, 'css'>,
//     BaseProps {
//   /** The name to show on the video tile */
//   nameplate?: string | null;
//   /** Specifies which CSS object-fit value to apply to the VideoTile so that it resizes to fit its container  */
//   objectFit?: ObjectFit;
// }

// export const CustomVideoTile = forwardRef(
//     (props: VideoTileProps, ref: React.Ref<HTMLVideoElement>) => {
//       const { tag, className, nameplate, ...rest } = props;
//       const canvasEl = useRef<HTMLCanvasElement | null>(null);
//       console.log("--->", ref)

//       useEffect(() => {
//         if (!canvasEl.current) {
//             return;
//         }
//         const now = performance.now()
//         canvasEl.current?.getContext("2d")?.fillText(`${now}`, 10, 10)
//         console.log("-----", canvasEl.current!?.width, canvasEl.current!?.height)
//       });

//       return (
//         <CustomStyledVideoTile
//           as={tag}
//           className={className || ''}
//           data-testid="video-tile"
//           {...rest}
//         >
//           <video ref={ref} className="ch-video" />
//           <canvas ref={canvasEl} />
//           {nameplate && (
//             <header className="ch-nameplate">
//               <p className="ch-text">{nameplate}</p>
//             </header>
//           )}
//         </CustomStyledVideoTile>
//       );
//     }
//   );
  
// export default CustomVideoTile;
