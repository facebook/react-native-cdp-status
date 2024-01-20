/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import lineColumn from 'line-column';
import { ReferenceFile, ReferenceLocation } from './ImplementationModel';

type CommentNode = {
  match: string;
  index: number;
  length: number;
  // 1-based
  line: number;
  // 1-based
  column: number;
  cleanedMatch: string;
};

export type CdpComment = ReferenceLocation & {
  cleanedText: string;
  hasAdditionalContent: boolean;
};

function extractCStyleComments(code: string, tagsOfInterest: string[]): Array<CommentNode> {
  const lineComment = '\\/\\/[^\n]*';
  const blockComment = '\\/\\*[\\s\\S]*?(?:\\*\\/|$)';
  const lineCommentBlock = `(?:^|\\n)[ \\t]*${lineComment}(?:\\n[ \\t]*${lineComment})*`;
  const inlineComment = '(?:[^\\n]*?)' + lineComment;
  
  const regex = new RegExp(`${lineCommentBlock}|${inlineComment}|${blockComment}`, 'g');

  const matches: Array<CommentNode> = [];
  const lc = lineColumn(code);
  for (const match of code.matchAll(regex)) {
    // Ignore comments that don't contain any tags of interest
    if (!tagsOfInterest.some((tag) => match[0].includes(tag))) {
      continue;
    }
    const { line, col } = lc.fromIndex(match.index!)!;
    matches.push({
      match: match[0],
      index: match.index!,
      length: match[0].length,
      line,
      column: col,
      cleanedMatch: cleanCommentSource(match[0]),
    });
  }
  return matches;
}

function cleanCommentSource(comment: string) {
  // Remove block comment start/end tokens
  comment = comment.replace(/^\/\*\*?/, '').replace(/\*\/$/, '')
    // Remove line comment start tokens
    .replace(/^\s*\/\/\s*/gm, '')
    // Remove leading asterisks from each line
    .replace(/^\s*\* ?/gm, '')
    // Remove leading/trailing newlines
    .replace(/^\n|\n$/g, '')
    // Remove trailing whitespace from all lines
    .replace(/[ \t]+$/gm, '')
    ;
  // Find and trim the minimum leading whitespace on any non-empty line
  let minLeadingWhitespace = Infinity;
  const lines = comment.split('\n');
  for (const line of lines) {
    if (line.trim() !== '') {
      const leadingWhitespace = line.match(/^\s*/)![0].length;
      minLeadingWhitespace = Math.min(leadingWhitespace, minLeadingWhitespace);
    }
  }
  // Remove the minimum leading whitespace from each line
  comment = lines.map((line) => line.slice(minLeadingWhitespace)).join('\n');
  return comment;
}

export type ParsedCdpComments = {
  commentsByCdpSymbol: Map<string, Array<CdpComment>>;
};

export function parseCdpComments(code: string): ParsedCdpComments {
  const comments = extractCStyleComments(code, ['@cdp']);
  const commentsByCdpSymbol = new Map<string, Array<CdpComment>>();
  for (const comment of comments) {
    const cdpTagMatches = comment.cleanedMatch.matchAll(/@cdp\s+([^\s]*[^\s.])/g);
    const symbolsSeen = new Set<string>();
    for (const cdpTagMatch of cdpTagMatches) {
      const cdpSymbol = cdpTagMatch[1];
      if (cdpSymbol != null) {
        // Ignore duplicate symbols within the same comment
        if (symbolsSeen.has(cdpSymbol)) {
          continue;
        }
        commentsByCdpSymbol.set(cdpSymbol, commentsByCdpSymbol.get(cdpSymbol) ?? []);
        commentsByCdpSymbol.get(cdpSymbol)!.push({
          line: comment.line,
          column: comment.column,
          // Further cleaned up version of the comment
          cleanedText: comment.cleanedMatch.replace(/^@cdp\s+/, ''),
          // Is there more to the comment than just the tag+symbol
          hasAdditionalContent: comment.cleanedMatch.length > cdpTagMatch[0].length,
        });
      }
    }
  }
  return {
    commentsByCdpSymbol,
  }
}

export type ParsedAndIndexedCdpComments = {
  commentsByCdpSymbol: Map<string, Array<CdpComment & ReferenceFile>>;
};

export function parseAndIndexCdpComments(files: Iterable<readonly [ReferenceFile, string]>): ParsedAndIndexedCdpComments {
  const commentsByCdpSymbol = new Map<string, Array<CdpComment & ReferenceFile>>();
  for (const [file, code] of files) {
    const comments = parseCdpComments(code);
    for (const [cdpSymbol, cdpComments] of comments.commentsByCdpSymbol) {
      commentsByCdpSymbol.set(cdpSymbol, commentsByCdpSymbol.get(cdpSymbol) ?? []);
      for (const cdpComment of cdpComments) {
        commentsByCdpSymbol.get(cdpSymbol)!.push({
          ...cdpComment,
          ...file,
        });
      }
    }
  }
  return {
    commentsByCdpSymbol,
  }
}
