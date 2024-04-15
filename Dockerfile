FROM treehouses/pm2

WORKDIR /app

USER root
# Bundle APP files
COPY /server/dist /app/src/
COPY /server/public /app/public
COPY /server/package.json /app

# Install app dependencies
ENV NPM_CONFIG_LOGLEVEL warn
RUN npm install --production


# Show current folder structure in logs
RUN ls -al -R

CMD [ "pm2-runtime", "src/main.js","--watch" ]
