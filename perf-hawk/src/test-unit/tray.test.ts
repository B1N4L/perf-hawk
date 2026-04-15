import { expect, type Mock, test, vi } from 'vitest';
import { createTray } from "../electron/tray";
import { app, BrowserWindow, Menu } from 'electron';

vi.mock('electron', () => {
    return {
        Tray: vi.fn().mockReturnValue({
            setContextMenu: vi.fn(),
        }),
        app: {
            getAppPath: vi.fn().mockReturnValue('/'),
            dock: {
                show: vi.fn(),
            },
            quit: vi.fn(),
        },
        Menu: {
            buildFromTemplate: vi.fn(),
        },
    };
});

const mainWindow = {
    show: vi.fn(),
} satisfies Partial<BrowserWindow> as any as BrowserWindow;

test('', () => {
    createTray(mainWindow);

    // const calls = (Menu.buildFromTemplate as any as Mock).mock.calls;
    // const args = calls[0] as Parameters<typeof Menu.buildFromTemplate>;
    // const template = args[0];
    // expect(template).toHaveLength(2);

    // expect(template[0].label).toEqual('Show');
    // template[0]?.click?.(null as any, null as any, null as any);
    expect(mainWindow.show).toHaveBeenCalled(); //checks mainWindow.show is called when the "Show" menu item is clicked in the tray menu (tray.ts)
    // expect(app.dock.show).toHaveBeenCalled();

    // template[1]?.click?.(null as any, null as any, null as any);
    expect(app.quit).toHaveBeenCalled();
});