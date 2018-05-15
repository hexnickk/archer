module.exports = {
    "env": {
        "node": true,
        "browser": true,
    },
    "parserOptions": {
        "ecmaVersion": 8,
        "ecmaFeatures": {
        "experimentalObjectRestSpread": true
        },
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