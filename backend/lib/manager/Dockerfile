FROM node:buster

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update -y && apt-get install -y emacs x11-apps imagemagick mlocate git curl wget pulseaudio xvfb ffmpeg xdotool unzip

COPY /recording /recording
WORKDIR /recording
RUN npm install &&  chmod +x /recording/run.sh && chmod +x /recording/record.js


RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get update
RUN apt-get install -y google-chrome-stable

WORKDIR /recording
RUN npm i puppeteer-core

ENTRYPOINT ["/recording/run.sh"]


