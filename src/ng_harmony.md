# Ng-Harmony-Decorate

## Development

![Harmony = 6 + 7;](logo.png "Harmony - Fire in my eyes")

A (sample) ES7-proposal (babel-feature) decorators collection mimicking the upcoming Angular 2.0 code-style.
Write your own, contribute, and feel like a hero ... it's easy!

## Concept

This extra lib to ng-harmony will serve the purpose of providing decorators in Angular 2 style and more, designed for own purposes ...

Use it in conjunction with

	* [literate-programming](http://npmjs.org/packages/literate-programming "click for npm-package-homepage") to write markdown-flavored literate JS, HTML and CSS
	* [jspm](https://www.npmjs.com/package/jspm "click for npm-package-homepage") for a nice solution to handle npm-modules with ES6-Module-Format-Loading ...

## Files

This serves as literate-programming compiler-directive

[build/index.js](#Compilation "save:")

You can extend these literate-programming directives here ... the manual is (on jostylr@github/literate-programming)[https://github.com/jostylr/literate-programming]

## Compilation

The Decorator foos are annotation-driving translators that allow you to use Angular 2.0 like styles!

Import all needed stuff

```javascript
import { Reflect } from "reflect-metadata";
import { Log, NotImplementedError, VoidError, InMemoryTypeValidationError} from "ng-harmony-log";
```

The `Tag-Decorator` is angulars directive-mechanism

```javascript
export function Component(val) {
	return function decorator(target) {
		let mod = angular.module(val.module) || angular.module(val.module, []);
		mod.directive(val.selector, () => {
			return {
				controller: val.controller,
				controllerAs: val.controllerAs || target.CTRL_AS || null,
				restrict: val.restrict || "A",
				replace: val.replace || false,
				templateUrl: val.templateUrl || null,
				template: val.template || null,
				scope: val.scope === true ? {} : (val.scope || null)
			};
		});
	}
}

export function Controller(val) {
	return function decorator(target) {
		target.CTRL_AS = val.controllerAs || null;
		
		let r = {};
		r[val.module] = {
			type: "controller",
			name: val.name || target.name,
		}
		target.$register = r;
		if (val.deps !== null && typeof val.deps !== "undefined") {
			target.$inject = val.deps;
		}
	}
}

export function Service(val) {
	return function decorator(target) {
		let r = {};
		r[val.module] = {
			type: "service",
			name: val.name
		}
		target.$register = r;
		if (val.deps !== null && typeof val.deps !== "undefined") {
			target.$inject = val.deps;
		}
	}
}
```

A Mixin Decorator

`Usage:`
@Mixin(UtilityClass)
class Useful extends RockSolid {}

@Mixin(Util1, Util2, Util3)
class UtilCollection extends DOMElement

```javascript
export function Mixin(...mixins) {
	return function decorator(target) {
		for (let [i, mixin] of mixins.entries()) {
			Object.getOwnPropertyNames(mixin.prototype).forEach((k, j) => {
				(target.prototype[k] === null || typeof target.prototype[k] === "undefined") &&
				Object.defineProperty(target.prototype, k, Object.getOwnPropertyDescriptor(mixin.prototype, k));
			});
		}
	}
}
```

The Logger-Mixin Decorator

Subsequently your class will provide a `log`-instance method.
The log-method expects 1 config-Object and an optional Error-Instance:
Config Obj: { level, msg }

* "level": "debug|info|warn|error ..." see bunyan on npm for details
* "msg": "My Msg describing a situation deserving attention"

Also the Decorator expects you to provide:
{ 
	loggerName: "string",
	environment: "development|production",
	npmPackageVersion: "your package.json version nr",
	"remoteLoggerToken": "your_Rollbar.com_appToken"
}

RemoteLoggerToken is optional.

```javascript
export function Logging(config) {
	return function decorator(target) {
		target.prototype.log = (function({ level, msg }, e = {}) {
			this.Logger[level](e, msg);
		}).bind(target.prototype);
		Object.defineProperty(target.prototype, "Logger", {
			value: Log.create.call(target.prototype, {
				loggerName: config.loggerName,
				rollbarToken: config.remoteLoggerToken || null,
				environment: config.environment,
				npmPackageVersion: config.npmPackageVersion
			}),
			enumerable: true
		});
		
	}
}
```

Method-Decorator to create Controller based Eventing like so:

@Evented({
	selector: "#myCSS.selector > section *:first-child:not(:last-child)",
	type: "click|..." - the usual events, for all events see fat/bean
	delegate: "li.repeated-item a.subitem" - provides the $scope.n index nr
})
myFn () { return "business as usual"; }

```javascript
export function Evented (...o) {
	return function decorator (target, prop, descriptor) {
		target.constructor.EVENTS = target.constructor.EVENTS || [];
		o.forEach((ev) => { target.constructor.EVENTS.push({
			ev: ev,
			fn: prop
		}); });
	}
}
```

## CHANGELOG
*v0.4.0* Getting rid of the fancy stuff
*v0.3.13* Publish bump
*v0.3.12* More Debugging
*v0.3.11* Debugging n Adaption Session, getting rid of faulty UniqueArray
*v0.3.10* Debug
*v0.3.9* Pluggable
*v0.3.8* UniqueArray
*v0.3.7* Mixin standalone, PubSub
*v0.3.6* IO/Model-Decorator, Derived/Model-Decorator
*v0.3.3* Nullable Decorator plus integration of nullable and set null in Validate
*v0.3.2* Differentiation SubModel or Primitive in Validate-director
*v0.3.1* More specific error, adequate import, "Content"-Validation-Method-check
*v0.3.0* Renaming to correct term `decorator` instead of `annotate`
    * Stripping Component of Controller-registration (double-usage no longer possible)
    * Renaming Component to Tag in order to be more semantic in this changing thingy
    * Adding `Validator-Mixin`
*v0.2.2* Bugfix in Component (Logic)
*v0.1.9* Battle Testing and Debugging on the way
*v0.1.10* Renaming decision of directive to
