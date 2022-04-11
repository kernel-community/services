docker run --rm -it -u node --net=host -P \
  -e GOOGLE_APPLICATION_CREDENTIALS="/home/node/config/legacy_credentials/simon@kernel.community/adc.json" \
  -v $PWD:/home/node -w /home/node node bash
