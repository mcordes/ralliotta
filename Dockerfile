FROM alpine:3.9 as bootstrapper


RUN apk add --no-cache nodejs npm musl-dev gcc build-base && \
    apk add --no-cache util-linux libffi-dev

# just copy enough so we can bootstrap
COPY package.json /app/
RUN mkdir -p /app/templates
COPY templates/index_template.html /app/templates/
COPY conf/modernizr-conf.json /app/conf
COPY assets /app/assets
COPY tsconfig.json /app/

ENV DISABLE_OPENCOLLECTIVE=true
WORKDIR /app
RUN npm --quiet install && \
    npm run build && \
    npm run test && \
    npm run lint


# now copy the whole app
WORKDIR /
COPY . /app


# Now start all over again with a fresh image and copy from bootstrapper
FROM alpine:3.9
RUN apk add --no-cache nginx nodejs npm


COPY --from=bootstrapper --chown=nginx:nginx /app /app


RUN ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log && \
    cp /app/conf/nginx.conf /etc/nginx/nginx.conf && \
    rm -rf ~root/.cache




EXPOSE 80
ENTRYPOINT [ "/app/conf/docker_start.sh" ]


