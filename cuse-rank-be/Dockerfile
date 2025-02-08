FROM node:18.20.6

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .

EXPOSE 5000
CMD ["npm", "run", "start"]
