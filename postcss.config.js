module.exports = ( ctx ) => {
  if ( /admin\.css$/.test( ctx.file ) ) {
    return {
      plugins: {
        'postcss-import': {
          plugins: [
            require( 'stylelint' )( {
              /* your options */
            } ),
          ],
        },
        'tailwindcss/nesting': {},
        'postcss-extend': {},
        'postcss-preset-env': {
          stage: 2,
          features: {'nesting-rules': false},
        },
        'postcss-reporter': {clearReportedMessages: true},
      },
    };
  } else {
    return {
      plugins: {
        'postcss-import-ext-glob': {},
        'postcss-import': {
          plugins: [
            require( 'stylelint' )( {
            /* your options */
            } ),
          ],
        },
        'tailwindcss/nesting': {},
        'postcss-extend': {},
        'postcss-preset-env': {
          stage: 2,
          features: {'nesting-rules': false},
        },
        'postcss-reporter': {clearReportedMessages: true},
      },
    };
  }
};
