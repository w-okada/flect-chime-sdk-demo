FROM node:16-buster

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update -y && apt-get install -y emacs x11-apps imagemagick mlocate git curl wget pulseaudio xvfb ffmpeg xdotool unzip

RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get update
RUN apt-get install -y google-chrome-stable


COPY /recording /recording
WORKDIR /recording
RUN npm install &&  chmod +x /recording/run.sh && chmod +x /recording/index.js



WORKDIR /recording
RUN npm i puppeteer-core
RUN npm i aws-sdk

RUN npm i socket.io@4.1.1
RUN npm i express@4.17.1
RUN npm i async-lock

ENTRYPOINT ["/recording/run.sh"]


