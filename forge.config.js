module.exports = {
    packagerConfig: {
        name: 'RePhrase',
        executableName: 'rephrase',
        icon: './assets/icon',
        asar: true,
    },
    rebuildConfig: {},
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            config: {
                name: 'RePhrase',
            },
        },
        {
            name: '@electron-forge/maker-zip',
            platforms: ['darwin'],
        },
        {
            name: '@electron-forge/maker-dmg',
            config: {
                name: 'RePhrase',
                format: 'ULFO',
            },
        },
    ],
};
