const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withWidgetImage(config) {
  return withDangerousMod(config, [
    'android',
    (config) => {
      const drawableDir = path.join(
        config.modRequest.platformProjectRoot,
        'app/src/main/res/drawable'
      );

      fs.mkdirSync(drawableDir, { recursive: true });

      fs.copyFileSync(
        path.join(config.modRequest.projectRoot, 'assets/images/pri.png'),
        path.join(drawableDir, 'pri.png')
      );

      return config;
    },
  ]);
};