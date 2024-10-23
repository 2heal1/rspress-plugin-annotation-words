import React, { WordDetail } from './AnnotationWords';
import styles from './AnnotationWords.module.scss';
import DocSvg from '../assets/doc.svg';
import LinkSvg from '../assets/link.svg';
import { useEffect, useRef } from 'react';

export function AnnotationWordsCard({
  detail,
  name,
}: {
  detail: WordDetail;
  name: string;
}) {
  const {
    related_meta: { docs, links },
    description,
    aliases = [],
  } = detail;
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.scrollTo(0, 0);
    }
  }, [detail]);
  return (
    <section className={styles.card} ref={cardRef}>
      <div className={styles.cardTop}>
        <h3 className={styles.title}>{name}</h3>
        <div className={styles.alias}>
          {aliases?.map(({ key }, index) => (
            <span key={key}>
              {key}
              {/* add / for last item */}
              {index < aliases.length - 1 && (
                <span className={styles.delimeter}>/</span>
              )}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.cardContent}>
        <p className={styles.description}>{description}</p>
        {docs.length > 0 && (
          <div className={styles.relativeDocs}>
            <h4>docs</h4>
            <ul>
              {docs.map(({ title, url }) => (
                <li key={title}>
                  <div>
                    <img src={DocSvg} alt="Doc Svg" />
                  </div>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    {title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {links.length > 0 && (
          <div className={styles.relativeLinks}>
            <h4>related links</h4>
            <ul>
              {links.map(({ title, url }) => (
                <li key={title}>
                  <div
                    style={{
                      background: 'rgb(225, 234, 255)',
                      borderRadius: '6px',
                    }}
                  >
                    <img src={LinkSvg} alt="Link Svg" />
                  </div>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    {title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
