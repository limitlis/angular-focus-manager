ux.service('focusKeyboard', function ($window) {

        var registeredKeys = {};

        document.addEventListener('keydown', function (evt) {

            var keys = '';
            if(evt.shiftKey) {
                keys += 'shift+';
            }
            if(evt.keyCode === 9) {
                keys += 'tab';
            }

            var opts =  registeredKeys[keys];
            if(opts && opts.callback && !opts.muted) {
                evt.preventDefault();
                evt.stopPropagation();

                opts.callback();
            }
        });

        function register(shortcut, callback) {
            registeredKeys[shortcut.trim().toLowerCase()] = {
                muted: false,
                callback: callback
            };
        }

        function unregister(shortcut) {
            delete registeredKeys[shortcut.trim().toLowerCase()];
        }

        function mute(shortcut) {
            var key = registeredKeys[shortcut.trim().toLowerCase()];
            if(key) {
                key.muted = true;
            }
        }

        function unmute(shortcut) {
            var key = registeredKeys[shortcut.trim().toLowerCase()];
            if(key) {
                key.muted = false;
            }
        }

        this.register = register;
        this.unregister = unregister;
        this.mute = mute;
        this.unmute = unmute;
    })
    .run(function (focusKeyboard, focusModel) {
        focusKeyboard.register('TAB', focusModel.next);
        focusKeyboard.register('SHIFT+TAB', focusModel.prev);
    });

