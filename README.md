# React Native CDP Status

Generates [documentation](https://cdpstatus.reactnative.dev/) showing the progress of the [React Native](https://reactnative.dev/) project's support of the [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/).

## ✈️ Getting started

First, install git if you do not have it installed already.

### git Installation Steps for Linux
1. Open your terminal
2. Run the following lines of code:

```bash
sudo apt update
sudo apt install git
```

### git Installation Steps for macOS
1. Open your terminal
2. Run the following line of code:

```bash
brew install git
```

### git Installation Steps for Windows
1. Download git from https://git-scm.com/download/win and follow the installation steps
2. Check that it was installed correctly by running the following line of code in your terminal:

```bash
git --version
```

Next, install the Node Package Manager (npm) if you do not have it installed already.

### npm Installation Steps for Linux
1. Open your terminal 
2. Run the following lines of code:

```bash
sudo apt update
sudo apt install nodejs npm
```
### npm Installation Steps for macOS
1. Open your terminal
2. Run the following line of code:

```bash
brew install node
```

### npm Installation  for Windows
1. Dowload npm from https://nodejs.org/en and follow the installation steps
2. Check that it was installed correclty by running the following line of code in your terminal:

```bash
npm --version
```

Next, clone the repository by running the following line of code in your terminal:

```bash
git clone https://github.com/facebook/react-native-cdp-status.git
```

Create a Github [personal access token](https://github.com/settings/tokens/new?description=React%20Native%20CDP%20Status&scopes=public_repo) with `public_repo` permissions. We use this to check the current state of the [React Native](https://github.com/facebook/react-native), [Hermes](https://github.com/facebook/hermes/) and [Chrome DevTools Protocol](https://github.com/ChromeDevTools/devtools-protocol) projects.

Open up your prefered IDE, like vscode and run the following line in the terminal:

```bash
export GITHUB_TOKEN=<your token>
npm install
npm run dev
```

Open http://localhost:3000/ site in your favorite browser.

If you run into any issues make sure that git and npm are correclty installed and that you cloned the repository.

## 👏 How to Contribute

The main purpose of this repository is to generate documentation that tracks the progress in React Native of our support of the CDP protocol.

### Code of Conduct

Facebook has adopted a Code of Conduct that we expect project participants to adhere to.
Please read the [full text][code] so that you can understand what actions will and will not be tolerated.

[code]: https://code.fb.com/codeofconduct/

### Contributing

We follow a similar process to React Native, please read the [**Contributing Guide**][contribute] to learn about our development process, how to propose bugfixes and improvements.

[contribute]: https://reactnative.dev/docs/contributing

## Credit

## 📄 License

React Native CDP Status is MIT licensed, as found in the [LICENSE][l] files.

React Native CDP Status's generated content is Creative Commons licensed, as found in the [LICENSE-docs][ld] file.

[l]: https://github.com/facebook/react-native-cdp-status/blob/main/LICENSE
[ld]: https://github.com/facebook/react-native-cdp-status/blob/main/LICENSE-docs
