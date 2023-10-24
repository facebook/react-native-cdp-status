/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const COPYRIGHT_DECLARATION = 'Copyright (c) Meta Platforms, Inc. and affiliates.';
const COPYRIGHT_HEADER = `/**
 * ${COPYRIGHT_DECLARATION}
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */`;

module.exports = {
  constants: {
    COPYRIGHT_HEADER,
    COPYRIGHT_DECLARATION,
  },
  meta: {
    messages: {
      requireCopyright: 'All files must have a copyright header',
      requireCompoundCopyright: `This copyright header must include: ${COPYRIGHT_HEADER}`,
    },
    fixable: 'code',
  },
  create(context) {
    return {
      Program() {
        const src = context.getSourceCode();
        const hasShebang = src.text.startsWith('#!');

        const suspectedCopyright = src.getAllComments().filter(block => 
          block.type == 'Block' && /Copyright/i.test(block.value)
        );

        const hasHeader = suspectedCopyright.length > 0;

        let hasCopyrightMentionMeta = false;
        let copyrightCount = 0;
        let loc = {line: 0, column: 0};

        if (hasHeader) {
          const header = suspectedCopyright[0].value;
          loc = suspectedCopyright[0].loc.start;

          const hasValidHeader = COPYRIGHT_HEADER === `/**${header}*/`;
          if (hasValidHeader) {
            return;
          }

          copyrightCount = header.match(/Copyright/g).length;
          hasCopyrightMentionMeta = /Copyright.+\bMeta\b/.test(header);

          const hasCorrectCompoundHeader = copyrightCount > 0 && header.indexOf(COPYRIGHT_DECLARATION) !== -1;
          if (hasCorrectCompoundHeader) {
            return;
          }
        }

        // We can scorch earth here and do the right thing.
        const canRewrite = copyrightCount === 1 && hasCopyrightMentionMeta;

        if (!canRewrite && copyrightCount > 0) {
          if (hasCopyrightMentionMeta) {
            // We give up here and depend on the user to fix this.
            context.report({
              loc,
              messageId: 'requireCompoundCopyright',
            });
          } else {
            context.report({
              loc,
              messageId: 'requireCompoundCopyright',
              fix(fixer) {
                return fixer.replaceTextRange([0, 3], `/**\n * ${COPYRIGHT_DECLARATION}\n *\n`);
              }
            });
          }
          return;
        }

        context.report({
          loc,
          messageId: 'requireCopyright',
          fix(fixer) {
            if (suspectedCopyright.length > 0) {
              return fixer.replaceTextRange(suspectedCopyright[0].range, COPYRIGHT_HEADER);
            }
            return fixer.insertTextAfterRange(
              hasShebang ? [0, src.text.indexOf('\n') + 1] : [0, 0], COPYRIGHT_HEADER + '\n\n'
            );
          }
        });
      },
    };
  },
};
