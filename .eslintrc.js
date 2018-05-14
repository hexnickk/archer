module.exports = {
    "env": {
        "node": true
    },
    "parserOptions": {
        "ecmaVersion": 8,
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