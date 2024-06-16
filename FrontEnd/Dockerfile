# build stage
FROM node:18.17.0-alpine as build-stage
# Define container directory
WORKDIR /usr/src/app
# Copy package*.json for npm install
COPY package*.json ./
# Run npm clean install, including dev dependencies for @angular-devkit
RUN npm ci
# Run npm install @angular/cli
RUN npm install -g @angular/cli
# Copy all files
COPY . .
# Run ng build through npm to create dist folder
RUN npm run build

# Define nginx for front-end server
FROM nginx:1.17-alpine as production-stage
# Copy dist from ng build to nginx html folder
COPY --from=build-stage /usr/src/app/dist/front-end /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
# CMD ["npm", "run", "start"]