import {test, expect, _electron} from '@playwright/test';

let electronApp: Awaited<ReturnType<typeof _electron.launch>>;
let mainPage: Awaited<ReturnType<typeof electronApp.firstWindow>>; // to run queries against this page in runtime.

// to prevent flickering: electronApp.window first checks browserWindow was initialized at main.ts and won't reach createMenu() at bottom.
//so we wait until preload script is loaded and electron object is exposed in the window, which happens at the beginning of the preload script. this way we can be sure that the mainWindow was created and the menu was set before running any tests-e2e. otherwise, if we run tests-e2e before the menu is set, we may get inconsistent results because some tests-e2e may rely on the menu being set, and if it's not set yet, those tests-e2e may fail or behave unexpectedly.
async function waitForPreloadScript() {
  return new Promise((resolve) => {
    const interval = setInterval(async () => {
      const electronBridge = await mainPage.evaluate(() => {
        return (window as Window & { electron?: any }).electron; // check window has loaded the preload per 100ms.
      });
      if (electronBridge) {
        clearInterval(interval); // if the electronBridge is initialized, stop the interval.
        resolve(true); // stop awaiting by resolving the promise and move on with my test.
      }
    }, 100);
  });
}


test.beforeEach(async () => {
  electronApp = await _electron.launch({
    args: ['.'],
    env: { NODE_ENV: 'development' },
  });
  mainPage = await electronApp.firstWindow();
  await waitForPreloadScript();
});

test.afterEach(async () => {
  await electronApp.close();
});

test('Custom window should minimize the mainWindow', async () => {
  await mainPage.click('#minimize');
  const isMinimized = await electronApp.evaluate( (electron): boolean => {
    return electron.BrowserWindow.getAllWindows()[0].isMinimized();
  });

  expect(isMinimized).toBeTruthy();
});


test('should create a custom menu', async () => {
  const menu = await electronApp.evaluate((electron) => {
    return electron.Menu.getApplicationMenu();
  });
  expect(menu).not.toBeNull();
  expect(menu?.items).toHaveLength(2);
  expect(menu?.items[0].submenu?.items).toHaveLength(2);
  expect(menu?.items[1].submenu?.items).toHaveLength(3);
  expect(menu?.items[1].label).toBe('View');
});


// test('has title', async ({ page }) => {
//   await page.goto('https://playwright.dev/');
//
//   // Expect a title "to contain" a substring.
//   await expect(page).toHaveTitle(/Playwright/);
// });

// test('get started link', async ({ page }) => {
//   await page.goto('https://playwright.dev/');
//
//   // Click the get started link.
//   await page.getByRole('link', { name: 'Get started' }).click();
//
//   // Expects page to have a heading with the name of Installation.
//   await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
// });
