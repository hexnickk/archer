module.exports = {
    "env": {
        "node": true,
        "browser": true,
        "es6": true,
    },
    "parserOptions": {
        "ecmaVersion": 8,
        "ecmaFeatures": {
        "experimentalObjectRestSpread": true
        },
    },
    "globals": {
        "browser": true,
    },
    "extends": "eslint:recommended",
    "rules": {
        "indent": [
            "error",
            2
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-console": [
            "warn",
            { allow: [ "warn", "error"] }
        ]
    }
};