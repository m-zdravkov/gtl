## Code style specification ##

The following guide/article details the guidelines that are to be followed when developing code in
the API in TypeScript.

https://github.com/excelmicro/typescript

### Linting ###
The codestyle link above provides a tslint.json file that has been pushed to git and can be found 
in the root of the API. If it can not be found there for any reason, it is the developer's 
responsibility to create the file and use it.

The package.json file in the API requires the tslint package that will make use of the above 
mentioned tslint.json in order to provide us with proper linting. Webstorm might require the 
developer to enable tslint in the settings in order for it to run. This can be done in 
Settings -> Languages & Frameworks -> TypeScript -> TSLint -> Tick _Enable_.
The configuration file setting can be left on _Search for tslint.json_, however it is advised to
point to it directly using the _Configuration file_ option below.

During development try to leave the code in a better state than it was before 
(within reasonable range).

### Line endings ###
Prefer to use _CR
LF_ for line endings

## Overrides/Extensions ##
Company and project specific rules that take precedence over the above specified code style:

### Loops ###
* Avoid the use of for-in loops at all costs.
* Prefer to use Array.prototype.forEach for simple iterations.
* Prefer to use while(i--) for long arrays as this provides the best performance
