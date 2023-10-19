# React Native CDP Status

Generates [documentation](https://cdpstatus.reactnative.dev/) showing the progress of the [React Native](https://reactnative.dev/) project's support of the [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/).

## ✈️ Getting started

Create a Github [personal access token](https://github.com/settings/tokens/new?description=React%20Native%20CDP%20Status&scopes=public_repo) with `public_repo` permissions. We use this to check the current state of the [React Native](https://github.com/facebook/react-native), [Hermes](https://github.com/facebook/hermes/) and [Chrome DevTools Protocol](https://github.com/ChromeDevTools/devtools-protocol) projects.

```bash
export GITHUB_TOKEN=<your token>
npm install
npm run dev
```

Open http://localhost:3000/ site in your favorite browser.

## 👏 How to Contribute

The main purpose of this repository is to generate documentation that tracks the progress in React Native of our support of the CDP protocol.

### Code of Conduct

Facebook has adopted a Code of Conduct that we expect project participants to adhere to.
Please read the [full text][code] so that you can understand what actions will and will not be tolerated.

[code]: https://code.fb.com/codeofconduct/

### Contributing

We follow a similar process to React Native, please read the [**Contributing Guide**][contribute] to learn about our development process, how to propose bugfixes and improvements.

[contribute]: https://reactnative.dev/docs/contributing

## 📄 License

React Native CDP Status is MIT licensed, as found in the [LICENSE][l] files.

React Native CDP Status's generated content is Creative Commons licensed, as found in the [LICENSE-docs][ld] file.

[l]: https://github.com/facebook/react-native-cdp-status/blob/main/LICENSE
[ld]: https://github.com/facebook/react-native-cdp-status/blob/main/LICENSE-docs
