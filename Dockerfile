FROM ruby:3.4-alpine AS site-builder
WORKDIR /site
RUN apk add --no-cache build-base git
COPY Gemfile Gemfile.lock ./
RUN gem install bundler:2.6.8 && bundle _2.6.8_ config set path vendor/bundle && bundle _2.6.8_ install
COPY . .
RUN bundle _2.6.8_ exec jekyll build --destination /output

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=site-builder /output/ /usr/share/nginx/hadi-lab/
COPY sprint/ /usr/share/nginx/sprint/
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
