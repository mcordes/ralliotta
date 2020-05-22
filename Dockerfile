FROM alpine:3.9 as bootstrapper


RUN apk add --no-cache nodejs npm musl-dev gcc build-base && \
    apk add --no-cache mariadb-dev util-linux libffi-dev

# just copy enough so we can bootstrap
COPY package.json /app/
RUN mkdir -p /app/templates
COPY templates/index_template.html /app/templates/
COPY conf/modernizr-conf.json /app/conf
COPY assets /app/assets

WORKDIR /app
RUN npm install && \
    npm run build

# TODO-mrc
#    npm run test && \
#    npm run lint && \


# now copy the whole app
WORKDIR /
COPY . /app

# TODO-mrc: ?
#    rm -rf /app/node_modules


# Now start all over again with a fresh image and copy from bootstrapper
FROM alpine:3.9
RUN apk add --no-cache nginx nodejs npm mariadb-dev 


COPY --from=bootstrapper --chown=nginx:nginx /app /app


RUN ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log && \
    cp /app/conf/nginx.conf /etc/nginx/nginx.conf && \
    rm -rf ~root/.cache && \
    rm -rf ~root/.npm 




EXPOSE 80
ENTRYPOINT [ "/app/conf/docker_start.sh" ]


