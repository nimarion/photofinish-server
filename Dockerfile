FROM node:17-bullseye-slim 

RUN npm install --global serve

WORKDIR /shared-folder

CMD ["serve", "/shared-folder" ]