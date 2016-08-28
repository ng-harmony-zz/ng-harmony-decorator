
# Ng-Harmony-Decorate
=====================

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
import "ng-harmony-log";
```

The `Tag-Decorator` is angulars directive-mechanism

```javascript
export function Tag(val) {
	return function decorator(target) {
		let mod = angular.module(val.module) || angular.module(val.module, []);
		mod.directive(val.selector, () => {
			return {
				controller: val.ctrl,
				restrict: val.restrict || "A",
				replace: val.replace || false,
				templateUrl: val.templateUrl || null,
				template: val.template || null,
				scope: val.scope === true ? {} : (val.scope || null)
			}
		});

	}
}

export function Controller(val) {
	return function decorator(target) {
		let r = {};
		r[val.module] = {
			type: "controller",
			name: val.name
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

The Transient-Mixin for the Route/Stateful-Controllers

`Usage:`
Transient([{
	css: "body > myContainer > myComponent:nth-child(3)",
	uid: "MyContainer.MyComponent3"
}, {
	css: "body > .easilySelectable",
	uid: "EasilySelectable"
}])

```javascript
export function Transient(val) {
	return function decorator(target) {
		target.LISTENERS = val;
	}
}
```

A Mixin Decorator

`Usage:`
@Mixin(UtilityClass)
class Useful extends RockSolid {}

@Mixin([Util1, Util2, Util3])
class UtilCollection extends DOMElement

```javascript
export function Mixin(val) {
	return function decorator(target) {
		if (Array.isArray(val)) {
			target.mixin(...val);
		} else {
			target.mixin(val);
		}
	}
}
```
Interface Emulation
`Usage:`
@Implements(EmailInterface)
class EmailValidator

@Implements(PhoneNrInterface, SIPNrInterface, SocialInterface)
class ContactValidator

-> Hereby you can actually force implementation, as the defaulted methods will
throw a `NotImplementedError` unless overridden

```javascript
export function Implements(val) {
	return function decorator(target) {
		if (Array.isArray(val)) {
			target.implement(...val);
		} else {
			target.implement(val);
		}
	}
}
```

The Logger-Mixin Decorator

Subsequently your class will provide a `log`-instance method.
The log-method expects 1 param, usually an Error-Object.

Minimal requirements of the err-obj:

* "level": "debug|info|warn|error",
* "name": "MyInformationalError",
* "message": "My Msg describing a situation deserving attention"

```javascript
export function Logging() {
	return function decorator(target) {
		target.mixin(Log);
	}
}
```

Validator class property decorator

```javascript
export function validate() {
	return function decorator(target, prop, descriptor) {
		descriptor.configurable = true;
		descriptor.enumerable = true;
		descriptor.writable = true;
		descriptor.get = () => {
			return target;
		}
		descriptor.set = (val) => {
			try {
				if (typeof this[`_${prop}`] !== "undefined" && this[`_${prop}`] !== null)
					this[`_${prop}`](val);
			}
			catch (e) {
				if (e.level === "info" || e.level ==="debug") {
					this.log(e);
				} else {
					throw e;
				}
			}
			if (Reflect.hasMetadata("typeof", target)) {
				let metadata = Reflect.getMetadata("typeof", target);
				let t = metadata.type.name.toLowerCase();
				if (val instanceof metadata.type) {
					target = new metadata.type(val);
				} else if (typeof val == t) {
					target = val;
				} else {
					throw new InMemoryTypeValidationError();
				}
			}
		}
	}
}
```

## CHANGELOG
*v0.3.2* Differentiation SubModel or Primitive in Validate-director
*v0.3.1* More specific error, adequate import, "Content"-Validation-Method-check
*v0.3.0* Renaming to correct term `decorator` instead of `annotate`
    * Stripping Component of Controller-registration (double-usage no longer possible)
    * Renaming Component to Tag in order to be more semantic in this changing thingy
    * Adding `Validator-Mixin`
*v0.2.2* Bugfix in Component (Logic)
*v0.1.9* Battle Testing and Debugging on the way
*v0.1.10* Renaming decision of directive to component
