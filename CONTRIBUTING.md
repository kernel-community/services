# Contributing

We appreciate any and all contributions. Before contributing, please read our [code of conduct](CODE_OF_CONDUCT.md).

## Chat

If you are here, you are likely part of the Kernel and you should join the [#kernel-building-kernel](https://app.slack.com/client/T016DS66R99/C031ES44SA3) Slack channel.

## Submitting an issue

Feel free to submit an issue through the issue tracker.

## Submitting a pull request

For non-trivial changes, please first seek a conversation to avoid any unnecessary work.

## Developing

_Node_: Check that Node is [installed](https://nodejs.org/en/download/) with version `>= 16.8.0`. You can check this with `node -v`.

_Yarn_: Make sure that Yarn 1 is [installed](https://classic.yarnpkg.com/en/docs/install) with version >= `1.22.0`.

### Setup

Fork the repo to your GitHub account, check it out locally and run

`yarn install`

### Branch organization

All changes should be submitted against the main branch. The goal is to maintain a healthy tip of the branch with all tests passing and no breaking changes. Potentially breaking changes or experimental features should be behind a feature flag.


### Code organization

This is a [monorepo](https://danluu.com/monorepo/) using `yarn workspaces` with each workspace in the customary `packages` folder. 

### Creating a new app

Look at `packages/admin` and copy the necessary config files. Consider contributing by adding a [custom template](https://create-react-app.dev/docs/custom-templates/) to make this process easier.

### Running the server locally

The `storage` service currently needs to connect to a Google Cloud Storage bucket. Consider contributing by adding a version with a [storage service](https://github.com/kernel-community/services/blob/main/packages/storage/src/services/storage.js) backed by a local file system instead.

### Running an app

This repo uses `workspaces` to manage local dependencies. From the root of the repo, this is how you start the `admin` app:

```
yarn workspace @kernel/admin start
```

### Running tests

TBD

