#! /bin/bash
#
# Quick script to deploy testmyads files to cdn
#

CDN_DIR="/vcm/content.live/testmyads"
TMA_DIR="/vcm/home/component/mobile/testmyads/cdn/"

if [ ! -d ${CDN_DIR} ]; then
   echo "	${CDN_DIR} either doesn't exist or isn't a directory"
   exit 1
fi

if [ ! -d ${TMA_DIR} ]; then
   echo "	${TMA_DIR} either doesn't exist or isn't a directory"
   exit 1
fi

echo "Deploying ${TMA_DIR} to ${CDN_DIR}"

rsync -av "${TMA_DIR}" "${CDN_DIR}"


