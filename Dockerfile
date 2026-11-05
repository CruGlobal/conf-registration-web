# NODE_VERSION is set by build.sh from .tool-versions.
ARG NODE_VERSION=24.3.0

# The full Debian image, not Alpine or slim: the image optimizers webpack runs
# ship prebuilt glibc binaries, and one dependency installs from a git URL.
FROM public.ecr.aws/docker/library/node:${NODE_VERSION}-bookworm AS builder
WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
RUN yarn install --immutable

COPY . .

# GIT_SHA is the commit being built. The shared build passes it as a build arg.
# webpack bakes it into the bundle as the error reports' code_version, and the
# label below names the source maps with the same value. A local build leaves
# it empty, and its bundle reports "development".
ARG GIT_SHA=""

# The error tracker's token and endpoint arrive as BuildKit secrets (see
# build.sh), so neither lands in a layer or the image history. A secret that
# was not passed leaves its variable unset, and the bundle never reports.
# ROLLBAR_FINGERPRINT is a hash of both values. It is here only so a change to
# either one rebuilds the bundle instead of reusing a cached one.
ARG ROLLBAR_FINGERPRINT=""
RUN --mount=type=secret,id=ROLLBAR_ACCESS_TOKEN,env=ROLLBAR_ACCESS_TOKEN \
    --mount=type=secret,id=ROLLBAR_ENDPOINT,env=ROLLBAR_ENDPOINT \
    yarn build

# Move every source map out of the site into a tree that mirrors its URL path,
# so dist/app.1a2b.js.map becomes /sourcemaps/app.1a2b.js.map. Maps are never
# served. The deploy uploads them to the error tracker instead.
RUN set -eu; \
    mkdir /sourcemaps; \
    cd dist; \
    find . -type f -name '*.map' -print | tar -cf - -T - | tar -xf - -C /sourcemaps; \
    find . -type f -name '*.map' -delete; \
    if [ -n "$(find . -name '*.map' -print)" ]; then \
      echo "a .map file is still in the site" >&2; exit 1; \
    fi; \
    test -f index.html

# The image the pipeline deploys. The deploy reads the site from one layer, so
# it is copied in one step, with index.html at its root.
FROM scratch
COPY --from=builder /app/dist /site/
COPY --from=builder /sourcemaps /cru/sourcemaps/
# The source maps' version. It must equal the code_version the bundle reports,
# so both come from GIT_SHA.
ARG GIT_SHA=""
LABEL org.cru.sourcemaps=${GIT_SHA}
