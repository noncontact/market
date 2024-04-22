FROM node:10
WORKDIR /home/app 
COPY package.json ./ 
RUN npm install 
COPY ./ ./
CMD ["node", "index.js"] 
