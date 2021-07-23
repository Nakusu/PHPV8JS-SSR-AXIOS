import Vue from 'vue';
import { createStore } from './store';
import axios from "axios";
import App from './components/App.vue';
import router from './router'
import { sync } from 'vuex-router-sync';

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