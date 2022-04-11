###
# Makefile
#
# (C) 2022, Simon Luetzelschwab
###
.PHONY: all node

USER=$(shell whoami)
USER_ID=$(shell id -u)
GROUP_ID=$(shell id -g)

BS_CMD=bash

PWD=$(shell pwd)
WORK_DIR=/opt

node:
	./scripts/node.sh

gcloud:
	./scripts/gcloud.sh
