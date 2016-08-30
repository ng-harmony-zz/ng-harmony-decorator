import "ng-harmony-log";
import "reflect-metadata";

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
				scope: val.scope === true ? {} : val.scope || null
			};
		});
	};
}

export function Controller(val) {
	return function decorator(target) {
		let r = {};
		r[val.module] = {
			type: "controller",
			name: val.name
		};
		target.$register = r;
		if (val.deps !== null && typeof val.deps !== "undefined") {
			target.$inject = val.deps;
		}
	};
}

export function Service(val) {
	return function decorator(target) {
		let r = {};
		r[val.module] = {
			type: "service",
			name: val.name
		};
		target.$register = r;
		if (val.deps !== null && typeof val.deps !== "undefined") {
			target.$inject = val.deps;
		}
	};
}

export function Transient(val) {
	return function decorator(target) {
		target.LISTENERS = val;
	};
}

export function Mixin(val) {
	return function decorator(target) {
		if (Array.isArray(val)) {
			target.mixin(...val);
		} else {
			target.mixin(val);
		}
	};
}

export function Implements(val) {
	return function decorator(target) {
		if (Array.isArray(val)) {
			target.implement(...val);
		} else {
			target.implement(val);
		}
	};
}

export function Logging() {
	return function decorator(target) {
		target.mixin(Log);
	};
}

export function Validate() {
	return function decorator(target, prop, descriptor) {
		let isNullable = Reflect.hasMetadata("nullable", p) && Reflect.getMetadata("nullable", p);

		if (isNullable) {
			target[prop] = null;
		}

		descriptor.configurable = true;
		descriptor.enumerable = true;
		descriptor.writable = true;
		descriptor.get = () => {
			return target[prop];
		};
		descriptor.set = val => {
			if (val === null || typeof val === "undefined") if (isNullable) {
				return;
			} else {
				throw new VoidError();
			}
			try {
				if (typeof this[`_${ prop }`] !== "undefined" && this[`_${ prop }`] !== null) this[`_${ prop }`](val);
			} catch (e) {
				if (e.level === "info" || e.level === "debug") {
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
					target = new metadata.type(val);
				} else if (typeof val == t) {
					target = val;
				} else {
					throw new InMemoryTypeValidationError();
				}
			}
		};
	};
}
export function Nullable() {
	return function decorator(target, prop, descriptor) {
		Reflect.defineMetadata("nullable", true, target, prop);
	};
}

//# sourceMappingURL=umd_module.js.map