FROM node:9

# install packages
RUN mkdir -p /usr/src/app
ADD app/package.json /usr/src/app
WORKDIR /usr/src/app
RUN npm install
# set up app
COPY app /usr/src/app

EXPOSE 3000

CMD [ "npm", "run", "start" ]
