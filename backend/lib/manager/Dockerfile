FROM dannadori/hmm:26h 
# TODO: 仮対策chromeのバージョンが上がって動かなくなったので過去版を引き継ぐ。
#FROM node:16-buster-slim
# FROM node:16-buster

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update -y && apt-get install -y wget pulseaudio xvfb gnupg

# RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
# RUN sh -c 'echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
# RUN apt-get update && \
#     apt-get install -y google-chrome-stable && \
#     apt-get clean && \
#     rm -rf /var/lib/opt/lists/* 


COPY /recording/dist /recording/dist
COPY /recording/run.sh /recording/run.sh

# COPY /recording /recording

WORKDIR /recording
#RUN npm install &&  chmod +x /recording/run.sh && chmod +x /recording/dist/index.js
#RUN chmod +x /recording/run.sh && chmod +x /recording/dist/index.js
RUN npm i puppeteer@10.0.0 aws-sdk socket.io@4.1.1 async-lock@1.3.0


WORKDIR /recording
# RUN npm i puppeteer-core aws-sdk socket.io@4.1.1 express@4.17.1 async-lock

ENTRYPOINT ["/recording/run.sh"]


