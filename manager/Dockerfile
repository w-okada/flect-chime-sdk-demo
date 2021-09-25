#FROM dannadori/hmm:26h 
# TODO: 仮対策chromeのバージョンが上がって動かなくなったので過去版を引き継ぐ。
#FROM node:16-buster
#FROM ubuntu:18.04
FROM ubuntu:20.04

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update -y && apt-get install -y wget pulseaudio xvfb gnupg emacs mlocate kmod
RUN apt-get install -y x11-xkb-utils xfonts-100dpi xfonts-75dpi xfonts-scalable xfonts-cyrillic x11-apps imagemagick ffmpeg

RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get update && \
    apt-get install -y google-chrome-stable && \
    apt-get clean && \
    rm -rf /var/lib/opt/lists/* 

RUN apt-get install -y nodejs npm
RUN npm install -g n
RUN n stable
RUN apt-get purge -y nodejs npm
RUN npm install electron -g --unsafe-perm=true --allow-root
RUN npm install -g @ffmpeg/ffmpeg @ffmpeg/core

COPY /run.sh /run.sh
COPY /app /app


ENTRYPOINT ["/run.sh"]


