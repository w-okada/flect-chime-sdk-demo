
mkdir -p public
mkdir -p public/ffmpeg
mkdir -p public/static/js


# COPY WORKERS
### COPY VirtualBackground workers
cp node_modules/\@dannadori/flect-amazon-chime-lib/resources/bodypix/bodypix-worker-worker.js public
cp node_modules/\@dannadori/flect-amazon-chime-lib/resources/googlemeet/googlemeet-segmentation-worker-worker.js public
cp node_modules/\@dannadori/flect-amazon-chime-lib/resources/googlemeet-tflite/googlemeet-segmentation-tflite-worker-worker.js public

### COPY Googlemeet TFLITE WASM
cp node_modules/\@dannadori/flect-amazon-chime-lib/resources/googlemeet-tflite/tflite* public/static/js/

# FFMPEG
mkdir -p public/ffmpeg
cp node_modules/\@dannadori/flect-amazon-chime-lib/resources/ffmpeg/* public/ffmpeg/
