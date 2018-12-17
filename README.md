# Moonshot

Moonshot Learning is a website that will allow students to get credentialed in their learning as well as helping them connect with employers in order to start meaningful careers in industries that matter to them.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.
First, navigate to the directory (folder) where you want the project to live. (e.g. /documents/code/). Example:

```
cd documents/code
```

Now clone the project into that directory. If it doesn't work, make sure you have authorization to access the repo.

```
git clone https://github.com/MoonshotLearning/moonshot.git
```

Woohoo! Now navigate into the project and install all the dependencies.

```
cd moonshot
npm install
```

Now you'll have to add a few things wherever your PATH is set. If you don't know where that is and are working on a Mac, it may be in .bash_profile.
To edit your PATH, enter the following:

```
vim ~/.bash_profile
```

Add the following things. To start editing in vim, press "i" - To finish, press "escape" then ":wq"
Make sure not to change the spacing on any of these, that'll break them!

Top thing: tells Node that you are going to be working on a development server.
Second thing: lets you locally test any emails that get sent (replace the example with your own email address).
Third thing: tells the code what url you'll be using.

```
export NODE_ENV=development
export DEV_EMAIL=example@gmail.com
export SITE_NAME=localhost:8081
```

Add the following to the same place so that you can locally test any emails that get sent: (replace the example with your email)

```
export DEV_EMAIL=example@gmail.com
```

Now you're ready to run the site locally! Open a new terminal window/tab, navigate to your moonshot directory, and run the following command. This will run webpack, which bundles up the files so they can be served.

```
npm run dev
```

Open another new terminal window/tab, navigate to your moonshot directory, and do the following. This runs nodemon, which will keep your local server running and will update every time you save. (Exception - saving .css files doesn't always force an update, so you may have to save some other file as well.)

```
npm run nodemon
```

Go to localhost:8081 and the site should be up. Nice!
Now for a couple random things. We use snyk to check for security vulnerabilities in our npm packages, so install snyk globally like so:

```
npm install -g snyk
```

We recommend using Atom as your text editor. If you have something else that you prefer, go for it, but know that it may make style standardization a little tougher.
If you are using Atom (which you can download from https://atom.io/), go into your preferences and install the package "Prettier." Then make sure it's enabled and press "shift+command+p". Search for "Prettier," then press "enter" on the option that toggles Format on Save. This will format your style so that everyone is using the same conventions.

You're all set up! Good job! If you have any questions, ask anyone who seems like they would know. If they don't know, they should be able to point you in the right direction!

### Prerequisites

-   [Node](https://nodejs.org/en/) - Javascript runtime
-   [npm](https://www.npmjs.com/) - Installs automatically when you intall node

### Installing

Software that you need to install.

-   [MongoDB](https://docs.mongodb.com/manual/installation/) - Database management, install it globally
-   [Webpack](https://www.npmjs.com/package/webpack) - Module bundler - install it globally

```
npm install -g mongodb
npm install -g webpack
```

End with an example of getting some data out of the system or using it for a little demo

## Running the tests

```
npm test
```

## Deployment

System is deployed to AWS elastic beanstalk

## Built With

-   [MaterialUI](http://www.material-ui.com/) - Frontend UI
-   [Redux Form](https://redux-form.com/7.2.0/) - Frontend UI Forms Validator
-   [React-Router](https://github.com/ReactTraining/react-router) - Frontend routing

## Authors

-   **Stephen Dorn** - _CTO_ - [svdorn](https://github.com/svdorn)
-   **Austin Meyer** - _CIO_ - [frizzkitten](https://github.com/frizzkitten)

## Acknowledgments

-   **Kyle Treige** - _CEO_
-   **Justin Ye** - _CPO/Lead Designer_
