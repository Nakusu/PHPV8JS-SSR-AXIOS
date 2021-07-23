# PHP V8JS VUE JS AXIOS SSR SOLUTION

## Example PHP RENDERER
```
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
```
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
```
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