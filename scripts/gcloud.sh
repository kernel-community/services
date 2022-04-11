docker run --rm -it \
  -v $PWD/config:/root/.config/gcloud \
  -v $PWD:/root google/cloud-sdk bash
