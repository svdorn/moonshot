# Moonshot

Moonshot Insights is a website that will allow students to get credentialed in their learning as well as helping them connect with employers in order to start meaningful careers in industries that matter to them.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

Have the prerequisites installed and do the steps under installing, after completing that, do these steps:
```
cd to a directory where you want the repo placed on your local machine
git clone https://moonshotinsights@bitbucket.org/moonshotinsights/moonshot.git
cd moonshot
git checkout staging
npm install
```
Tell Node that you are going to be working on a development server by exporting NODE_ENV wherever your PATH is set. If you don't know where that is and are working on a Mac, it may be in .bash_profile
```
export NODE_ENV=development
```
You will need to get a credentials.js file so that you're able to access the database from your local machine. Ask Stephen or Austin for this file as it isn't included in the repo.

Open new terminal and do:
```
cd moonshot
npm run dev
```
Open new terminal and do:
```
cd moonshot
nodemon
```

Go to localhost:8081 and the site will be up.

### Prerequisites

* [Node](https://nodejs.org/en/) - Javascript runtime
* [npm](https://www.npmjs.com/) - Installs automatically when you intall node
* [Git](https://git-scm.com/downloads) - Version control system

### Installing

Software that you need to install.

* [MongoDB](https://docs.mongodb.com/manual/installation/) - Database management, install it globally
```
npm install -g mongodb
```

## Running the tests
```
npm test
```

## Deployment

System is deployed to AWS elastic beanstalk

## Built With

* [MaterialUI](http://www.material-ui.com/) - Frontend UI
* [Redux Form](https://redux-form.com/7.2.0/) - Frontend UI Forms Validator
* [React-Router](https://github.com/ReactTraining/react-router) - Frontend routing

## Authors

* **Stephen Dorn** - *CTO* - [svdorn](https://github.com/svdorn)
* **Austin Meyer** - *CIO* - [frizzkitten](https://github.com/frizzkitten)

## License

This project is licensed under the MIT License.

## Acknowledgments

* **Kyle Treige** - *CEO*
* **Justin Ye** - *Lead Designer*
