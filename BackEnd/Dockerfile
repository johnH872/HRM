# Define node version
FROM node:18.17.0
# Define container directory
WORKDIR /usr/src/app
# Copy package*.json for npm install
COPY package*.json ./
# Run npm clean install, prod dependencies only
# RUN npm ci --only=production
RUN npm install -g nodemon babel-cli
RUN npm rebuild bcrypt --build-from-source
RUN npm install
# Copy all files
COPY . .
# Expose port 8080 for server
EXPOSE 8080
# Run "node server/run.js"
CMD ["npm", "run", "start:dev"]