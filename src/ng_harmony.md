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
Interface Emulation
`Usage:`
@Implements(EmailInterface)
class EmailValidator

@Implements(PhoneNrInterface, SIPNrInterface, SocialInterface)
class ContactValidator

-> Hereby you can actually force implementation, as the defaulted methods will
throw a `NotImplementedError` unless overridden

```javascript
export function Implements(...interfaces) {
	return function decorator(target) {
		for (let [i, Interface] of interfaces.entries()) {
			Object.getOwnPropertyNames(Interface.prototype).forEach((k, j) => {
				(target.prototype[k] === null || typeof target.prototype[k] === "undefined") &&
				Object.defineProperty(target.prototype, k, {
					value: () => { throw new NotImplementedError(k); },
					enumerable: true
				});
			});
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

Also the Decorator expects you to provide a default debug level:
* debug
* info
* warn
* error

This way you can control/tune output of console.msgs in a more global manner
```javascript
export function Logging(config) {
	return function decorator(target) {
		target.prototype.log = (function({ level, msg }, e = {}) {
			this.Logger[level](e, msg);
		}).bind(target.constructor);
		Log.create.call(target.constructor, {
			loggerName: config.loggerName,
			rollbarToken: config.remoteLoggerToken || null,
			environment: config.environment,
			npmPackageVersion: config.npmPackageVersion
		});
	}
}
```

Validator class property decorator

```javascript
export function Validate() {
	return function decorator(target, prop, descriptor) {
		let isNullable = (Reflect.hasMetadata("nullable", target[prop]) && Reflect.getMetadata("nullable", target[prop]));

		descriptor.configurable = true;
		descriptor.enumerable = true;
		descriptor.writable = true;
		descriptor.get = () => {
			return target[prop];
		}
		descriptor.set = (val) => {
			if (val === null || typeof val === "undefined") {
				if (isNullable) {
					target[prop] = val;
					return;
				}
				else {
					throw new VoidError();
				}
			}
			try {
				if (typeof this[`_${prop}`] === "function") {
					this[`_${prop}`](val);
				}
			}
			catch (e) {
				if (e.level === "info" || e.level ==="debug") {
					this.log(e);
					return;
				} else {
					throw e;
				}
			}
			if (Reflect.hasMetadata("typeof", target[prop])) {
				let metadata = Reflect.getMetadata("typeof", target[prop]);
				let t = metadata.type.name.toLowerCase();
				if (val instanceof metadata.type) {
					target[prop] = val;
				} else {
					try {
						target[prop] = new metadata.type(val);
					}
					catch (e) {
						this.log(new InMemoryTypeValidationError());
						throw e;
					}
				}
			}
		}
	}
}
```

The Nullable Property Decorator allows for properties that are to be validated by the Validator Decorator
to be null and be valid still

```javascript
export function Nullable () {
	return function decorator(target, prop, descriptor) {
		if (typeof target[prop] === "undefined") {
			target[prop] = null;
		}
		Reflect.defineMetadata("nullable", true, target, prop);
	}
}

export function Transform(derive) {
	return function decorator(target, prop, descriptor) {
		let isNullable = (Reflect.hasMetadata("nullable", target[prop]) && Reflect.getMetadata("nullable", target[prop]));

		descriptor.configurable = true;
		descriptor.enumerable = false;
		descriptor.writable = true;
		descriptor.get = () => {
			if (target[prop] === null || typeof target[prop] === "undefined") {
				if (isNullable) {
					return null;
				} else {
					throw new VoidError();
				}
			}
			return target[`_$(prop)`];
		}
		descriptor.set = (_o) => {
			try {
				if (_o === null || typeof _o === "undefined") {
					if (isNullable) {
						return;
					}
					else {
						throw new VoidError("No Input given");
					}
				}
				target[`_$(prop)`] = derive(_o);
			}
			catch (e) {
				if (e.level === "info" || e.level ==="debug") {
					this.log(e);
					return;
				} else {
					throw e;
				}
			}
		}
	}
}
```
`Usage: `
@AjaxMap([{
		method: 'GET',
		url: 'api/v2/datastuff'
	}, {
		method: 'POST',
		url: 'api/v2/datastuff',
		data: [...]
	}])
class MyAjaxService extends AjaxService {}
```javascript

export function AjaxMap(o) {
	return function decorator (target, prop, descriptor) {
		target.MAP = o;
	}
}

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
