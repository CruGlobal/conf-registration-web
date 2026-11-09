#!/usr/bin/env bash
# Builds the site image. The shared pipeline v2 build runs this and passes
# DOCKER_ARGS (the builder, the tags, --push, and the VERSION and GIT_SHA build
# args). You can run it locally too.
#
# The build also exports the BUILD_ROLLBAR_ACCESS_TOKEN and
# BUILD_ROLLBAR_ENDPOINT repo secrets as ROLLBAR_ACCESS_TOKEN and
# ROLLBAR_ENDPOINT. They reach webpack as BuildKit secrets, so they are kept
# out of the image's config and history. Without them the site still builds,
# but it never reports errors.
# No -u: macOS bash 3.2 treats an empty array as unbound.
set -eo pipefail

# Word splitting is how DOCKER_ARGS has always been passed on.
read -r -d '' -a args <<<"${DOCKER_ARGS:-}" || true

for name in ROLLBAR_ACCESS_TOKEN ROLLBAR_ENDPOINT; do
  if [ -n "${!name:-}" ]; then
    args+=(--secret "id=$name,env=$name")
  fi
done

# BuildKit leaves secret values out of its cache key, so a cached bundle would
# keep an old token or endpoint. A hash of both values, passed as a build arg,
# makes a change rebuild the bundle.
if command -v sha256sum >/dev/null; then
  sha256() { sha256sum; }
else
  sha256() { shasum -a 256; }
fi
fingerprint="$(printf '%s\n%s\n' "${ROLLBAR_ACCESS_TOKEN:-}" "${ROLLBAR_ENDPOINT:-}" | sha256 | cut -d ' ' -f 1)"

docker buildx build "${args[@]}" \
  --build-arg NODE_VERSION="$(awk '$1 == "nodejs" { print $2 }' .tool-versions)" \
  --build-arg ROLLBAR_FINGERPRINT="$fingerprint" \
  .
