FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY src ./src
COPY migrations ./migrations
EXPOSE 8080
CMD ["npm", "start"]
