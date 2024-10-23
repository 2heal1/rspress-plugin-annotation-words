import React, { useState, useEffect } from 'react';
import { getTextNodes } from './utils';
import styles from './AnnotationWords.module.scss';
import { usePageData, } from 'rspress/runtime';
import { AnnotationWordsCard } from './AnnotationWordsCard';
import Loading from './Loading';
import IGNORE_LIST from './ignoreList';

declare const USER_DATA_PATH:string;

interface LinkItem {
  id: string;
  title: string;
  url: string;
}

export interface WordDetail {
  aliases?: {
    key: string;
  }[];
  description: string;
  related_meta: {
    docs: LinkItem[];
    links: LinkItem[];
  };
}
type WordsMap = {
  [key:string]:{
    id:string;
    lang:{
      [lang:string]:WordDetail
    }
  }
}
const CARD_WIDTH = 320;
const CARD_HEIHGT = 500;



async function fetchWordsMap(
): Promise<WordsMap> {
  const url = `${location.origin}/${USER_DATA_PATH}`;
  try {
    const res = await fetch(url);
    return res.json();
  } catch (e) {
    console.log(e);
    return { };
  }
}


declare global {
  var USER_IGNORE_WORDS: string[];
  var USER_IGNORE_PATHS: [string, string][];
}

const ignorePathRegs: RegExp[] = USER_IGNORE_PATHS.map(
  ([source, flags]) => new RegExp(source, flags),
);

function isCurrPathIgnored(): boolean {
  // with query
  const pathname = window.location.pathname + window.location.search;
  for (const pathReg of ignorePathRegs) {
    if (pathname.match(pathReg)) {
      return true;
    }
  }
  return false;
}

export default function AnnotationWords() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const [keyword, setKeyword] = useState('');
  const [keywordToIdMap, setKeywordToIdMap] = useState(new Map() as Map<string,WordDetail>);
  const [keywordToDetailMap, setKeywordToDetailMap] = useState(new Map()); // [keyword, detail]
  const [wordDetail, setWordDetail] = useState<WordDetail | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const ignoreWords = [...IGNORE_LIST, ...USER_IGNORE_WORDS];
  const { page } = usePageData();
  const closeDetailPanel = () => setVisible(false);

  useEffect(() => {
    if (!keyword || !keywordToIdMap.has(keyword)) {
      return;
    }

    async function fetchDetail() {
      if (keywordToDetailMap.has(keyword)) {
        setWordDetail(keywordToDetailMap.get(keyword));
        return;
      }
      try {
        setLoading(true);
        setWordDetail(null);
        const data = keywordToIdMap.get(keyword);
        if (!data) {
          throw new Error('fetch word detail failed');
        }
        setWordDetail(data);
        setKeywordToDetailMap((prev: Map<string, WordDetail>) => {
          prev.set(keyword, data);
          return prev;
        });
        setLoading(false);
      } catch (e) {
        console.log(e);
      }
    }

    fetchDetail();
  }, [keyword, page, keywordToIdMap]);

  const clearState = () => {
    setKeyword('');
    setVisible(false);
    setLoading(false);
    setWordDetail(null);
    setKeywordToDetailMap(new Map());
  };

  useEffect(() => {
    const el = document.getElementsByClassName('rspress-doc')[0] as HTMLElement;
    if (!el) {
      return;
    }
    if (isCurrPathIgnored()) {
      return;
    }
    const textNodes: Node[] = getTextNodes(el);
    const nodeMap = new Map();

    async function highlightWords() {
      const res = await fetchWordsMap();
      const highlightWords = Object.keys(res)
        .filter(item => !ignoreWords.includes(item))
        .map(item => item);
      const lang =  page.lang
      setKeywordToIdMap(
        new Map(Object.entries(res).map(item => [item[0], item[1].lang[lang]])),
      );
      // collect all the text nodes
      getTextNodes(el);
      const replacedMap = new Map<string, boolean>();
      textNodes.forEach(node => {
        const text = node.nodeValue;
        if (text) {
          let highlightText = text;
          // Replace all the keywords with span tag inlucding `styles.highlight` class name, notice: every keyword can only be replaced once
          highlightWords.forEach(word => {
            if (replacedMap.has(word)) return;
            const reg = new RegExp(`\\b${word}\\b`);
            let newHighlightText = highlightText.replace(
              reg,
              `<span class="${styles.highlight}">${word}</span>`,
            );
            if (newHighlightText !== highlightText) {
              replacedMap.set(word, true);
              highlightText = newHighlightText;
            }
          });

          if (highlightText === text) return;
          const fragment = document.createElement('span');
          // Replace only keyword with span tag and replace it back with the previous content
          let newEl = document.createElement('div');
          newEl.innerHTML = highlightText;
          let childNodeList = newEl.childNodes;
          Array.from(childNodeList).forEach(childNode => {
            if (
              (childNode as HTMLElement).classList?.contains(styles.highlight)
            ) {
              fragment.appendChild(childNode.cloneNode(true));
            } else {
              let textNode = document.createTextNode(
                childNode.textContent || '',
              );
              fragment.appendChild(textNode);
            }
          });
          node.parentNode?.replaceChild(fragment, node);
          nodeMap.set(node, fragment);
          // Trigger reflow to make sure the span is in the DOM tree
        }
        const spanChildren = el?.getElementsByClassName(
          styles.highlight,
        ) as HTMLCollectionOf<HTMLElement>;

        Array.from(spanChildren).forEach(spanChild => {
          const openDetailPanel = (e: MouseEvent) => {
            e.stopPropagation();
            if (loading) {
              return;
            }
            let { left, top } = spanChild?.getBoundingClientRect() || {};
            if (left + CARD_WIDTH >= window.innerWidth) {
              left = window.innerWidth - CARD_WIDTH - 100;
            } else {
              left = left + 50;
            }

            if (top + CARD_HEIHGT >= window.innerHeight) {
              top = window.innerHeight - CARD_HEIHGT - 50;
            }
            const targetKeyword = (e.target as HTMLElement)?.innerText;
            setKeyword(targetKeyword);
            setPosition({ left, top });
            setVisible(true);
            if (containerRef.current) {
              containerRef.current.scrollTo(0, 0);
            }
          };
          spanChild?.addEventListener('click', openDetailPanel);
        });
      });
      window.addEventListener('scroll', closeDetailPanel);
      window.addEventListener('click', closeDetailPanel);
    }
    highlightWords();
    return () => {
      clearState();
      // cleanup
      for (const [textNode, spanFragment] of nodeMap.entries()) {
        const text = textNode.textContent?.trim();
        if (text) {
          spanFragment.parentNode?.replaceChild(textNode, spanFragment);
          // remove event listener for span element in spanFragment
          const spanChildren = spanFragment?.getElementsByClassName(
            styles.highlight,
          ) as HTMLCollectionOf<HTMLElement>;
          Array.from(spanChildren).forEach(spanChild => {
            spanChild.removeEventListener('click', closeDetailPanel);
          });
          nodeMap.delete(textNode);
        }
      }
      window.removeEventListener('scroll', closeDetailPanel);
      window.removeEventListener('click', closeDetailPanel);
    };
  }, [page]);

  return (
    <>
      <div
        className={`${styles.container} ${styles.scrollbar}`}
        style={{
          display: visible ? 'block' : 'none',
          left: `${position.left}px`,
          top: `${position.top}px`,
        }}
        ref={containerRef}
        onClick={e => {
          e.stopPropagation();
          setVisible(true);
        }}
      >
        {wordDetail && <AnnotationWordsCard name={keyword} detail={wordDetail} />}
        {loading && (
          <div
            style={{
              height: '250px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'var(--rp-c-bg)',
            }}
          >
            <Loading />
          </div>
        )}
      </div>
    </>
  );
}
