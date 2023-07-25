# Password Policy Validator

Download and include the javascript and css into your existing project.

`<script src="/password_policy_validator.js"></script>`

```js
var password_policy_validator = new Password_Policy_Validator();
password_policy_validator.Initialize({
  input: '#xPASSWORD_1',
  policy: {
    minimum_alphabetic: 1,
    minimum_numeric: 1,
    minimum_length: 8
  }
});
```
