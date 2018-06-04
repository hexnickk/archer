# Installation

Was tested on Arch Linux and Macbook


```
# install dependencies
yarn
```

## For Arch Linux users

You need to install [google-chrome](https://aur.archlinux.org/packages/google-chrome/) from AUR

# Usage

```
./archer.js -u http://example.com
# debug mode
NODE_ENV='development' ./archer.js -u http://example.com
```

# TestApp


## Requirements

Install docker, docker-compose, npm

## Usage

To run prod version without code change detection:

```
docker-compose up --build
```

To run dev version with code change detection:

```
npm install --prefix app
docker-compose -f docker-compose.dev.yml up --build
```

To stop containers:

```
docker-compose down
```
