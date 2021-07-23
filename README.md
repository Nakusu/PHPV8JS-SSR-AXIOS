<h1>PHP V8JS VUE JS AXIOS SSR SOLUTION</h1>
<ul>
    <li>Your are using PHP V8JS for compile your javascript code in server side.</li>
    <li>You make api calls with axios and you would like to make them in server side with PHP V8JS.</li>
    <li>For make that, you need to allow V8JS to make http requests with axios. The default axios adapter is XMLHttpRequest (for web browser), but you need to swith him to http adapter if you would like to allow your nodejs server to make http requests.</li>
    <li>Please visit this links for understood the situation :</li>
    <li>V8JS : https://github.com/phpv8/v8js</li>
    <li>AXIOS Adapter : https://github.com/axios/axios/issues/1180</li>
    <li>AXIOS XMLHttpRequest : https://github.com/i18next/i18next-xhr-backend/issues/281</li>
    <li>MODULE LOADER V8JS : https://github.com/phpv8/v8js/issues/447</li>
</ul>
<h2>- A "solution" of this problem ?</h2>
<p>
    In my case, i doesn't success to switch correctly the adapter of axios because http adapter need to have http/https library of nodejs (https://nodejs.dev/learn/the-nodejs-http-module). In this case (PHP V8JS), in my opinion and my researchs about, it's not possible...
    For make my Apis call in server side, i inject the json results of them in the PHP javascript V8JS initialisation (it is not very explicit, I prefere to show code ^^).
</p>
<h2>- Example PHP RENDERER</h2>
=======
<p>
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
            <<<EOT
            var process = { env: { VUE_ENV: "server", NODE_ENV: "production" } }; 
            this.global = { process: process }; 
            var url = "$path";
            // { } is for array with json_encode()
            const testApi = {$testApi};
            EOT;

            $v8->executeString($js);
            $v8->executeString($renderer_source);
            $v8->executeString($app_source);

            return ob_get_clean();
        }
</p>

<h2>- Example ENTRY-SERVER</h2>
<p>
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
</p>

<h2>- Example APP VUE JS</h2>
<p>
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
</p>