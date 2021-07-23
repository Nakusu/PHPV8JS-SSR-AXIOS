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