![Harmony = 6 + 7;](src/logo.png "Harmony - Fire in my eyes")

#CHECK OUT THE NEW DEMO
* [code](http://www.github.com/ng-harmony/ng-harmony-demo)
* [in_the_wild](http://joehannes-job.github.io/compucorp)


## Synopsis

Typescript or Angular > 1 Style Decorators for AngularJS

Just for clarification because I'm seeing more downloads on decorator than on the other repos, especially core/controller:

These Decorators are designed to work in conjunction with ng-harmony-core or other ng-harmony-* respectively.
All the decorators themselves achieve is very little usually:
* adding the given objs as a static class prop (which is then worked on in core/controller/log ...)
* ...

## Code Example

```javascript
import { EventedController as Ctrl } from "ng-harmony-controller";
import { Component, Controller, Loggging, Evented } from "ng-harmony-decorator";
```

We can use this lib in such a way *[...]*

```javascript
@Component({
    module: "compucorp",
    selector: "mediaitem",
    restrict: "E",
    replace: true,
    controller: "MediaItemCtrl",
    template: MediaItemTpl
})
@Controller({
    module: "compucorp",
    name: "MediaItemCtrl",
    controllerAs: "MediaItem",
})
@Logging({
    loggerName: "MediaItemLogger",
    ...Config
})
export class MediaItemCtrl extends Ctrl {
    constructor(...args) {
        super(...args);
        this.$scope.albumcardVisible = false;
        this.$scope.artistcardVisible = false;
        this.$scope.$on("change", this.handleEvent.bind(this));
    }

    handleEvent (ev, { scope, triggerFn, triggerTokens }) {
        this.log({
            level: "info",
            msg: "handlingChildEvent"
        });
        if (scope._name.fn === "ArtistCardCtrl" && triggerTokens.type === "click") {
            this.$scope.artistcardVisible = false;
        } else if (scope._name.fn === "AlbumCardCtrl" && triggerTokens.type === "click") {
            this.$scope.albumcardVisible = false;
        }
        this._digest();
    }

    @Evented({
        selector: "section.bg-image-n--mediaitem",
        type: "click",
        delegate: null
    })
    openCard () {
        this.$scope[`${this.$scope.model.type}cardVisible`] = true;
        this._digest();
    }
}
```

## License

MIT
