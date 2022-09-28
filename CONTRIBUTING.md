# Contributing

We appreciate any and all contributions. Before contributing, please read our [code of conduct](CODE_OF_CONDUCT.md).

## Chat

If you are here, you are likely part of the Kernel and you should join the [#kernel-building-kernel](https://app.slack.com/client/T016DS66R99/C031ES44SA3) Slack channel.

## Submitting an issue

Feel free to submit an issue through the issue tracker.

## Developing

_Node_: Check that Node is [installed](https://nodejs.org/en/download/) with version `>= 16.8.0`. You can check this with `node -v`.

_Yarn_: Make sure that Yarn 1 is [installed](https://classic.yarnpkg.com/en/docs/install) with version >= `1.22.0`.

### Code organization

This is a [monorepo](https://danluu.com/monorepo/) using `yarn workspaces` with each workspace in the customary `packages` folder. 

### Setup

Go to our [staging site](https://staging.wallet.kernel.community) and create a new wallet. Use this staging wallet for local development, as your local environment will default to using to the staging auth and storage services. This means you have less to set up and can get going with two commands.

Fork the repo to your GitHub account, check it out locally and run:

`yarn install`

### Running an app

This repo uses `workspaces` to manage local dependencies. From the root of the repo, this is how you start, for instance, the `admin` app:

```
yarn workspace @kernel/admin start
```

If you wanted to start the walelt, you would run:

```
yarn workspace @kernel/wallet start
```

### Creating a new app

Look at `packages/admin` and copy the necessary config files. Consider contributing by adding a [custom template](https://create-react-app.dev/docs/custom-templates/) to make this process easier.

## Submitting a pull request

For non-trivial changes, please first seek a conversation to avoid any unnecessary work.

You'll want to fork this repo and submit a PR from your fork to this repo's `main` branch.

When you're ready to submit a PR:

1. Run `yarn lint` from the root directory to see the linter errors (it can also be run per package from inside the package's directory). Run `yarn format` to auto-fix the errors where possible.
1. Ensure your branch includes the latest commits from `main`.
1. Write a PR title and description summarizing your changes.
1. In your PR description, mention any Issues that your PR addresses.
1. For changes visible in the frontend, include screenshots in your PR description.
1. CI will run on your branch. It will need to be green before your PR can be merged.
1. Get at least 1 PR review from another contributor. If changes are requested, make the requested changes in new commits and request a new review from the PR reviewer.
1. When CI and PR reviews are green, your PR will be merged via "Squash and merge" which will trigger a deploy to staging.

### Branch organization

All changes should be submitted against the main branch. The goal is to maintain a healthy tip of the branch with all tests passing and no breaking changes. Potentially breaking changes or experimental features should be behind a feature flag.

### Running the server locally

The `storage` service currently needs to connect to a Google Cloud Storage bucket. Consider contributing by adding a version with a [storage service](https://github.com/kernel-community/services/blob/main/packages/storage/src/services/storage.js) backed by a local file system instead.

### Running tests

TBD

