Joins the same window group as the specified window
# Example
```js
async function createWin(uuid) {
    const app = await fin.Application.create({
        name: 'myApp',
        uuid: uuid,
        url: 'https://www.openfin.co',
        autoShow: true
    });
    await app.run();
    return await app.getWindow();
}

async function joinGroups() {
    const mainWin = await createWin('app-1');
    const appWin = await createWin('app-2');
    return await mainWin.joinGroup(appWin);
}

joinGroups().then(() => console.log('Windows are connected')).catch(err => console.log(err));
```
