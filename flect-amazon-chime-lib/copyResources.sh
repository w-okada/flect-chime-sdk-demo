
# BodyPix
cp node_modules/\@dannadori/bodypix-worker-js/dist/bodypix-worker-worker.js resources/bodypix/

# GoogleMeet
cp node_modules/\@dannadori/googlemeet-segmentation-worker-js/dist/googlemeet-segmentation-worker-worker.js resources/googlemeet/ 

# GoogleMeet TFLITE
cp node_modules/\@dannadori/googlemeet-segmentation-tflite-worker-js/dist/googlemeet-segmentation-tflite-worker-worker.js resources/googlemeet-tflite/
cp node_modules/\@dannadori/googlemeet-segmentation-tflite-worker-js/resources/tflite.wasm resources/googlemeet-tflite/ 
cp node_modules/\@dannadori/googlemeet-segmentation-tflite-worker-js/resources/tflite-simd.wasm resources/googlemeet-tflite/

# FFPEG
cp node_modules/\@ffmpeg/core/dist/ffmpeg-core.wasm resources/ffmpeg/
cp node_modules/\@ffmpeg/core/dist/ffmpeg-core.worker.js resources/ffmpeg/
cp node_modules/\@ffmpeg/core/dist/ffmpeg-core.js resources/ffmpeg/


