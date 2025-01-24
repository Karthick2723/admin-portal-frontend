FROM node:18.17.1-alpine as build-step
RUN mkdir -p /app
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install -g @angular/cli@15

RUN npm -v
RUN npm install --force
COPY . /app
RUN npm run build --prod


FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=build-step /app/dist/ /usr/share/nginx/html

EXPOSE 80
