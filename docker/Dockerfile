# This dockerfile should work for all traditional apps,
# i.e. it only sets up a nginx server with the app dist folder

FROM nginx:1.27-alpine

COPY dist/apps/gps/browser /usr/share/nginx/html/swissgeo-poc
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]
