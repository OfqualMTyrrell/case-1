
# Getting Started with Create React App & IBM Carbon Design System


This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and includes the [IBM Carbon Design System](https://carbondesignsystem.com/) (`carbon-components-react`, `@carbon/icons-react`, `@carbon/themes`).
## Using IBM Carbon Components

You can now use Carbon React components in your app. Example usage:

```jsx
import { Button } from 'carbon-components-react';

function App() {
  return <Button>Carbon Button</Button>;
}
```

Refer to the [Carbon React documentation](https://react.carbondesignsystem.com/) for more details.

## Available Scripts

This project is configured to work optimally with both local development and Heroku production deployment.

### Development Scripts

#### `npm run dev`

Runs the app in development mode with hot reloading.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes and you'll see any lint errors in the console.

#### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

#### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

#### `npm run serve`

Serves the production build locally for testing.\
This mimics how the app will run in production on Heroku.

### Production Deployment

#### `npm start`

**Production command for Heroku deployment.**\
Serves the optimized production build using the `serve` package.

This command is automatically run by Heroku and provides optimal performance on basic dynos by serving minified, static files instead of running the development server.

#### `postinstall`

Automatically runs `npm run build` after dependencies are installed on Heroku, ensuring the production build is created during deployment.

### Local Development Workflow

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run serve        # Test production build locally
```

### Heroku Deployment

The project is configured for seamless Heroku deployment:

1. **Automatic Building**: The `postinstall` hook ensures the app is built after dependency installation
2. **Optimized Serving**: `npm start` serves the production build via the `serve` package
3. **Performance**: Uses minified, tree-shaken code for optimal performance on Heroku's basic dynos


### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
