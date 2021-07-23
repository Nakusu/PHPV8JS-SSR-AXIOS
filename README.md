# PHP V8JS VUE JS AXIOS SSR SOLUTION

* Your are using PHP V8JS for compile your javascript code in server side.
* You make api calls with axios and you would like to make them in server side with PHP V8JS.
* For make that, you need to allow V8JS to make http requests with axios. The default axios adapter is XMLHttpRequest (for web browser), but you need to swith it to http adapter if you would like to allow your nodejs server to use axios.

## Please visit this links for understood the situation :
* V8JS : https://github.com/phpv8/v8js
* AXIOS Adapter : https://github.com/axios/axios/issues/1180
* AXIOS XMLHttpRequest : https://github.com/i18next/i18next-xhr-backend/issues/281
* MODULE LOADER V8JS : https://github.com/phpv8/v8js/issues/447

## A "solution" of this problem ?
In my case, I doesn't success to switch correctly the axios adapter because http adapter need http/https library of nodejs (https://nodejs.dev/learn/the-nodejs-http-module). In this case (PHP V8JS) and in my opinion/researchs about it, it's not possible to use http nodejs library... 
For make my Apis call in server side, I inject the json results of them in the PHP javascript V8JS initialisation (it is not very clear, I prefere to show code for show you ^^).

## Example PHP RENDERER
```php
<?php
function render($path)
    {
        // APIS CALL
        $testApi = apicontroller::testApi();

        $renderer_source = File::get(base_path('node_modules/vue-server-renderer/basic.js'));
        $app_source = File::get(public_path('js/entry-server.js'));

        $v8 = new \V8Js();
        ob_start();

        $v8->setModuleLoader(function ($location) {
            return file_get_contents($location);
        });

        $js =
        // EOT { } is for array with json_encode()
        <<<EOT
            var process = { env: { VUE_ENV: "server", NODE_ENV: "production" } }; 
            this.global = { process: process }; 
            var url = "$path";
            const testApi = {$testApi};
        EOT;

        $v8->executeString($js);
        $v8->executeString($renderer_source);
        $v8->executeString($app_source);

        return ob_get_clean();
    }
```
## Example ENTRY-SERVER
```javascript
    import { createApp } from "./app";

    new Promise(async (resolve, reject) => {
    const {
        app,
        router,
        store,
    } = await createApp(testApi)
    // PASS IN ARGUMENT API CALL CONST
    router.push(url);
    router.onReady(() => {
        const matchedComponents = router.getMatchedComponents();
        if (!matchedComponents.length) {
        return reject({ code: 404 });
        }
        resolve(app);
    }, reject);
    })
    .then(app => {
        renderVueComponentToString(app, (err, res) => {
        print(res);
        });
    })
    .catch((err) => {
        print(err);
    });
```

## Example APP VUE JS
```javascript
    // default testapi set for client createApp usage
    export async function createApp(testapi = null) {
        // init your vuex store
        const store = createStore(testapi);

        sync(store, router);

        const app = new Vue({
            el: "#app",
            router,
            store,
            render: h => h(App),
            async beforeCreated() {
                await store.dispatch("getArticles");
                await store.dispatch("getJobs");
            },
        });

        return { app, router, store };

    }
```

# If you have another solution, I am interested